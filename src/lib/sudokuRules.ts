/**
 * findViolations
 * - 현재 입력된 상태에서 위반된 셀의 위치를 찾아 Set으로 반환한다.
 * - 행, 열, 블록 단위로 중복된 숫자가 있는지 확인한다.
 * @returns {Set} violations - 위반된 셀의 위치를 "r,c" 형식으로 저장한 Set
 */
export function findViolations(current: number[][], br: number, bc: number): Set<string> {
    const size = br * bc;
    const violations = new Set<string>();

    function addUnitViolations(unit: { r: number, c: number }[]) {
        const positionsByNum = new Map();
        for (const { r, c } of unit) {
            const num = current[r][c];
            if (num === 0) continue;

            if (!positionsByNum.has(num)) {
                positionsByNum.set(num, []);
            }
            positionsByNum.get(num).push({ r, c });
        }

        for (const positions of positionsByNum.values()) {
            if (positions.length < 2) continue;

            for (const { r, c } of positions) {
                violations.add(`${r},${c}`);
            }
        }
    }

    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            row.push({ r, c });
        }
        addUnitViolations(row);
    }
    for (let c = 0; c < size; c++) {
        const col = [];
        for (let r = 0; r < size; r++) {
            col.push({ r, c });
        }
        addUnitViolations(col);
    }
    for (let blockRow = 0; blockRow < size; blockRow += br) {
        for (let blockCol = 0; blockCol < size; blockCol += bc) {
            const block = [];
            for (let r = blockRow; r < blockRow + br; r++) {
                for (let c = blockCol; c < blockCol + bc; c++) {
                    block.push({ r, c });
                }
            }
            addUnitViolations(block);
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