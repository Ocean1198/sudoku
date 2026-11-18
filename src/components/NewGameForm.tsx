import { useState } from "react";
import { RULE_OPTIONS, type RuleId } from "../lib/RuleManager";
import styles from './NewGameForm.module.css';

export interface GameConfig {
  br: number; // block rows
  bc: number; // block columns
  level: number; // difficulty level
  rules: RuleId[]; // applied rules
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
  const [rules, setRules] = useState<RuleId[]>(initialConfig.rules);

  const toggleRule = (id: RuleId) => {
    setRules(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (br * bc > 16) {
      alert("The total number of cells (br * bc) must not exceed 16.");
      return;
    }
    const parsedSeed = Number.parseInt(seed, 10);
    onStart({ br, bc, level, rules, ...(Number.isNaN(parsedSeed) ? {} : { seed: parsedSeed }) });
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
      <fieldset className={styles.rules}>
        <legend>Rules</legend>
        {RULE_OPTIONS.map(opt => (
          <label key={opt.id} className={styles.ruleOption}>
            <input
              type="checkbox"
              checked={rules.includes(opt.id)}
              disabled={opt.required}
              onChange={() => toggleRule(opt.id)}
            />
            <span className={styles.ruleName}>{opt.label}</span>
            <span className={styles.ruleDesc}>{opt.description}</span>
          </label>
        ))}
      </fieldset>
      <button type="submit">
        Start Game
      </button>
    </form>
  );
}

export default NewGameForm;
