// 사용법:
//   npm run puzzles:generate -- --size 3x3 --level 0 --rules classic,x --count 5
//   npm run puzzles:generate -- --size 3x3 --rules classic-antiknight --seed 4 --count 3   (seed 4, 5, 6)
//
// --rules 는 규칙 코드(classic, x, antiknight)를 , 또는 - 로 연결

import { parseArgs } from "node:util";
import { makePuzzleKey, parseRulesKey } from "../src/lib/puzzleKey";
import { listStoredPuzzles, savePuzzle, writePuzzleIndex } from "./lib/puzzleStore";
import { generate, GENERATOR_VERSION } from "../src/lib/sudokuGenerator";


function fail(message: string): never {
  console.error(`오류: ${message}`);
  process.exit(1);
}

function toInt(name: string, text: string, min: number, max: number): number {
  const value = Number(text);
  if (!Number.isInteger(value) || value < min || value > max) fail(`--${name}은 ${min}~${max} 사이의 정수여야 합니다 (입력: ${text})`);
  return value;
}

const { values } = parseArgs({
  options: {
    size:  { type: "string", default: "3x3" },
    level: { type: "string", default: "0" },
    rules: { type: "string", default: "classic" },
    count: { type: "string", default: "1" },
    seed:  { type: "string" },
  },
});

const sizeMatch = /^(\d+)x(\d+)$/.exec(values.size);
if (!sizeMatch) fail(`--size는 "3x3" 형식이어야 합니다 (입력: ${values.size})`);
const br = Number(sizeMatch[1]);
const bc = Number(sizeMatch[2]);
if (br < 1 || bc < 1 || br * bc > 16) fail("br * bc는 1~16이어야 합니다");

const level = toInt("level", values.level, 0, 3);
const count = toInt("count", values.count, 1, 10000);
const MAX_SEED = 2 ** 32 - 1;
const baseSeed = values.seed === undefined ? undefined : toInt("seed", values.seed, 0, MAX_SEED);

function parseRules(text: string) {
  try { return parseRulesKey(text.replaceAll(",", "-")); }
  catch (e) { fail((e as Error).message); }
}
const rules = parseRules(values.rules);

const key = makePuzzleKey(br, bc, level, rules);

// 같은 생성기 버전으로 이미 저장된 seed는 다시 생성하지 않음
const storedSeeds = new Set(
  listStoredPuzzles(key)
    .filter(p => (p.generatorVersion ?? 1) === GENERATOR_VERSION)
    .map(p => p.seed ?? p.id)
);

console.log(`조건 ${key} (generator v${GENERATOR_VERSION}), 기존 ${storedSeeds.size}개, ${count}개 생성 시작`);

const summary = { saved: 0, duplicate: 0, skipped: 0, invalid: 0 };
const startAll = performance.now();

for (let i = 0; i < count; i++) {
  const tag = `[${i + 1}/${count}]`;

  let seed: number;
  if (baseSeed !== undefined) {
    seed = baseSeed + i;
    if (seed > MAX_SEED) { console.log(`${tag} seed 범위 초과, 중단`); break; }
    if (storedSeeds.has(seed)) { console.log(`${tag} seed ${seed}: 이미 저장됨, 건너뜀`); summary.skipped++; continue; }
  } else {
    do { seed = Math.floor(Math.random() * 2 ** 32); } while (storedSeeds.has(seed));
  }

  const start = performance.now();
  const { puzzle, answer } = generate(br, bc, level, rules, seed);
  const ms = Math.round(performance.now() - start);

  const result = savePuzzle({ blockRows: br, blockColumns: bc, rules, difficulty: level, seed, puzzle, answer });
  summary[result.status]++;
  storedSeeds.add(seed);

  switch (result.status) {
    case "saved":
      console.log(`${tag} seed ${seed} → ${result.path} (${ms}ms)`);
      break;
    case "duplicate":
      console.log(`${tag} seed ${seed}: ${result.path}와 같은 퍼즐, 저장 안 함 (${ms}ms)`);
      break;
    case "invalid":
      console.warn(`${tag} seed ${seed}: 검증 실패 - ${result.problems.join(", ")}`);
      break;
  }
}

if (summary.saved > 0) writePuzzleIndex();

const total = ((performance.now() - startAll) / 1000).toFixed(1);
console.log(`완료 (${total}s): 저장 ${summary.saved}, 중복 ${summary.duplicate}, 건너뜀 ${summary.skipped}, 실패 ${summary.invalid}`
  + (summary.saved > 0 ? " / index.json 갱신됨" : ""));

if (summary.invalid > 0) process.exit(1);