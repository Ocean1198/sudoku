import styles from './GameControls.module.css';

type GameControlsProps = {
  disabled: boolean;
  onMemo: () => void;
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, onMemo, onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.checkButton}
        onClick={onMemo}
        disabled={disabled}
      >
        ✎
      </button>
      <button
        className={styles.checkButton}
        onClick={onCheck}
        disabled={disabled}
      >
        Check
      </button>
      <button
        className={styles.giveUpButton}
        onClick={onGiveUp}
        disabled={disabled}
      >
        Give Up
      </button>
    </div>
  )
}

export default GameControls;
