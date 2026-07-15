import SudokuCell from './SudokuCell'
import styles from './SudokuBoard.module.css'

type SudokuBoardProps = {
  puzzle: number[][];
  selected: {
    row: number;
    col: number;
  } | null;
  onSelect: (row: number, col: number) => void;
};

function SudokuBoard({ puzzle, selected, onSelect }: SudokuBoardProps) {
  return (
    <div className={styles.board}>
      {puzzle.map((row, r) => (
        <div className={styles.row} key = {r}>
          {row.map((value, c) => (
            <SudokuCell
              row={r}
              col={c}
              value={value}
              selected={
                selected?.row === r &&
                selected?.col === c
              }
              onSelect={onSelect}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;