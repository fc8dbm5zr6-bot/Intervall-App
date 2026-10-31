export default function Controls({ timer, onStart }) {
  const { phase, isPaused, togglePause, stop } = timer;
  const isRunning = phase !== 'idle' && phase !== 'finished';

  if (phase === 'finished') return null;

  return (
    <div className="controls">
      {isRunning && (
        <button className="stop-btn" onClick={stop}>■</button>
      )}

      <button
        className={`play-btn ${isRunning ? phase : ''}`}
        onClick={isRunning ? togglePause : onStart}
      >
        <img
          src={isRunning && !isPaused ? '/icon-pause.png' : '/icon-play.png'}
          alt={isRunning && !isPaused ? 'Pause' : 'Play'}
          className="btn-icon-img"
        />
      </button>
    </div>
  );
}
