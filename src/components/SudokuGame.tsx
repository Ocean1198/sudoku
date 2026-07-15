import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import SudokuBoard from './SudokuBoard';

function SudokuGame() {
  const [solution, setSolution] = useState<number[][]>([]);
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [current, setCurrent] = useState<number[][]>([]);
  
  const generateSudoku = (br: number, bc: number, level: number) => {
    const { answer, puzzle } = generate(br, bc, level);
    setSolution(answer);
    setPuzzle(puzzle);
    setCurrent(puzzle.map(row => row.slice()));
  }

  useEffect(() => {
    generateSudoku(3, 3, 0);
  }, []);

  return (
    <SudokuBoard
      /* prop 전달 */
      puzzle={puzzle}
    />
  );
}

export default SudokuGame