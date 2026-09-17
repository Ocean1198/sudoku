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

const ruleManager = makeRuleManager(3, 3, ["classic"]);
const board = new Board(9, ruleManager);
const rowBoard = 
  "500008010" +
  "072105308" +
  "190042560" +
  "809061023" +
  "406850009" +
  "700900850" +
  "961007000" +
  "207009635" +
  "045286701";

for (let r = 0; r < 9; r++) {
  for (let c = 0; c < 9; c++) {
    board.setValue(r, c, parseInt(rowBoard[r * 9 + c]));
  }
}

// technique test
while (true) {
  const result1 = nakedSingle(9, board);
  if (!result1.success) break;
  else console.log("Naked Single:", result1);
}
while (true) {
  const result2 = nakedDouble(9, board);
  if (!result2.success) break;
  else console.log("Naked Double:", result2);
}