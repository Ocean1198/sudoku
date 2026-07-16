import styles from "./NumberPad.module.css";

type NumberPadProps = {
  size: number;
  onInput: (value: number) => void;
};

function NumberPad ({ size, onInput }: NumberPadProps) {
    return (
        <div className={styles.pad}>
            {Array.from({ length: size + 1 }, (_, i) => (
                <button 
                    key={i}
                    className={styles.button}
                    onClick={() => onInput(i)}
                >
                    {i}
                </button>
            ))}
        </div>
    )
}

export default NumberPad