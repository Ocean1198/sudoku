import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import SudokuBoard from './SudokuBoard';

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

  useEffect(() => {
    generateSudoku(config.br, config.bc, config.level);
  }, []);

  return (
    <SudokuBoard
      /* prop 전달 */
      puzzle={puzzle}
      selected={selected}
      onSelect={handleSelect}
    />
  );
}

export default SudokuGame