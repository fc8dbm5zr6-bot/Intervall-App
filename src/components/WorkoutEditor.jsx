import { useState } from 'react';
import { db } from '../db';
import { calcDuration } from '../utils/duration';
import WorkoutCards from './WorkoutCards';

export default function WorkoutEditor({ onBack, onSaved }) {
  const [name, setName] = useState('');
  const [params, setParams] = useState({
    workTime: 40,
    restTime: 20,
    exercises: 8,
    rounds: 5,
    roundRest: 60,
  });

  async function handleSave() {
    const count = await db.workouts.count();
    if (count >= 12) return;
    const id = await db.workouts.add({ ...params, name: name || 'Neues Workout' });
    const w = await db.workouts.get(id);
    onSaved?.(w);
    onBack();
  }

  return (
    <>
      <div className="header">
        <button className="menu-btn" onClick={onBack}>←</button>
        <h1>Neues Workout</h1>
        <div style={{ width: 40 }} />
      </div>
      <div className="editor-view">
        <div className="field-group">
          <div className="field-label">Name</div>
          <input
            className="field-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z.B. HIIT 30/15"
          />
        </div>

        <WorkoutCards params={params} onChange={setParams} />

        <div style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: 15, margin: '16px 0 0' }}>
          Gesamtdauer: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{calcDuration(params)} min</span>
        </div>

        <div className="btn-row" style={{ marginTop: 24, padding: '0 20px' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>Speichern</button>
        </div>
      </div>
    </>
  );
}
