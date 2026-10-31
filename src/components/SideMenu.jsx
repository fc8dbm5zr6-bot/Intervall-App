import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { calcDuration } from '../utils/duration';

export default function SideMenu({ isOpen, onClose, onSelectWorkout, activeWorkoutId, onOpenSettings, onOpenHistory, onOpenEditor }) {
  const workouts = useLiveQuery(() => db.workouts.toArray()) || [];

  async function handleDelete(e, id) {
    e.stopPropagation();
    await db.workouts.delete(id);
  }

  return (
    <>
      <div className={`menu-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h2>Menü</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="menu-section">
          <div className="menu-section-title">Workout laden</div>
          {workouts.map(w => (
            <div key={w.id} className={`menu-item ${w.id === activeWorkoutId ? 'active' : ''}`}>
              <button
                className="menu-item-btn"
                onClick={() => { onSelectWorkout(w); onClose(); }}
              >
                <span className="icon">⏱</span>
                <span>{w.name}</span>
                <span className="meta">{calcDuration(w)} min</span>
              </button>
              {workouts.length > 1 && (
                <button className="delete-mini" onClick={(e) => handleDelete(e, w.id)}>✕</button>
              )}
            </div>
          ))}

          {workouts.length < 12 && (
            <button className="menu-item" onClick={() => { onOpenEditor(); onClose(); }}>
              <span className="icon">＋</span>
              <span>Neues Workout</span>
            </button>
          )}
        </div>

        <div className="menu-bottom">
          <button className="menu-item" onClick={() => { onOpenHistory(); onClose(); }}>
            <span className="icon">📋</span>
            <span>Historie</span>
          </button>
          <button className="menu-item" onClick={() => { onOpenSettings(); onClose(); }}>
            <span className="icon">⚙</span>
            <span>Einstellungen</span>
          </button>
        </div>
      </div>
    </>
  );
}
