// public/puzzles에 퍼즐 파일을 읽고 쓰는 Node 전용 계층.
// 나중에 DB로 옮기면 이 파일만 바꾸면 된다.

import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, sep } from "node:path";
import type { StoredPuzzle } from "../../src/types/sudoku";
import { makePuzzleKey, makePuzzlePath } from "../../src/lib/puzzleKey";
import { createPuzzleRecord, serializePuzzle, validatePuzzle, type PuzzleDraft } from "../../src/lib/puzzleRecord";

export const PUZZLE_DIR = join(import.meta.dirname, "../../public/puzzles");

export type PuzzleIndex = Record<string, number[]>;

const ENTRY_RE = /^(\d+x\d+\/[a-z]+(?:-[a-z]+)*\/\d+)\/(\d{4,})\.json$/;
const FILE_RE = /^(\d{4,})\.json$/;

// ---------- index ----------

export function buildPuzzleIndex(dir = PUZZLE_DIR): PuzzleIndex {
  const index: PuzzleIndex = {};
  for (const entry of readdirSync(dir, { recursive: true }) as string[]) {
    const rel = entry.split(sep).join("/");     // Windows 경로 구분자 대응
    const m = ENTRY_RE.exec(rel);
    if (!m) continue;                            // index.json, README.md 등은 제외
    (index[m[1]] ??= []).push(Number(m[2]));
  }
  // 키와 번호를 정렬해 매번 같은 결과가 나오게 (git diff가 깔끔해짐)
  return Object.fromEntries(
    Object.keys(index).sort().map(k => [k, index[k].sort((a, b) => a - b)])
  );
}

export function writePuzzleIndex(dir = PUZZLE_DIR): PuzzleIndex {
  const index = buildPuzzleIndex(dir);
  writeFileSync(join(dir, "index.json"), JSON.stringify(index, null, 2) + "\n");
  return index;
}

// ---------- puzzles ----------

// 한 조건(key)에 저장된 퍼즐 전부
export function listStoredPuzzles(key: string, dir = PUZZLE_DIR): StoredPuzzle[] {
  const keyDir = join(dir, key);
  if (!existsSync(keyDir)) return [];
  return readdirSync(keyDir)
    .filter(file => FILE_RE.test(file))
    .map(file => JSON.parse(readFileSync(join(keyDir, file), "utf8")) as StoredPuzzle);
}

export type SaveResult =
  | { status: "saved"; id: number; path: string }
  | { status: "duplicate"; id: number; path: string }
  | { status: "invalid"; problems: string[] };

// 검증 → 중복 확인 → 다음 번호로 파일 쓰기. index.json은 호출한 쪽에서 한 번에 갱신.
export function savePuzzle(draft: PuzzleDraft, dir = PUZZLE_DIR): SaveResult {
  const problems = validatePuzzle(draft);
  if (problems.length > 0) return { status: "invalid", problems };

  const key = makePuzzleKey(draft.blockRows, draft.blockColumns, draft.difficulty, draft.rules);
  const existing = listStoredPuzzles(key, dir);

  const board = JSON.stringify(draft.puzzle);
  const dup = existing.find(p => JSON.stringify(p.puzzle) === board);
  if (dup) return { status: "duplicate", id: dup.id, path: makePuzzlePath(key, dup.id) };

  const id = existing.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const path = makePuzzlePath(key, id);

  mkdirSync(join(dir, key), { recursive: true });
  // wx: 같은 이름의 파일이 이미 있으면 덮어쓰지 않고 에러
  writeFileSync(join(dir, path), serializePuzzle(createPuzzleRecord(draft, id)), { flag: "wx" });

  return { status: "saved", id, path };
}