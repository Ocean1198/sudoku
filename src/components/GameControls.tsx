type GameControlsProps = {
  onCheck: () => void;
  onGiveUp: () => void;
};

function GameControls({ onCheck, onGiveUp } : GameControlsProps) {
  return (
    <div>
      <button
        onClick={onCheck}
      >
        Check
      </button>
      <button
        onClick={onGiveUp}
      >
        Give Up
      </button>
    </div>
  )
}

export default GameControls;