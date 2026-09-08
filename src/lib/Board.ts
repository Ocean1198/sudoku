import { RuleManager } from "./RuleManager";

class Board {
    private n: number;
    private value: number[][];
    private candidate: Int32Array[][];
    private ruleManager: RuleManager;
    constructor(n: number, ruleManager: RuleManager) {
        this.n = n;
        this.value = Array.from({ length: this.n }, () => Array(this.n).fill(0));
        this.candidate = Array.from({ length: this.n }, () => Array(this.n).fill(0).map(() => new Int32Array(1)));
        this.ruleManager = ruleManager;
    }

    public setValue(r: number, c: number, value: number) {
        this.value[r][c] = value;
        this.candidate[r][c].fill(0);
        this.ruleManager.apply(r, c, value);
    }
    public removeCandidate(r: number, c: number, value: number) {
        this.candidate[r][c][0] &= ~(1 << (value - 1));
    }
    public getCandidate(r: number, c: number): Int32Array {
        return this.candidate[r][c];
    }
}

export default Board;