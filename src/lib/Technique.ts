import { type RuleManager, Board} from "./RuleManager";

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

function nakedDouble(n: number, board: Board) {
  
}