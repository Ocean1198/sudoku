import { useEffect, useState } from 'react';
import { generate } from '../lib/sudokuGenerator';
import { findViolations, checkAnswer } from '../lib/sudokuRules'
import Timer from './Timer';
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
    memo: puzzle.map(row => row.map(() => [])),
  };
}

function SudokuGame() {
  const [initialGame] = useState(() => createGame(3, 3, 0));
  const [solution, setSolution] = useState<number[][]>(initialGame.answer);
  const [puzzle, setPuzzle] = useState<number[][]>(initialGame.puzzle);
  const [current, setCurrent] = useState<CellState[][]>(initialGame.current);
  const [memoStatus, setMemoStatus] = useState<boolean>(false);
  const [memoBoard, setMemoBoard] = useState<number[][][]>(initialGame.memo); // row, col, num

  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "gave_up">("playing");

  type AssistState = {
    hintCount: number;
    wrongCheckCount: number;
  }
  const [assistState, setAssistState] = useState<AssistState>({
    hintCount: 0,
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

  type Move = {
    row: number;
    col: number;
    prevValue: number;
    newValue: number;
    prevMemo: number[];
    newMemo: number[];
    changedMemo: MemoChange[];
  }
  type MemoChange = {
    row: number;
    col: number;
    removedMemo: number;
  }
  const [undoStack, setUndoStack] = useState<Move[]>([]);
  const [redoStack, setRedoStack] = useState<Move[]>([]);

  const [startTime, setStartTime] = useState<number | null>(Date.now);
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    if (startTime === null || gameStatus !== "playing") return;
    const interval = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTime) / 1000));
    }, 200);
    return () => clearInterval(interval);
  }, [startTime, gameStatus]);
  
  const generateSudoku = (br: number, bc: number, level: number, seed?: number) => {
    const game = createGame(br, bc, level, seed);
    setSolution(game.answer);
    setPuzzle(game.puzzle);
    setCurrent(game.current);
    setMemoBoard(game.memo);
    setMemoStatus(false);
    setAssistState({ hintCount: 0, wrongCheckCount: 0 });
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
    if (memoStatus === false) handleNumberInput(value);
    else handleMemoInput(value);
  }
  
  const handleNumberInput = (value: number) => {
    if (selected === null) return;
    if (puzzle[selected.row][selected.col] !== 0) return;
    if (current[selected.row][selected.col].value === value) return;

    const prevValue = current[selected.row][selected.col].value;
    const prevMemo = [...memoBoard[selected.row][selected.col]];
    const changedMemo: MemoChange[] = [];

    for (let r = 0; r < config.br * config.bc; r++) {
      for (let c = 0; c < config.br * config.bc; c++) {
        if (r === selected.row && c === selected.col) continue;
        if (r === selected.row || c === selected.col ||
          (Math.floor(r / config.br) === Math.floor(selected.row / config.br) &&
            Math.floor(c / config.bc) === Math.floor(selected.col / config.bc))) {
          if (memoBoard[r][c].includes(value)) {
            changedMemo.push({ row: r, col: c, removedMemo: value });
          }
        }
      }
    }

    setRedoStack([]);

    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      next[selected.row][selected.col].isUserInput = true;
      next[selected.row][selected.col].value = value;
      return next;
    });
    setMemoBoard(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[selected.row][selected.col] = [];
      for (let r = 0; r < config.br * config.bc; r++) {
        for (let c = 0; c < config.br * config.bc; c++) {
          if (r === selected.row && c === selected.col) continue;
          if (r === selected.row || c === selected.col || 
            Math.floor(r / config.br) === Math.floor(selected.row / config.br) && 
            Math.floor(c / config.bc) === Math.floor(selected.col / config.bc)) {
            if (next[r][c].includes(value)) {
              next[r][c] = next[r][c].filter(num => num !== value);
            }
          }
        }
      }
      return next;
    });
    setUndoStack(prev => [...prev, {
      row: selected.row,
      col: selected.col,
      prevValue: prevValue,
      newValue: value,
      prevMemo: prevMemo,
      newMemo: [],
      changedMemo: changedMemo
    }]);
    paintBoard();
  }

  const handleMemoInput = (value: number) => {
    if (selected === null) return;
    if (puzzle[selected.row][selected.col] !== 0) return;
    if (current[selected.row][selected.col].value !== 0) return;

    const row = selected.row;
    const col = selected.col;

    setMemoBoard(prev => {
      const prevMemo = prev[row][col];
      let newMemo: number[];

      if (value === 0) {
        newMemo = [];
      } else if (prevMemo.includes(value)) {
        newMemo = prevMemo.filter(num => num !== value);
      } else {
        newMemo = [...prevMemo, value].sort((a, b) => a - b);
      }

      setUndoStack(prev => [...prev, {
        row,
        col,
        prevValue: 0,
        newValue: 0,
        prevMemo: [...prevMemo],
        newMemo: [...newMemo],
        changedMemo: []
      }]);

      setRedoStack([]);

      const next = prev.map(row => row.map(cell => [...cell]));
      next[row][col] = newMemo;

      return next;
    });
  };


  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const lastMove = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      next[lastMove.row][lastMove.col].value = lastMove.prevValue;
      next[lastMove.row][lastMove.col].isUserInput = lastMove.prevValue !== 0;
      return next;
    });
    setMemoBoard(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[lastMove.row][lastMove.col] = lastMove.prevMemo;
      for (const change of lastMove.changedMemo) {
        next[change.row][change.col] = [...next[change.row][change.col], change.removedMemo].sort((a, b) => a - b);
      }
      return next;
    });
    setRedoStack(prev => [...prev, lastMove]);
    paintBoard();
  }

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lastMove = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      next[lastMove.row][lastMove.col].value = lastMove.newValue;
      next[lastMove.row][lastMove.col].isUserInput = lastMove.newValue !== 0;
      return next;
    });
    setMemoBoard(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      next[lastMove.row][lastMove.col] = lastMove.newMemo;
      for (const change of lastMove.changedMemo) {
        next[change.row][change.col] = next[change.row][change.col].filter(num => num !== change.removedMemo);
      }
      return next;
    });
    setUndoStack(prev => [...prev, lastMove]);
    paintBoard();
  }

  const handleHint = () => {
    if (gameStatus !== "playing") return;
    if (selected === null) return;
    if (puzzle[selected.row][selected.col] !== 0) return;
    const correctValue = solution[selected.row][selected.col];
    handleNumberInput(correctValue);
    setAssistState(prev => ({ ...prev, hintCount: prev.hintCount + 1 }));
    paintBoard();
  }

  const handleMemo = () => {
    if (gameStatus !== "playing") return;
    setMemoStatus(prev => !prev);
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

  const handleRestart = () => {
    if (gameStatus !== "playing") return;
    setCurrent(prev => {
      const next = prev.map(row => row.slice());
      for (let r = 0; r < config.br * config.bc; r++) {
        for (let c = 0; c < config.br * config.bc; c++) {
          next[r][c].value = puzzle[r][c];
          next[r][c].isUserInput = puzzle[r][c] === 0;
          next[r][c].isConflict = false;
          next[r][c].isRevealed = false;
        }
      }
      return next;
    });
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
    setMemoBoard(prev => {
      const next = prev.map(row => row.map(cell => [...cell]));
      for (let r = 0; r < config.br * config.bc; r++) {
        for (let c = 0; c < config.br * config.bc; c++) {
          if (puzzle[r][c] !== 0) continue;
          next[r][c] = [];
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
          e.preventDefault();
          handleSelect(selected.row - 1, selected.col);
          return;
        case "ArrowDown" :
          e.preventDefault();
          handleSelect(selected.row + 1, selected.col);
          return;
        case "ArrowLeft" :
          e.preventDefault();
          handleSelect(selected.row, selected.col - 1);
          return;
        case "ArrowRight" :
          e.preventDefault();
          handleSelect(selected.row, selected.col + 1);
          return;
        case "Enter" : 
          handleCheck();
          return;
        case "Backspace" :
        case "Delete" :
          handleInput(0);
          return;
        case "m" :
        case "M" :
          handleMemo();
          return;
        case "z" : 
        case "Z" : 
          handleUndo();
          return;
        case "x" : 
        case "X" : 
          handleRedo();
          return;
        case "h" : 
        case "H" : 
          handleHint();
          return;
        default:
          if (e.code >= "Digit0" && e.code <= "Digit9") {
            const digit = Number(e.code.replace("Digit", ""));

            const inputValue = e.shiftKey ? digit + 10 : digit;

            if (inputValue <= config.br * config.bc) {
              handleInput(inputValue);
            }
          }
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected, gameStatus, current, puzzle, solution, config, assistState, memoStatus]);

  return (
    <main className={styles.game}>
      <Timer
        timer={timer}
      />
      <SudokuBoard
        puzzle={current}
        memoBoard={memoBoard}
        blockRows={config.br}
        blockColumns={config.bc}
        selected={selected}
        onSelect={handleSelect}
      />
      <NumberPad
        disabled={gameStatus !== "playing"}
        size={config.br * config.bc}
        completedNumbers={Array.from({ length: config.br * config.bc + 1 }, (_, i) => {
          return current.flat().filter(cell => cell.value === i).length >= config.br * config.bc;
        })}
        onInput={handleInput}
      />
      <GameControls
        disabled={gameStatus !== "playing"}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        isMemoMode={memoStatus}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onHint={handleHint}
        onMemo={handleMemo}
        onCheck={handleCheck}
        onRestart={handleRestart}
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
            setTimer(0);
            setStartTime(Date.now());
          }}
        />
      )}
    </main>
  );
}

export default SudokuGame
