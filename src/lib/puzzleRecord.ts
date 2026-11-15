// 퍼즐 정보 → 검증 → 저장할 레코드/문자열로 변환하는 순수 함수 모음.
// 파일 시스템에 의존하지 않으므로 생성 스크립트, 개발 서버, 이후 백엔드 어디서든 재사용할 수 있다.

import type { RuleId } from "./RuleManager";
import type { StoredPuzzle } from "../types/sudoku";
import { findViolations } from "./sudokuRules";
import { hasUniqueSolution, GENERATOR_VERSION } from "./sudokuGenerator";

// 저장을 요청할 때 넘기는 정보 (id는 저장소가 정함)
export interface PuzzleDraft {
  blockRows: number;
  blockColumns: number;
  rules: RuleId[];
  difficulty: number;
  seed: number;
  puzzle: number[][];
  answer: number[][];
}

function isBoard(board: unknown, n: number, min: number): board is number[][] {
  return (
    Array.isArray(board) &&
    board.length === n &&
    board.every(
      (row) =>
        Array.isArray(row) &&
        row.length === n &&
        row.every((v) => Number.isInteger(v) && v >= min && v <= n),
    )
  );
}

// 문제가 없으면 빈 배열. 가벼운 검사부터 하고, 형태가 틀리면 바로 반환.
export function validatePuzzle(draft: PuzzleDraft): string[] {
  const { blockRows: br, blockColumns: bc, rules, puzzle, answer } = draft;
  const n = br * bc;

  if (!Number.isInteger(br) || !Number.isInteger(bc) || br < 1 || bc < 1)
    return ["blockRows/blockColumns가 올바르지 않음"];
  if (!isBoard(puzzle, n, 0))
    return [`puzzle이 ${n}x${n}, 0~${n} 범위의 배열이 아님`];
  if (!isBoard(answer, n, 1))
    return [`answer가 ${n}x${n}, 1~${n} 범위의 배열이 아님`];

  const problems: string[] = [];
  if (puzzle.every((row) => row.every((v) => v !== 0))) {
    problems.push("빈칸이 없음");
  }
  if (
    puzzle.some((row, r) => row.some((v, c) => v !== 0 && v !== answer[r][c]))
  ) {
    problems.push("puzzle의 단서가 answer와 다름");
  }
  if (findViolations(answer, br, bc, rules).size > 0) {
    problems.push("answer가 규칙을 위반함");
  }
  if (problems.length === 0 && !hasUniqueSolution(puzzle, br, bc, rules)) {
    problems.push("해가 하나가 아님");
  }
  return problems;
}

export function countClues(puzzle: number[][]): number {
  return puzzle.reduce(
    (sum, row) => sum + row.filter((v) => v !== 0).length,
    0,
  );
}

export function createPuzzleRecord(
  draft: PuzzleDraft,
  id: number,
): StoredPuzzle {
  return {
    id,
    blockRows: draft.blockRows,
    blockColumns: draft.blockColumns,
    rules: draft.rules,
    difficulty: draft.difficulty,
    puzzle: draft.puzzle,
    answer: draft.answer,
    seed: draft.seed,
    generatorVersion: GENERATOR_VERSION,
    clues: countClues(draft.puzzle),
  };
}

// 기존 파일과 같은 모양(행 단위 한 줄)으로 직렬화
export function serializePuzzle(record: StoredPuzzle): string {
  const lines = Object.entries(record)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (key === "puzzle" || key === "answer") {
        const rows = (value as number[][])
          .map((row) => `    ${JSON.stringify(row)}`)
          .join(",\n");
        return `  "${key}": [\n${rows}\n  ]`;
      }
      return `  "${key}": ${JSON.stringify(value)}`;
    });
  return `{\n${lines.join(",\n")}\n}\n`;
}
