import styles from './Timer.module.css';

type TimerProps = {
  timer: number; // second
};

function Timer({ timer } : TimerProps) {
  const days = Math.floor(timer / 86400);
  const hours = Math.floor((timer % 86400) / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;
  return (
    <div className={styles.timer}>
      {days > 0 && <span>{days.toString().padStart(2, '0')}:</span>}
      {days > 0 && <span>{hours.toString().padStart(2, '0')}:</span>}
      {days === 0 && hours > 0 && <span>{hours.toString().padStart(2, '0')}:</span>}
      <span>{minutes.toString().padStart(2, '0')}:</span>
      <span>{seconds.toString().padStart(2, '0')}</span>
    </div>
  );
}

export default Timer;