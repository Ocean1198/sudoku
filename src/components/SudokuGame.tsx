import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import { findViolations, checkAnswer } from '../lib/sudokuRules'
import SudokuBoard from './SudokuBoard';
import { type CellState } from './SudokuCell';
import NumberPad from './NumberPad';
import GameControls from './GameControls';

function SudokuGame() {
  const [solution, setSolution] = useState<number[][]>([]);
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [current, setCurrent] = useState<CellState[][]>([]);

  const [selected, setSelected] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [config, setConfig] = useState({
    br: 3,
    bc: 3,
    level: 0
  });
  
  const generateSudoku = (br: number, bc: number, level: number) => {
    const { answer, puzzle } = generate(br, bc, level);
    setSolution(answer);
    setPuzzle(puzzle);
    setCurrent(
      puzzle.map(row =>
        row.map(value => ({
          value,
          isUserInput: value === 0,
          isConflict: false,
          isRevealed: false,
        }))
      )
    );
  }

  const paintBoard = (): void => {
    setCurrent(prev => {
      const cells: CellState[][] = prev.map(row => row.map(cell => ({ ...cell })));
      const currentValue = cells.map(row => row.map(cell => cell.value));
      const violations: Set<string> = findViolations(currentValue, config.br, config.bc);
      const size = config.br * config.bc;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          const key = `${r},${c}`;
          cells[r][c].isConflict = violations.has(key);
        }
      }
      return cells;
    });
  }

  const handleSelect = (row: number, col: number) => {
    setSelected({ row, col });
  };

  const handleInput = (value: number) => {
    if (selected === null) return;
    if (puzzle[selected.row][selected.col] !== 0) return;
    if (current[selected.row][selected.col].value === value) return;
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      next[selected.row][selected.col].isUserInput = true;
      next[selected.row][selected.col].value = value;
      return next;
    });
    paintBoard();
  }

  const handleCheck = () => {
    const currentValues = current.map(row => row.map(cell => cell.value));
    const isCorrect = checkAnswer(currentValues, solution, config.br * config.bc);
    if (isCorrect) {
      alert("keep going!");
    } else {
      alert("something is wrong...");
    }
  }

  const handleGiveUp = () => {
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      for (let r = 0; r < config.br * config.bc; r++) {
        for (let c = 0; c < config.br * config.bc; c++) {
          if (puzzle[r][c] !== 0) continue;
          next[r][c].value = solution[r][c];
          next[r][c].isUserInput = false;
          next[r][c].isConflict = false;
          next[r][c].isRevealed = true;
        }
      }
      return next;
    });
  }

  useEffect(() => {
    generateSudoku(config.br, config.bc, config.level);
  }, []);

  return (
    <>
      <SudokuBoard
        puzzle={current}
        selected={selected}
        onSelect={handleSelect}
      />
      <NumberPad
        size={config.br * config.bc}
        onInput={handleInput}
      />
      <GameControls
        onCheck={handleCheck}
        onGiveUp={handleGiveUp}
      />
    </>
  );
}

export default SudokuGame