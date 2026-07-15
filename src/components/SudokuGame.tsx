import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import SudokuBoard from './SudokuBoard';

function SudokuGame() {
  const [solution, setSolution] = useState<number[][]>([]);
  const [puzzle, setPuzzle] = useState<number[][]>([]);
  const [current, setCurrent] = useState<number[][]>([]);

  const [selected, setSelected] = useState<{
    row: Number;
    col: Number;
  } | null>(null);

  const [br, setBr] = useState(3);
  const [bc, setBc] = useState(3);
  
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