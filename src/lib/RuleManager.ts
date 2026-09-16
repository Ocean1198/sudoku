export type RuleId = "classic" | "X-Sudoku" | "Anti-Knight";

interface SudokuRule {
    getAvailableMask(r: number, c: number): number;
    apply(r: number, c: number, num: number): void;
    undo(r: number, c: number, num: number): void;
}

export class Board {
    private n: number;
    private value: number[][];
    private candidate: Int32Array;
    private eliminatedByTechnique: Int32Array;
    private ruleManager: RuleManager;

    constructor(n: number, ruleManager: RuleManager) {
        this.n = n;
        this.value = Array.from({ length: this.n }, () => Array(this.n).fill(0));
        this.candidate = new Int32Array(this.n * this.n);
        this.candidate.fill((1 << this.n) - 1);
        this.eliminatedByTechnique = new Int32Array(this.n * this.n);
        this.ruleManager = ruleManager;
        this.updateAllCandidates();
    }

    private updateAllCandidates() {
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) {
                const index = r * this.n + c;
                if (this.value[r][c] !== 0) {
                    this.candidate[index] = 0;
                } else {
                    this.candidate[index] = this.ruleManager.getAvailableMask(r, c) & ~this.eliminatedByTechnique[index];
                }
            }
        }
    }

    public setValue(r: number, c: number, value: number): void {
        this.value[r][c] = value;
        this.ruleManager.apply(r, c, value);

        this.eliminatedByTechnique.fill(0);
        this.updateAllCandidates();
    }

    public clearValue(r: number, c: number): void {
        const value = this.value[r][c];
        this.value[r][c] = 0;
        this.ruleManager.undo(r, c, value);
        
        this.eliminatedByTechnique.fill(0);
        this.updateAllCandidates();
    }

    public removeCandidate(r: number, c: number, value: number) {
        const index = r * this.n + c;
        const bit = 1 <<  (value - 1);

        this.eliminatedByTechnique[index] |= bit;
        this.candidate[index] &= ~bit;
    }

    public getValue(r: number, c: number): number {
        return this.value[r][c];
    }
    
    public getCandidate(r: number, c: number): number {
        return this.candidate[r * this.n + c];
    }

    // // 디버그용
    public printAllValue() {
        for (let r = 0; r < this.n; r++) {
            console.log(this.value[r].join(" "));
        }
        console.log();
    }
    // public printAllCandidate() {
    //     for (let r = 0; r < this.n; r++) {
    //         console.log(this.candidate.slice(r * this.n, (r + 1) * this.n).join(" "));
    //     }
    //     console.log();
    // }
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

    // 새로운 규칙 추가
    addRule(rule: SudokuRule) {
        this.rules.push(rule);
    }

    // 규칙 기반 후보 마스크 계산
    getAvailableMask(r: number, c: number): number {
        let mask = this.fullMask;
        for (const rule of this.rules) {
            mask &= rule.getAvailableMask(r, c);
            if (mask === 0) break;
        }
        return mask;
    }

    // 규칙 적용 및 해제
    apply(r: number, c: number, num: number) {
        for (const rule of this.rules) rule.apply(r, c, num);
    }

    // 되돌리기
    undo(r: number, c: number, num: number) {
        for (const rule of this.rules) rule.undo(r, c, num);
    }
}

export class Classic implements SudokuRule {
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

export function countBits(mask: number) : number {
    let count = 0;
    while (mask > 0) {
        mask &= mask - 1;
        count++;
    }
    return count;
}

// // 디버그용
// const ruleManager = new RuleManager(9);
// ruleManager.addRule(new Classic(9, 3, 3));
// ruleManager.addRule(new XSudoku(9));
// ruleManager.addRule(new AntiKnight(9));
// const board = new Board(9, ruleManager);
// console.log(board.getCandidate(0, 0))
// board.printAllCandidate();

// board.setValue(0, 0, 1);

// board.printAllCandidate();