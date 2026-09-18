import { makeRuleManager, type RuleId } from "./RuleManager";

/**
 * findViolations
 * - 현재 입력된 상태에서 위반된 셀의 위치를 찾아 Set으로 반환한다.
 * @returns {Set} violations - 위반된 셀의 위치를 "r,c" 형식으로 저장한 Set
 */
export function findViolations(current: number[][], br: number, bc: number, rules: RuleId[]): Set<string> {
    const violations = new Set<string>();
    const n = br * bc;

    const ruleManager = makeRuleManager(br, bc, rules);
    
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const num = current[r][c];
            if (num !== 0) {
                ruleManager.apply(r, c, num);
            }
        }
    }

    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const num = current[r][c];
            if (num === 0) continue;
            
            ruleManager.undo(r, c, num);

            const availableMask = ruleManager.getAvailableMask(r, c);
            const bit = 1 << (num - 1);

            if ((availableMask & bit) === 0) {
                violations.add(`${r},${c}`);
            }

            ruleManager.apply(r, c, num);
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