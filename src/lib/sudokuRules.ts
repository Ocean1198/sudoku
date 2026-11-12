import { makeRuleManager, type RuleId } from "./RuleManager";

/**
 * findViolations
 * - 현재 입력된 상태에서 위반된 셀의 위치를 찾아 Set으로 반환한다.
 * @returns {Set} violations - 위반된 셀의 위치를 "r,c" 형식으로 저장한 Set
 */
export function findViolations(current: number[][], br: number, bc: number, rules: RuleId[]): Set<string> {
    const violations = new Set<string>();
    const n = br * bc;

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const num = current[r][c];
            if (num === 0) continue;

            const ruleManager = makeRuleManager(br, bc, rules);
            for (let r2 = 0; r2 < n; r2++) {
                for (let c2 = 0; c2 < n; c2++) {
                    if (r !== r2 || c !== c2 && current[r2][c2] !== 0) {
                        ruleManager.apply(r2, c2, current[r2][c2]);
                    }
                }
            }

            const availableMask = ruleManager.getAvailableMask(r, c);
            if ((availableMask & (1 << (num - 1))) === 0) {
                violations.add(`${r},${c}`);
            }
        }
    }

    return violations;
}

/**
 * checkAnswer
 * - 현재 입력된 상태가 정답인지 확인한다.
 * @returns {boolean} isCorrect - 입력된 상태가 정답이면 true, 그렇지 않으면 false
 */
export function checkAnswer(current: number[][], solution: number[][], size: number) : boolean {
    let isCorrect = true;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (current[r][c] !== solution[r][c]) {
                if (current[r][c] === 0) continue;
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) break;
    }
    return isCorrect;
}