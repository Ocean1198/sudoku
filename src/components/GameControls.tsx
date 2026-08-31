import styles from './GameControls.module.css';

type GameControlsProps = {
  disabled: boolean;
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div className={styles.controls}>
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
