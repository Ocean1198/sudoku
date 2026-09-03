import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import { findViolations, checkAnswer } from '../lib/sudokuRules'
import SudokuBoard from './SudokuBoard';
import { type CellState } from './SudokuCell';
import NumberPad from './NumberPad';
import GameControls from './GameControls';
import { type GameConfig } from './NewGameForm';
import NewGameForm from './NewGameForm';
import styles from './SudokuGame.module.css';

function createGame(br: number, bc: number, level: number, seed?: number) {
  const { answer, puzzle } = generate(br, bc, level, seed);
  return {
    answer,
    puzzle,
    current: puzzle.map(row =>
      row.map(value => ({
        value,
        isUserInput: value === 0,
        isConflict: false,
        isRevealed: false,
      }))
    ),
  };
}

function SudokuGame() {
  const [initialGame] = useState(() => createGame(3, 3, 0));
  const [solution, setSolution] = useState<number[][]>(initialGame.answer);
  const [puzzle, setPuzzle] = useState<number[][]>(initialGame.puzzle);
  const [current, setCurrent] = useState<CellState[][]>(initialGame.current);

  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "gave_up">("playing");

  type AssistState = {
    hintCount: number;
    wrongCheckCount: number;
  }
  const [assistState, setAssistState] = useState<AssistState>({
    hintCount: 0, // 현재는 힌트 기능이 없으므로 0으로 고정, 이후에 추가
    wrongCheckCount: 0
  });

  const [selected, setSelected] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const [config, setConfig] = useState<GameConfig>({
    br: 3,
    bc: 3,
    level: 0
  });
  
  const generateSudoku = (br: number, bc: number, level: number, seed?: number) => {
    const game = createGame(br, bc, level, seed);
    setSolution(game.answer);
    setPuzzle(game.puzzle);
    setCurrent(game.current);
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
    if (gameStatus !== "playing") return;
    if (row < 0 || row >= config.br * config.bc || col < 0 || col >= config.br * config.bc) return;
    setSelected({ row, col });
  };

  const handleInput = (value: number) => {
    if (gameStatus !== "playing") return;
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
    if (gameStatus !== "playing") return;
    const currentValues = current.map(row => row.map(cell => cell.value));
    const isCorrect = checkAnswer(currentValues, solution, config.br * config.bc);
    const isComplete = currentValues.every(row => row.every(value => value !== 0));
    if (isCorrect && isComplete) {
      const score = 100 - (assistState.wrongCheckCount * 10 + assistState.hintCount * 30);
      if (score === 100) {
        alert("Perfect!");
      } else if (score >= 70) {
        alert("You won!");
      } else {
        alert("Well done!");
      }
      setSelected(null);
      setGameStatus("won");
    } else if (isCorrect) {
      alert("keep going!");
    } else {
      setAssistState(prev => ({ ...prev, wrongCheckCount: prev.wrongCheckCount + 1 }));
      alert("something is wrong...");
    }
  }

  const handleGiveUp = () => {
    if (gameStatus !== "playing") return;
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
    setSelected(null);
    setGameStatus("gave_up");
  }

  useEffect(() => {
    const handleKeyDown = (e : KeyboardEvent) => {

      if (selected === null) {
        handleSelect(0, 0);
        return;
      }

      switch (e.key) {
        case "ArrowUp" : 
          handleSelect(selected.row - 1, selected.col);
          return;
        case "ArrowDown" :
          handleSelect(selected.row + 1, selected.col);
          return;
        case "ArrowLeft" :
          handleSelect(selected.row, selected.col - 1);
          return;
        case "ArrowRight" :
          handleSelect(selected.row, selected.col + 1);
          return;
        case "Enter" : 
          handleCheck();
          return;
        default:
          if (e.code >= "Digit0" && e.code <= "Digit9") {
            const value = Number(e.code.replace("Digit", ""));

            if (e.shiftKey) handleInput(value + 10);
            else handleInput(value);
          }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, gameStatus, current, puzzle, solution, config, assistState]);

  return (
    <main className={styles.game}>
      <SudokuBoard
        puzzle={current}
        blockRows={config.br}
        blockColumns={config.bc}
        selected={selected}
        onSelect={handleSelect}
      />
      <NumberPad
        disabled={gameStatus !== "playing"}
        size={config.br * config.bc}
        onInput={handleInput}
      />
      <GameControls
        disabled={gameStatus !== "playing"}
        onCheck={handleCheck}
        onGiveUp={handleGiveUp}
      />
      {gameStatus !== "playing" && (
        <NewGameForm
          initialConfig={config}
          onStart={(newConfig: GameConfig) => {
            setConfig(newConfig);
            generateSudoku(newConfig.br, newConfig.bc, newConfig.level, newConfig.seed);
            setGameStatus("playing");
            setSelected(null);
          }}
        />
      )}
    </main>
  );
}

export default SudokuGame
