import styles from './GameControls.module.css';

type GameControlsProps = {
  disabled: boolean;
  isMemoMode: boolean;
  onMemo: () => void;
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, isMemoMode, onMemo, onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={`${styles.checkButton} ${isMemoMode ? styles.memoActive : ''}`}
        onClick={onMemo}
        disabled={disabled}
        aria-pressed={isMemoMode}
        aria-label="메모 모드"
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
