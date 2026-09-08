export type RuleId = "classic" | "X-Sudoku" | "Anti-Knight";

interface SudokuRule {
    getAvailableMask(r: number, c: number): number;
    apply(r: number, c: number, num: number): void;
    undo(r: number, c: number, num: number): void;
}

export function makeRuleManager(br: number, bc: number, rules: RuleId[]): RuleManager {
    const n = br * bc;
    const ruleManager = new RuleManager(n);

    if (rules.includes("classic")) {
        ruleManager.addRule(new Classic(n, br, bc));
    }
    if (rules.includes("X-Sudoku")) {
        ruleManager.addRule(new XSudoku(n));
    }
    if (rules.includes("Anti-Knight")) {
        ruleManager.addRule(new AntiKnight(n));
    }

    return ruleManager;
}

export class RuleManager {
    private rules: SudokuRule[] = [];
    private fullMask: number;

    constructor(n: number) {
        this.fullMask = (1 << n) - 1;
    }

    addRule(rule: SudokuRule) {
        this.rules.push(rule);
    }

    getAvailableMask(r: number, c: number): number {
        let mask = this.fullMask;
        for (const rule of this.rules) {
            mask &= rule.getAvailableMask(r, c);
            if (mask === 0) break;
        }
        return mask;
    }

    apply(r: number, c: number, num: number) {
        for (const rule of this.rules) rule.apply(r, c, num);
    }

    undo(r: number, c: number, num: number) {
        for (const rule of this.rules) rule.undo(r, c, num);
    }
}

class Classic implements SudokuRule {
    private row: Int32Array;
    private col: Int32Array;
    private box: Int32Array;
    private br: number;
    private bc: number;

    constructor(n: number, br: number, bc: number) {
        this.row = new Int32Array(n);
        this.col = new Int32Array(n);
        this.box = new Int32Array(n);
        this.br = br;
        this.bc = bc;
    }

    getAvailableMask(r: number, c: number): number {
        const boxIdx = Math.floor(r / this.br) * this.br + Math.floor(c / this.bc);
        return ~(this.row[r] | this.col[c] | this.box[boxIdx]);
    }

    apply(r: number, c: number, num: number): void {
        const bit = 1 << (num - 1);
        const boxIdx = Math.floor(r / this.br) * this.br + Math.floor(c / this.bc);
        this.row[r] |= bit;
        this.col[c] |= bit;
        this.box[boxIdx] |= bit;
    }
    undo(r: number, c: number, num: number) {
        const bit = 1 << (num - 1);
        const boxIdx = Math.floor(r / this.br) * this.br + Math.floor(c / this.bc);
        this.row[r] &= ~bit;
        this.col[c] &= ~bit;
        this.box[boxIdx] &= ~bit;
    }
}

class XSudoku implements SudokuRule {
    private n: number;
    private diag1 = 0;
    private diag2 = 0;
    constructor(n: number) {
        this.n = n;
    }
    getAvailableMask(r: number, c: number): number {
        let used = 0;
        if (r === c) used |= this.diag1;
        if (r + c === this.n - 1) used |= this.diag2;
        return ~used;
    }
    apply(r: number, c: number, num: number): void {
        const bit = 1 << (num - 1);
        if (r === c) this.diag1 |= bit;
        if (r + c === this.n - 1) this.diag2 |= bit;
    }
    undo(r: number, c: number, num: number): void {
        const bit = 1 << (num - 1);
        if (r === c) this.diag1 &= ~bit;
        if (r + c === this.n - 1) this.diag2 &= ~bit;
    }
}

class AntiKnight implements SudokuRule {
    private n: number;
    private knightMask: Int32Array;
    private counts: Uint8Array;
    private moves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ]
    constructor(n: number) {
        this.n = n;
        this.knightMask = new Int32Array(n * n);
        this.counts = new Uint8Array(n * n * n)
    }
    getAvailableMask(r: number, c: number): number {
        return ~this.knightMask[r * this.n + c];
    }
    apply(r: number, c: number, num: number) {
        this.updateNeighbors(r, c, num, 1);
    }
    undo(r: number, c: number, num: number) {
        this.updateNeighbors(r, c, num, -1);
    }

    private updateNeighbors(r: number, c: number, num: number, delta: number) {
        const numIdx = num - 1;
        for (const [dr, dc] of this.moves) {
            const nr = r + dr;
            const nc = c + dc;

            if (nr >= 0 && nr < this.n && nc >= 0 && nc < this.n) {
                const cellIdx = nr * this.n + nc;
                const countIdx = cellIdx * this.n + numIdx;

                const prevCount = this.counts[countIdx];
                const newCount = prevCount + delta;
                this.counts[countIdx] = newCount;

                // 최초 금지 설정 시 비트 켜기, 모든 금지 요인 해제 시 비트 끄기
                if (prevCount === 0 && newCount > 0) {
                    this.knightMask[cellIdx] |= (1 << numIdx);
                } else if (prevCount > 0 && newCount === 0) {
                    this.knightMask[cellIdx] &= ~(1 << numIdx);
                }
            }
        }
    }
}