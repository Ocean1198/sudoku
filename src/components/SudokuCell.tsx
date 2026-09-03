import styles from "./SudokuCell.module.css"

export interface CellState {
  value: number;
  isUserInput: boolean; // 사용자의 입력(true)인 경우 파랑, 시스템의 입력(false)인 경우 검정(기본값)
  isConflict: boolean;  // 입력과 관계없이 충돌하는 경우 빨강
  isRevealed: boolean;  // 사용자가 힌트를 요청하여 공개된 경우 true, 그렇지 않은 경우 false
}

type SudokuCellProps = {
  row: number;
  col: number;
  state: CellState;
  memo: number[];
  isSelected: boolean;
  isBlockRight: boolean;
  isBlockBottom: boolean;
  onSelect: (row: number, col: number) => void;
};

function SudokuCell({ row, col, state, memo, isSelected, isBlockRight, isBlockBottom, onSelect }: SudokuCellProps) {
  const className = [
    styles.cell,
    state.isUserInput && styles.userInput,
    state.isConflict && styles.conflict,
    state.isRevealed && styles.revealed,
    isSelected && styles.selected,
    isBlockRight && styles.blockRight,
    isBlockBottom && styles.blockBottom,
  ].filter(Boolean).join(" ");
  return (
    <div 
      className={
        className
      }
      onClick={()=>onSelect(row, col)}
    >
      {state.value !== 0 ? state.value : <Memo values={memo} />}
    </div>
  )
}

function Memo({ values }: { values: number[] }) {
  if (values.length === 0) return null;

  const visibleValues = values.slice(0, 9);
  const usesNineSlots = values.length >= 5;
  const slotCount = usesNineSlots ? 9 : 4;

  return (
    <div
      className={`${styles.memo} ${usesNineSlots ? styles.memoNine : styles.memoFour}`}
      aria-label={`메모: ${visibleValues.join(', ')}`}
    >
      {Array.from({ length: slotCount }, (_, index) => (
        <span className={styles.memoItem} key={index}>
          {visibleValues[index] ?? ''}
        </span>
      ))}
    </div>
  );
}

export default SudokuCell;
