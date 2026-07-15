import styles from "./SudokuCell.module.css"

type SudokuCellProps = {
  row: number;
  col: number;
  value: number;
  selected: boolean;
  onSelect: (row: number, col: number) => void;
};

function SudokuCell({ row, col, value, selected, onSelect }: SudokuCellProps) {
  return (
    <div 
      className={
        selected
          ? `${styles.cell} ${styles.selected}`
          : styles.cell
      }
      onClick={()=>onSelect(row, col)}
    >
      {value === 0 ? "" : value}
    </div>
  )
}

export default SudokuCell;