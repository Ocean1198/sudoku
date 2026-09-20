// 블록 크기, 난이도, 규칙, 시드를 입력으로 받기
// 규칙만 받아서 직접 충돌 감지 함수 만드는 것으로 가정

import { Board, countBits } from "./Board";
import { type RuleId, makeRuleManager } from "./RuleManager";
import { nakedSingle, nakedDouble, hiddenSingle, hiddenDouble } from "./Technique"

// level: easy(0), normal(1), hard(2)
export function generate(
    br: number, 
    bc: number, 
    level: number, 
    rules: RuleId[], 
    seed = Math.floor(Math.random() * 2 ** 32)
): { answer: number[][]; puzzle: number[][] } {

    const n = br * bc;
    const random = mulberry32(seed);

    // 완성된 보드 제작
    const ruleManager = makeRuleManager(br, bc, rules);
    const answer = makeAns(new Board(n, ruleManager), n, random);    

    // 문제 생성
    const puzzle = answer.copyBoard();
    const randomIdx: [number, number][] = [];
    for (let r = 0; r < n; r++) 
        for (let c = 0; c < n; c++) 
            randomIdx.push([r, c]);
    shuffle(randomIdx, random);
    for (let i = 0; i < randomIdx.length; i++) {
        const [rr, rc] = randomIdx[i];
        const ori = puzzle.getValue(rr, rc);
        puzzle.clearValue(rr, rc);

        if (!brute_force_solver(puzzle, br, bc) ||
            logic_solver(puzzle, br, bc) > level) {
            puzzle.setValue(rr, rc, ori);
        }
    }

    return { answer: answer.toArray(), puzzle: puzzle.toArray() };
}


// 완성된 스도쿠 제작.
function makeAns(board: Board, n: number, random: () => number): Board {

    function dfs(): boolean {
        let bestR = -1;
        let bestC = -1;
        let bestAvailMask = 0;
        let minCount = n + 1;

        // 후보 적은 칸 탐색
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (board.getValue(r, c) !== 0) continue;

                const candidates = board.getCandidate(r, c);
                const count = countBits(candidates);

                if (count < minCount) {
                    minCount = count;
                    bestAvailMask = candidates;
                    bestR = r;
                    bestC = c;

                    if (minCount === 1) break;
                }
            }
            if (minCount === 1) break;
        }

        // 완성
        if (bestR === -1) return true;

        const available: number[] = [];
        for (let num = 1; num <= n; num++) {
            if ((bestAvailMask & (1 << (num - 1))) !== 0) {
                available.push(num);
            }
        }
        shuffle(available, random);

        for (const num of available) {
            board.setValue(bestR, bestC, num);

            if (dfs()) return true;

            board.clearValue(bestR, bestC);
        }
        return false;
    }
    
    dfs();
    return board;
}

// 유일해 검증을 위한 무차별 대입 풀이
function brute_force_solver(board: Board, br: number, bc: number): boolean {
    const n = br * bc;
    let sol = 0;

    const emptyCells: [number, number][] = [];
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            if (board.getValue(r, c) === 0) {
                emptyCells.push([r, c]);
            }
        }
    }

    function dfs(index: number): boolean {
        if (sol >= 2) return false;
        if (index == emptyCells.length) {
            sol += 1;
            return true;
        }

        const [r, c] = emptyCells[index];

        const candidates = board.getCandidate(r, c);

        for (let i = 0; i < n; i++) {
            if ((candidates & (1 << i)) !== 0) {
                const num = i + 1;
                board.setValue(r, c, num);

                dfs(index + 1);

                board.clearValue(r, c);
            }
        }
        return false;
    }

    dfs(0);
    return sol === 1;
}

function logic_solver(puzzle: Board, br: number, bc: number, printLog?: boolean): number {
    const n = br * bc;
    const board = puzzle.copyBoard();

    let diff = 0;

    while (true) {
        const NSResult = nakedSingle(n, board);
        if (NSResult.success) {
            if (printLog) {
                console.log(NSResult);
            };
            continue;
        }
        
        const HSResult = hiddenSingle(n, board);
        if (HSResult.success) continue;
        
        const NDResult = nakedDouble(n, board);
        if (NDResult.success) {
            if (diff === 0) diff = 1;
            continue;
        }
        
        const HDResult = hiddenDouble(n, board);
        if (HDResult.success) {
            if (diff === 0) diff = 1;
            continue;
        }

        break;
    }

    const isSolved = board.getHouses().every(house => house.every(([r, c]) => board.getValue(r, c) !== 0));
    if (!isSolved) return 2;
    return diff;
}

function shuffle<T>(arr: T[], random: () => number) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
// random
function mulberry32(seed: number): () => number {
    return function() {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// // test
// const { puzzle, answer } = generate(3, 3, 0, ["classic", "X-Sudoku", "Anti-Knight"], 123456789);
// puzzle.forEach(row => console.log(row.join(" ")));
// console.log("=====================================");
// answer.forEach(row => console.log(row.join(" ")));
