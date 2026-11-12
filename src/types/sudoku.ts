import type { RuleId } from "../lib/RuleManager";

export interface StoredPuzzle {

  id: number;

  blockRows: number;
  blockColumns: number;
  rules: RuleId[];
  difficulty: number;

  puzzle: number[][];
  answer: number[][];

}
/* stored puzzle example
* {
*   "id": 1,
*   "blockRows": 3,
*   "blockColumns": 3,
*   "rules": ["classic", "X-Sudoku", "Anti-Knight"],
*   "difficulty": 0,
*   "puzzle": [[0, 0, 0, 0, 0, 0, 0, 0, 0]...],
*   "answer": [[1, 2, 3, 4, 5, 6, 7, 8, 9]...],
* }
*/