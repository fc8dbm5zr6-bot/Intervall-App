const PHASE_LABELS = {
  idle: '',
  warmup: 'Aufwärmen',
  work: 'Aktivität',
  rest: 'Pause',
  roundRest: 'Rundenpause',
  finished: 'Fertig',
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function TimerDisplay({ timer }) {
  const { phase, timeLeft, currentExercise, totalExercises, currentRound, totalRounds, isPaused } = timer;
  const isRunning = phase !== 'idle' && phase !== 'finished';

  return (
    <div className="timer-display">
      {isRunning && (
        <span className={`phase-label ${phase}`}>
          {PHASE_LABELS[phase]}
        </span>
      )}

      <div className={`time-value ${isRunning ? phase : ''}`}>
        {isRunning ? formatTime(timeLeft) : '00:00'}
      </div>

      {isRunning && (
        <div className="progress-info">
          <div className="progress-block">
            <span className="progress-label">Übung</span>
            <span className="progress-val">{currentExercise}/{totalExercises}</span>
          </div>
          <div className="progress-divider" />
          <div className="progress-block">
            <span className="progress-label">Runde</span>
            <span className="progress-val">{currentRound}/{totalRounds}</span>
          </div>
        </div>
      )}

      {isPaused && <span className="phase-label" style={{ color: 'var(--text-dim)' }}>PAUSIERT</span>}
    </div>
  );
}
