import styles from "./NumberPad.module.css";
import { Eraser } from 'lucide-react';

type NumberPadProps = {
  disabled?: boolean;
  size: number;
  completedNumbers: boolean[];
  onInput: (value: number) => void;
};

function NumberPad ({ disabled, size, completedNumbers, onInput }: NumberPadProps) {
  return (
    <div className={styles.pad}>
      {Array.from({ length: size + 1 }, (_, i) => (
        <button 
          key={i}
          className={styles.button + (completedNumbers[i] && i !== 0 ? " " + styles.completed : "")}
          onClick={() => onInput(i)}
          disabled={disabled}
        >
          {i === 0 ? <Eraser size={18} /> : i}
        </button>
      ))}
    </div>
  )
}

export default NumberPad