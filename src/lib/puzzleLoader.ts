import type { RuleId } from "./RuleManager";
import { puzzleRepository } from "./staticPuzzleRepository";
import { createPuzzleLogger } from "./puzzleLogger";

export interface LoadedPuzzle {
  answer: number[][];
  puzzle: number[][];
  source: "stored" | "generated";
  seed: number;
}

export async function loadPuzzle(
  br: number,
  bc: number,
  level: number,
  rules: RuleId[],
  seed?: number,
): Promise<LoadedPuzzle> {
  const log = createPuzzleLogger();
  const t0 = performance.now();
  const elapsed = (from = t0) => `${Math.round(performance.now() - from)}ms`;

  log.info(
    `요청: ${br}x${bc}, level ${level}, rules [${rules.join(", ")}], seed ${seed ?? "무작위"}`,
  );

  try {
    const stored = await puzzleRepository.getRandomPuzzle(
      {
        blockRows: br,
        blockColumns: bc,
        difficulty: level,
        rules,
        id: seed,
      },
      log,
    );
    if (stored) {
      log.info(`저장된 퍼즐 사용 (id ${stored.id}, ${elapsed()})`);
      return {
        answer: stored.answer,
        puzzle: stored.puzzle,
        source: "stored",
        seed: stored.id,
      };
    }
    log.info(`저장된 퍼즐 없음 (생성기로 생성, ${elapsed()})`);
  } catch (e) {
    log.warn("저장된 퍼즐을 불러오지 못해 직접 생성합니다.", e);
  }

  const usedSeed = seed ?? Math.floor(Math.random() * 2 ** 32);
  const { generate } = await import("./sudokuGenerator");
  const tGen = performance.now();
  const result = generate(br, bc, level, rules, usedSeed);
  log.info(
    `생성 완료 (seed ${usedSeed}, 생성 ${elapsed(tGen)}, 총 ${elapsed()})`,
  );

  return { ...result, source: "generated", seed: usedSeed };
}
