import styles from "./NumberPad.module.css";

type NumberPadProps = {
  disabled?: boolean;
  size: number;
  onInput: (value: number) => void;
};

function NumberPad ({ disabled, size, onInput }: NumberPadProps) {
  return (
    <div className={styles.pad}>
      {Array.from({ length: size + 1 }, (_, i) => (
        <button 
          key={i}
          className={styles.button}
          onClick={() => onInput(i)}
          disabled={disabled}
        >
          {i}
        </button>
      ))}
    </div>
  )
}

export default NumberPad