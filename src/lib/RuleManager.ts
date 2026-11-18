export type RuleId = "classic" | "X-Sudoku" | "Anti-Knight";

export interface RuleOption {
    id: RuleId;
    label: string;
    description: string;
    required?: boolean;
}

export const RULE_OPTIONS: RuleOption[] = [
    { id: "classic", label: "Classic", description: "행·열·박스에 같은 숫자 금지", required: true },
    { id: "X-Sudoku", label: "X-Sudoku", description: "두 대각선에 같은 숫자 금지" },
    { id: "Anti-Knight", label: "Anti-Knight", description: "나이트 이동 거리에 같은 숫자 금지" },
];

interface SudokuRule {
    getAvailableMask(r: number, c: number): number;
    apply(r: number, c: number, num: number): void;
    undo(r: number, c: number, num: number): void;
    getHouses?(): [number, number][][];
    isPeer(r1: number, c1: number, r2: number, c2: number): boolean;
}

export function makeRuleManager(br: number, bc: number, rules: RuleId[]): RuleManager {
    const n = br * bc;
    const ruleManager = new RuleManager(br, bc);

    if (rules.includes("classic")) {
        ruleManager.addRule(new Classic(n, br, bc));
        ruleManager.addRuleId("classic");
    }
    if (rules.includes("X-Sudoku")) {
        ruleManager.addRule(new XSudoku(n));
        ruleManager.addRuleId("X-Sudoku");
    }
    if (rules.includes("Anti-Knight")) {
        ruleManager.addRule(new AntiKnight(n));
        ruleManager.addRuleId("Anti-Knight");
    }

    return ruleManager;
}

export class RuleManager {
    private rules: SudokuRule[] = [];
    private ruleId: RuleId[] = [];
    private fullMask: number;
    private br: number;
    private bc: number;

    constructor(br: number, bc: number) {
        const n = br * bc;
        this.fullMask = (1 << n) - 1;
        this.br = br;
        this.bc = bc;
    }

    // 새로운 규칙 추가
    addRule(rule: SudokuRule) {
        this.rules.push(rule);
    }

    addRuleId(ruleId: RuleId) {
        this.ruleId.push(ruleId);
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

    // 적용된 규칙 중 하나라도 두 칸을 묶으면 true (같은 칸은 제외)
    isPeer(r1: number, c1: number, r2: number, c2: number): boolean {
        if (r1 === r2 && c1 === c2) return false;
        return this.rules.some(rule => rule.isPeer(r1, c1, r2, c2));
    }

    getHouses(): [number, number][][] {
        const houses: [number, number][][] = [];
        for (const rule of this.rules) {
            if (rule.getHouses) {
                houses.push(...rule.getHouses());
            }
        }
        return houses;
    }

    getBrBc(): { br: number, bc: number } {
        return { br: this.br, bc: this.bc };
    }
    
    getRuleId(): RuleId[] {
        return this.ruleId;
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

    isPeer(r1: number, c1: number, r2: number, c2: number): boolean {
        if (r1 === r2 || c1 === c2) return true;
        return Math.floor(r1 / this.br) === Math.floor(r2 / this.br) &&
               Math.floor(c1 / this.bc) === Math.floor(c2 / this.bc);
    }

    getHouses(): [number, number][][] {
        const houses: [number, number][][] = [];
        const n = this.br * this.bc;

        // 행
        for (let r = 0; r < n; r++) {
            const row: [number, number][] = [];
            for (let c = 0; c < n; c++)
                row.push([r, c]);
            houses.push(row);
        }

        // 열
        for (let c = 0; c < n; c++) {
            const col: [number, number][] = [];
            for (let r = 0; r < n; r++)
                col.push([r, c]);
            houses.push(col);
        }

        // 박스
        for (let brIdx = 0; brIdx < this.bc; brIdx++) {
            for (let bcIdx = 0; bcIdx < this.br; bcIdx++) {
                const box: [number, number][] = [];
                for (let i = 0; i < this.br; i++) {
                    for (let j = 0; j < this.bc; j++)
                        box.push([brIdx * this.br + i, bcIdx * this.bc + j])
                }
                houses.push(box);
            }
        }

        return houses;
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

    isPeer(r1: number, c1: number, r2: number, c2: number): boolean {
        const onDiag1 = r1 === c1 && r2 === c2;
        const onDiag2 = r1 + c1 === this.n - 1 && r2 + c2 === this.n - 1;
        return onDiag1 || onDiag2;
    }

    getHouses(): [number, number][][] {
        const diag1: [number, number][] = [];
        const diag2: [number, number][] = [];
        for (let i = 0; i < this.n; i++) {
            diag1.push([i, i]);
            diag2.push([i, this.n - 1 - i]);
        }
        return [diag1, diag2];
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

    isPeer(r1: number, c1: number, r2: number, c2: number): boolean {
        const dr = Math.abs(r1 - r2);
        const dc = Math.abs(c1 - c2);
        return (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
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