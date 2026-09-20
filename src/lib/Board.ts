import { makeRuleManager, type RuleId, type RuleManager } from "./RuleManager";

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

    public getHouses(): [number, number][][] {
        return this.ruleManager.getHouses();
    }

    public copyBoard(): Board {
        const { br, bc } = this.ruleManager.getBrBc();
        // const rules = this.ruleManager.getRuleId();
        // const newRuleManager = makeRuleManager(br, bc, rules);
        const newRuleManager = makeRuleManager(br, bc, ['classic']);
        const newBoard = new Board(this.n, newRuleManager);

        newBoard.fromArray(this.toArray());
        newBoard.eliminatedByTechnique = this.eliminatedByTechnique.slice();
        newBoard.updateAllCandidates();

        return newBoard;
    }

    public toArray(): number[][] {
        return this.value.map(row => [...row]);
    }

    public fromArray(arr: number[][]): void {
        for (let r = 0; r < this.n; r++) {
            for (let c = 0; c < this.n; c++) {
                this.value[r][c] = arr[r][c];
                if (arr[r][c] !== 0) {
                    this.ruleManager.apply(r, c, arr[r][c]);
                }
            }
        }
        this.eliminatedByTechnique.fill(0);
        this.updateAllCandidates();
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

export function countBits(mask: number) : number {
    let count = 0;
    while (mask > 0) {
        mask &= mask - 1;
        count++;
    }
    return count;
}