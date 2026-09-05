import SudokuCell, { type CellState } from './SudokuCell'
import styles from './SudokuBoard.module.css'

type SudokuBoardProps = {
  puzzle: CellState[][];
  memoBoard: number[][][];
  blockRows: number;
  blockColumns: number;
  selected: {
    row: number;
    col: number;
  } | null;
  onSelect: (row: number, col: number) => void;
};

function SudokuBoard({ puzzle, memoBoard, blockRows, blockColumns, selected, onSelect }: SudokuBoardProps) {
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
            memo={memoBoard[r]?.[c] ?? []}
            isSelected={selected?.row === r && selected?.col === c}
            isSameGroup={selected ? selected.row === r || selected.col === c ||
                                    Math.floor(selected.row / blockRows) === Math.floor(r / blockRows) && Math.floor(selected.col / blockColumns) === Math.floor(c / blockColumns) 
                                    : false}
            isSameNumber={selected ? puzzle[selected.row][selected.col].value === cell.value && cell.value !== 0 : false}
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
