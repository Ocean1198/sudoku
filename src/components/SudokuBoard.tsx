import SudokuCell from './SudokuCell'
import styles from './SudokuBoard.module.css'

type SudokuBoardProps = {
  puzzle: number[][];
};

function SudokuBoard({ puzzle }: SudokuBoardProps) {
  return (
    <div className={styles.board}>
      {puzzle.map((row, r) => (
        <div className={styles.row} key = {r}>
          {row.map((value, c) => (
            <SudokuCell
              key={`${r}-${c}`}
              value={value}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;