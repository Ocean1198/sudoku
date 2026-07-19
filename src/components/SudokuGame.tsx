import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import { findViolations, checkAnswer } from '../lib/sudokuRules'
import SudokuBoard from './SudokuBoard';
import NumberPad from './NumberPad';

function SudokuGame() {
  const [solution, setSolution] = useState<number[][]>([]);
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [current, setCurrent] = useState<number[][]>([]);

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
    setCurrent(puzzle.map(row => row.slice()));
  }

  const handleSelect = (row: number, col: number) => {
    setSelected({ row, col });
  };

  const handleInput = (value: number) => {
    if (selected === null) return;
    if (puzzle[selected.row][selected.col] !== 0) return;
    if (current[selected.row][selected.col] === value) return;
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      next[selected.row][selected.col] = value;
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
    </>
  );
}

export default SudokuGame