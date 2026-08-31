import SudokuCell, { type CellState } from './SudokuCell'
import styles from './SudokuBoard.module.css'

type SudokuBoardProps = {
  puzzle: CellState[][];
  blockRows: number;
  blockColumns: number;
  selected: {
    row: number;
    col: number;
  } | null;
  onSelect: (row: number, col: number) => void;
};

function SudokuBoard({ puzzle, blockRows, blockColumns, selected, onSelect }: SudokuBoardProps) {
  return (
    <div
      className={styles.board}
      style={{ gridTemplateColumns: `repeat(${puzzle.length}, minmax(0, 1fr))` }}
    >
      {puzzle.map((row, r) => (
        row.map((cell, c) => (
          <SudokuCell
            key={`${r}-${c}`}
            row={r}
            col={c}
            state={cell}
            isSelected={selected?.row === r && selected?.col === c}
            isBlockRight={(c + 1) % blockColumns === 0 && c + 1 < puzzle.length}
            isBlockBottom={(r + 1) % blockRows === 0 && r + 1 < puzzle.length}
            onSelect={onSelect}
          />
        ))
      ))}
    </div>
  );
};

export default SudokuBoard;
