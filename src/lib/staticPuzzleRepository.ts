import type { PuzzleQuery, PuzzleRepository } from "./puzzleRepository";
import type { StoredPuzzle } from "../types/sudoku";
import { makePuzzleKey, makePuzzleFileName } from "./puzzleKey";

type PuzzleIndex = Record<string, number[]>;

// base가 '/sudoku/'라서 반드시 BASE_URL을 붙여야 배포 환경에서 404가 나지 않음
const BASE = `${import.meta.env.BASE_URL}puzzles/`;

export class StaticPuzzleRepository implements PuzzleRepository {
  private indexPromise: Promise<PuzzleIndex> | null = null;

  // index.json은 한 번만 받아서 재사용, 실패하면 다음에 다시 시도
  private loadIndex(): Promise<PuzzleIndex> {
    this.indexPromise ??= fetch(`${BASE}index.json`)
      .then(res => {
        if (!res.ok) throw new Error(`index.json: ${res.status}`);
        return res.json() as Promise<PuzzleIndex>;
      })
      .catch(err => {
        this.indexPromise = null;
        throw err;
      });
    return this.indexPromise;
  }

  async getRandomPuzzle(query: PuzzleQuery): Promise<StoredPuzzle | null> {
    const key = makePuzzleKey(query.blockRows, query.blockColumns, query.difficulty, query.rules);
    const ids = (await this.loadIndex())[key] ?? [];

    let id: number | undefined;
    if (query.id !== undefined) id = ids.includes(query.id) ? query.id : undefined;
    else if (ids.length > 0) id = ids[Math.floor(Math.random() * ids.length)];
    if (id === undefined) return null;

    const res = await fetch(BASE + makePuzzleFileName(key, id));
    if (!res.ok) return null;
    const data = (await res.json()) as StoredPuzzle;

    // 최소한의 형태 검사
    const n = query.blockRows * query.blockColumns;
    if (data.blockRows !== query.blockRows || data.blockColumns !== query.blockColumns ||
        data.puzzle?.length !== n || data.answer?.length !== n) return null;

    return data;
  }
}

export const puzzleRepository: PuzzleRepository = new StaticPuzzleRepository();