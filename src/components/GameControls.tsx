type GameControlsProps = {
  disabled: boolean;
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ disabled, onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div>
      <button
        onClick={onCheck}
        disabled={disabled}
      >
        Check
      </button>
      <button
        onClick={onGiveUp}
        disabled={disabled}
      >
        Give Up
      </button>
    </div>
  )
}

export default GameControls;