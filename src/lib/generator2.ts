// 블록 크기, 난이도, 규칙, 시드를 입력으로 받기
// 규칙만 받아서 직접 충돌 감지 함수 만드는 것으로 가정

import { type RuleId, type RuleManager, makeRuleManager } from "./RuleManager";

export function generate(br: number, bc: number, level: number, rules: RuleId[], seed = Math.floor(Math.random() * 2 ** 32)): { answer: number[][]; puzzle: number[][] } {
    const puzzle: number[][] = [[]];

    const random: () => number = mulberry32(seed);
    const ruleManager = makeRuleManager(br, bc, rules);

    // 완성된 스도쿠 제작
    const answer = makeAns(br, bc, ruleManager, random);

    return { answer, puzzle }
}


// 완성된 스도쿠 제작.
function makeAns(br: number, bc: number, ruleManager: RuleManager, random: () => number): number[][] {
    
    const n = br * bc;
    const board = Array.from({ length: n }, () => Array(n).fill(0));

    function countBits(mask: number) : number {
        let count = 0;
        while (mask > 0) {
            mask &= mask - 1;
            count++;
        }
        return count;
    }

    function dfs(): boolean {
        let bestR = -1;
        let bestC = -1;
        let bestAvailMask = 0;
        let minCount = n + 1;

        // 후보 적은 칸 탐색
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                if (board[r][c] !== 0) continue;

                const availMask = ruleManager.getAvailableMask(r, c);
                if (availMask === 0) return false;

                const count = countBits(availMask);
                if (count < minCount) {
                    minCount = count;
                    bestAvailMask = availMask;
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
        for (let i = 0; i < n; i++) {
            if ((bestAvailMask & (1 << i)) !== 0) {
                available.push(i+1);
            }
        }

        shuffle(available, random);

        for (const num of available) {
            board[bestR][bestC] = num;
            
            ruleManager.apply(bestR, bestC, num);

            if (dfs()) return true;

            board[bestR][bestC] = 0;
            ruleManager.undo(bestR, bestC, num);
        }
        return false;
    }
    
    dfs();
    return board;
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