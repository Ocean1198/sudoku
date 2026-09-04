import styles from './GameControls.module.css';

type GameControlsProps = {
  disabled: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isMemoMode: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onMemo: () => void;
  onCheck: () => void;
  onRestart: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, canUndo, canRedo, isMemoMode, onUndo, onRedo, onMemo, onCheck, onRestart, onGiveUp } : GameControlsProps) {
  return (
    <div className={styles.controls}>
      <button
        className={styles.historyButton}
        onClick={onUndo}
        disabled={disabled || !canUndo}
        aria-label="Undo"
        title="Undo"
      >
        <span className={styles.historyIcon} aria-hidden="true">↶</span>
      </button>

      <button
        className={styles.historyButton}
        onClick={onRedo}
        disabled={disabled || !canRedo}
        aria-label="Redo"
        title="Redo"
      >
        <span className={styles.historyIcon} aria-hidden="true">↷</span>
      </button>
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
        className={styles.checkButton}
        onClick={onRestart}
        disabled={disabled}
      >
        restart
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
