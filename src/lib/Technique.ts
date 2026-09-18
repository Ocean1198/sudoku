import { Board, countBits, makeRuleManager} from "./RuleManager";

type ActionType = "REMOVE_CANDIDATE" | "SET_VALUE";

interface Change {
  row: number;         // 대상 셀 행 (0~8)
  col: number;         // 대상 셀 열 (0~8)
  action: ActionType;  // "REMOVE_CANDIDATE" 또는 "SET_VALUE"
  value: number;       // 제거된 후보 숫자 또는 확정된 숫자 (1~9)
}

interface StepResult {
  success: boolean;    // 변화 발생 여부 (true/false)
  technique: {
    name: string;      // 예: "X-Wing"
    tier: number;      // 예: 4
  };
  changes: Change[];   // 이번 단계에서 발생한 모든 변화 목록
}

function nakedSingle(n: number, board: Board): StepResult {
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (board.getValue(r, c) !== 0) continue;

      const candidates = board.getCandidate(r, c);

      if (candidates !== 0 && (candidates & (candidates - 1)) === 0) {
        const num = Math.log2(candidates) + 1;
        board.setValue(r, c, num);

        return {
          success: true,
          technique: {
              name: "Naked Single",
              tier: 1
          },
          changes: [{
              row: r,
              col: c,
              action: "SET_VALUE",
              value: num
          }]
        };
      }
    }
  }
  return {
      success: false,
      technique: {
          name: "Naked Single",
          tier: 1
      },
      changes: []
  };
}

function nakedDouble(n: number, board: Board): StepResult {
  const houses: [number, number][][] = board.getHouses();

  for (const house of houses) {
    const bivalueCells: { r: number, c: number, mask: number }[] = [];

    for (const [r, c] of house) {
      if (board.getValue(r, c) !== 0) continue;

      const mask = board.getCandidate(r, c);
      if (countBits(mask) === 2) {
        bivalueCells.push({ r, c, mask });
      }
    }

    for (let i = 0; i < bivalueCells.length; i++) {
      for (let j = i + 1; j < bivalueCells.length; j++) {
        const cell1 = bivalueCells[i];
        const cell2 = bivalueCells[j];

        if (cell1.mask === cell2.mask) {
          const pairMask = cell1.mask;
          const changes: Change[] = [];

          for (const [r, c] of house) {
            // 자신은 제외
            if ((r === cell1.r && c === cell1.c) || (r === cell2.r && c === cell2.c)) continue;
            if (board.getValue(r, c) !== 0) continue;

            const currentMask = board.getCandidate(r, c);
            const overlap = currentMask & pairMask;

            if (overlap !== 0) {
              for (let num = 1; num <= n; num++) {
                if ((overlap & (1 << num - 1)) !== 0) {
                  board.removeCandidate(r, c, num);
                  changes.push({
                    row: r,
                    col: c,
                    action: "REMOVE_CANDIDATE",
                    value: num
                  });
                }
              }
            }
          }
          if (changes.length > 0) {
            return {
              success: true,
              technique: { name: "Naked Double", tier: 2 },
              changes
            };
          }
        }
      }
    }
  }

  return {
    success: false,
    technique: {name: "Naked Double", tier: 2},
    changes: []
  };
}

function hiddenSingle(n: number, board: Board): StepResult {
  const houses: [number, number][][] = board.getHouses();

  for (const house of houses) {
    for (let num = 1; num <= n; num++) {
      let count = 0;
      let targetR = 0;
      let targetC = 0;

      for (const [r, c] of house) {
        if (board.getValue(r, c) !== 0) continue;

        const candidates = board.getCandidate(r, c);
        if ((candidates & (1 << (num - 1))) !== 0) {
          count++;
          targetR = r;
          targetC = c;
          if (count === 2) break;
        }
      }
      if (count === 1) {
        board.setValue(targetR, targetC, num);
        return {
          success: true,
          technique: {
            name: "Hidden Single",
            tier: 1
          },
          changes: [{
            row: targetR,
            col: targetC,
            action: "SET_VALUE",
            value: num
          }]
        };
      }
    }
  }
  
  return {
    success: false,
    technique: {
        name: "Hidden Single",
        tier: 1
    },
    changes: []
  };
}

function hiddenDouble(n: number, board: Board): StepResult {
  const houses: [number, number][][] = board.getHouses();

  for (const house of houses) {
    const numToCells: Map<number, { r: number; c: number }[]> = new Map();

    for (let num = 1; num <= n; num++) {
      const cells: { r: number; c: number }[] = [];
      for (const [r, c] of house) {
        if (board.getValue(r, c) !== 0) continue;
        if ((board.getCandidate(r, c) & (1 << (num - 1))) !== 0) {
          cells.push({ r, c });
        }
      }
      if (cells.length === 2) {
        numToCells.set(num, cells);
      }
    }

    const candNums = Array.from(numToCells.keys());
    for (let i = 0; i < candNums.length; i++) {
      for (let j = i + 1; j < candNums.length; j++) {
        const num1 = candNums[i];
        const num2 = candNums[j];
        const cells1 = numToCells.get(num1)!;
        const cells2 = numToCells.get(num2)!;

        if (
          cells1[0].r === cells2[0].r && cells1[0].c === cells2[0].c &&
          cells1[1].r === cells2[1].r && cells1[1].c === cells2[1].c
        ) {
          const changes: Change[] = [];
          const targetCells = cells1;
          const keepMask = (1 << (num1 - 1)) | (1 << (num2 - 1));

          for (const cell of targetCells) {
            const currentMask = board.getCandidate(cell.r, cell.c);
            const removeMask = currentMask & ~keepMask;

            if (removeMask !== 0) {
              for (let num = 1; num <= n; num++) {
                if ((removeMask & (1 << (num - 1))) !== 0) {
                  board.removeCandidate(cell.r, cell.c, num);
                  changes.push({
                    row: cell.r,
                    col: cell.c,
                    action: "REMOVE_CANDIDATE",
                    value: num
                  });
                }
              }
            }
          }

          if (changes.length > 0) {
            return {
              success: true,
              technique: { name: "Hidden Double", tier: 3 },
              changes
            };
          }
        }
      }
    }
  }

  return {
    success: false,
    technique: { name: "Hidden Double", tier: 3 },
    changes: []
  };
}

// const ruleManager = makeRuleManager(3, 3, ["classic"]);
// const board = new Board(9, ruleManager);
// const rowBoard = 
//   "000000000" +
//   "345000000" +
//   "670012000" +
//   "000000000" +
//   "001000000" +
//   "002000000" +
//   "000000000" +
//   "000000000" +
//   "000000000";

// for (let r = 0; r < 9; r++) {
//   for (let c = 0; c < 9; c++) {
//     board.setValue(r, c, parseInt(rowBoard[r * 9 + c]));
//   }
// }

// // technique test
// while (true) {
//   const result1 = hiddenDouble(9, board);
//   if (!result1.success) break;
//   else console.log("Hidden Double:", result1);
// }