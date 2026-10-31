import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} · ${hours}:${mins}`;
}

export default function History({ onBack }) {
  const entries = useLiveQuery(() => db.history.orderBy('date').reverse().toArray()) || [];

  return (
    <>
      <div className="header">
        <button className="menu-btn" onClick={onBack}>←</button>
        <h1>Historie</h1>
        <div style={{ width: 40 }} />
      </div>
      <div className="settings-view">
        {entries.length === 0 && (
          <div style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: 40 }}>
            Noch keine Workouts absolviert.
          </div>
        )}
        {entries.map(e => (
          <div key={e.id} className="history-card">
            <div className="history-name">{e.name}</div>
            <div className="history-date">{formatDate(e.date)}</div>
            <div className="history-details">
              {e.workTime}/{e.restTime}s · {e.exercises} Übungen · {e.rounds} Runden · {formatDuration(e.totalDuration)} gesamt
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
