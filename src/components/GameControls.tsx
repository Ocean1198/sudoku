type GameControlsProps = {
  disabled: boolean;
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div>
      <button
        disabled={disabled}
        onClick={onCheck}
      >
        Check
      </button>
      <button
        disabled={disabled}
        onClick={onGiveUp}
      >
        Give Up
      </button>
    </div>
  )
}

export default GameControls;