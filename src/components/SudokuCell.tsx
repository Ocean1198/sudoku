import styles from "./SudokuCell.module.css"

type SudokuCellProps = {
  value: number;
};

function SudokuCell({ value }: SudokuCellProps) {
  return (
    <div className={styles.cell}>
      {value === 0 ? "" : value}
    </div>
  )
}

export default SudokuCell;