import { useState } from "react";
import styles from './NewGameForm.module.css';

export interface GameConfig {
  br: number; // block rows
  bc: number; // block columns
  level: number; // difficulty level
  seed?: number; // optional seed for puzzle generation
}

type NewGameFormProps = {
  initialConfig: GameConfig;
  onStart: (config: GameConfig) => void;
};

function NewGameForm({ initialConfig, onStart }: NewGameFormProps) {
  const [br, setBr] = useState(initialConfig.br);
  const [bc, setBc] = useState(initialConfig.bc);
  const [level, setLevel] = useState(initialConfig.level);
  const [seed, setSeed] = useState(initialConfig.seed?.toString() ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSeed = Number.parseInt(seed, 10);
    onStart({ br, bc, level, ...(Number.isNaN(parsedSeed) ? {} : { seed: parsedSeed }) });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Start a new game</h2>
      <div className={styles.fields}>
        <label>
          <span>Block rows</span>
          <input
            type="number"
            value={br}
            onChange={(e) => setBr(parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </label>
        <label>
          <span>Block columns</span>
          <input
            type="number"
            value={bc}
            onChange={(e) => setBc(parseInt(e.target.value) || 0)}
            min="1"
            required
          />
        </label>
        <label>
          <span>Level</span>
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
            min="0"
            max="3"
            required
          />
        </label>
        <label>
          <span>Seed (optional)</span>
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
          />
        </label>
      </div>
      <button type="submit">
        Start Game
      </button>
    </form>
  );
}

export default NewGameForm;
