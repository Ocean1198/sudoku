import type { RuleId } from "../lib/RuleManager";

export interface StoredPuzzle {

  id: number;

  blockRows: number;
  blockColumns: number;
  rules: RuleId[];
  difficulty: number;

  puzzle: number[][];
  answer: number[][];

  // 아래는 생성 스크립트가 추가하는 메타데이터. 초기 파일에는 없을 수 있음.
  seed?: number;              // generate()에 넘긴 seed. 없으면 id와 같은 것으로 간주
  generatorVersion?: number;  // 생성 당시 GENERATOR_VERSION. 없으면 1로 간주
  clues?: number;             // 퍼즐의 단서 수
}
