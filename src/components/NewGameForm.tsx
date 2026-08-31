import { useState } from "react";

export interface GameConfig {
  br: number; // block rows
  bc: number; // block columns
  level: number; // difficulty level
  seed?: number; // optional seed for puzzle generation
}

type NewGameFormProps = {
  disabled?: boolean;
  initialConfig: GameConfig;
  onStart: (config: GameConfig) => void;
};

function NewGameForm({ disabled, initialConfig, onStart }: NewGameFormProps) {
  const [br, setBr] = useState(initialConfig.br);
  const [bc, setBc] = useState(initialConfig.bc);
  const [level, setLevel] = useState(initialConfig.level);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ br, bc, level });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Block Rows:
          <input
            type="number"
            value={br}
            onChange={(e) => setBr(parseInt(e.target.value) || 0)}
            disabled={disabled}
          />
        </label>
      </div>
      <div>
        <label>
          Block Columns:
          <input
            type="number"
            value={bc}
            onChange={(e) => setBc(parseInt(e.target.value) || 0)}
            disabled={disabled}
          />
        </label>
      </div>
      <div>
        <label>
          Level:
          <input
            type="number"
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value) || 0)}
            disabled={disabled}
          />
        </label>
      </div>
      <div>
        <label>
          Seed (optional):
          <input
            type="number"
            onChange={(e) => {
              const seed = parseInt(e.target.value);
              if (!isNaN(seed)) {
                onStart({ br, bc, level, seed });
              }
            }}
            disabled={disabled}
          />
        </label>
      </div>
      <button type="submit" disabled={disabled}>
        Start Game
      </button>
    </form>
  );
}

export default NewGameForm;