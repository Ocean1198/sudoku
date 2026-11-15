import type { RuleId } from "./RuleManager";
import { puzzleRepository } from "./staticPuzzleRepository";

export interface LoadedPuzzle {
  answer: number[][];
  puzzle: number[][];
  source: "stored" | "generated";
}

export async function loadPuzzle(
  br: number, bc: number, level: number, rules: RuleId[], seed?: number
): Promise<LoadedPuzzle> {
  try {
    const stored = await puzzleRepository.getRandomPuzzle({
      blockRows: br, blockColumns: bc, difficulty: level, rules, id: seed,
    });
    if (stored) return { answer: stored.answer, puzzle: stored.puzzle, source: "stored" };
  } catch (e) {
    console.log("저장된 퍼즐을 불러오지 못해 직접 생성합니다.", e);
  }

  // 필요할 때만 생성기를 불러옴 → 생성기가 별도 chunk로 분리되어 첫 로딩이 가벼워짐
  const { generate } = await import("./sudokuGenerator");
  return { ...generate(br, bc, level, rules, seed), source: "generated" };
}