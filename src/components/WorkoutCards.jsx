import { useState } from 'react';

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function EditModal({ label, value, isTime, onSave, onClose, min = 0, max = 300, step = 5 }) {
  const [val, setVal] = useState(value);

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div className="edit-modal" onClick={e => e.stopPropagation()}>
        <div className="edit-modal-title">{label}</div>
        <div className="number-row" style={{ justifyContent: 'center', padding: '20px 0' }}>
          <button className="number-btn big" onClick={() => setVal(v => Math.max(min, v - step))}>−</button>
          <span className="number-value big">{isTime ? formatTime(val) : val}</span>
          <button className="number-btn big" onClick={() => setVal(v => Math.min(max, v + step))}>＋</button>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => { onSave(val); onClose(); }}>
          Übernehmen
        </button>
      </div>
    </div>
  );
}

const CARDS = [
  { key: 'workTime',  label: 'Aktivität',    icon: '/icon-play.png',   color: 'work',      isTime: true,  min: 5,  max: 300, step: 5 },
  { key: 'restTime',  label: 'Pause',        icon: '/icon-pause.png',  color: 'rest',      isTime: true,  min: 0,  max: 120, step: 5 },
  { key: 'exercises', label: 'Übungen',      icon: '/icon-bicep.png',  color: 'neutral',   isTime: false, min: 1,  max: 20,  step: 1 },
  { key: 'rounds',    label: 'Runden',       icon: '/icon-rounds.png', color: 'rounds',    isTime: false, min: 1,  max: 20,  step: 1 },
  { key: 'roundRest', label: 'Rundenpause',  icon: '/icon-timer.png',  color: 'roundrest', isTime: true,  min: 0,  max: 300, step: 10 },
];

export default function WorkoutCards({ params, onChange }) {
  const [editing, setEditing] = useState(null);

  return (
    <div className="workout-cards">
      {CARDS.map(card => (
        <button
          key={card.key}
          className={`workout-card ${card.color}`}
          onClick={() => setEditing(card)}
        >
          <img src={card.icon} alt="" className="card-icon-img" />
          <span className="card-label">{card.label}</span>
          <span className="card-value">
            {card.isTime ? formatTime(params[card.key]) : (card.key === 'rounds' ? `${params[card.key]}X` : params[card.key])}
          </span>
        </button>
      ))}

      {editing && (
        <EditModal
          label={editing.label}
          value={params[editing.key]}
          isTime={editing.isTime}
          min={editing.min}
          max={editing.max}
          step={editing.step}
          onSave={v => onChange({ ...params, [editing.key]: v })}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
