import styles from "./SudokuCell.module.css"

export interface CellState {
  value: number;
  isUserInput: boolean; // 사용자의 입력(true)인 경우 파랑, 시스템의 입력(false)인 경우 검정(기본값)
  isConflict: boolean;  // 입력과 관계없이 충돌하는 경우 빨강
}

type SudokuCellProps = {
  row: number;
  col: number;
  state: CellState;
  isSelected: boolean;
  isRevealed : boolean;
  onSelect: (row: number, col: number) => void;
};

function SudokuCell({ row, col, state, isSelected, isRevealed, onSelect }: SudokuCellProps) {
  const className = [
    styles.cell,
    state.isUserInput && styles.userInput,
    state.isConflict && styles.conflict,
    isRevealed && styles.revealed,
    isSelected && styles.selected,
  ].filter(Boolean).join(" ");
  return (
    <div 
      className={
        className
      }
      onClick={()=>onSelect(row, col)}
    >
      {state.value === 0 ? "" : state.value}
    </div>
  )
}

export default SudokuCell;