import type { RuleId } from "./RuleManager";
import type { StoredPuzzle } from "../types/sudoku";
import type { PuzzleLogger } from "./puzzleLogger";

export interface PuzzleQuery {
	id?: number;
	blockRows: number;
	blockColumns: number;
	rules: RuleId[];
	difficulty: number;
}

export interface PuzzleRepository {
  getRandomPuzzle(query: PuzzleQuery, log?: PuzzleLogger): Promise<StoredPuzzle | null>;
}