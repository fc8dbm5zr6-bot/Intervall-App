import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initDefaults } from '../db';

const WARMUP_OPTIONS = [0, 10, 30, 60];
const THEME_OPTIONS = [
  { value: 'system', label: 'Automatisch' },
  { value: 'dark', label: 'Dunkel' },
  { value: 'light', label: 'Hell' },
];

function getTheme() {
  try { return localStorage.getItem('themeMode') || 'system'; } catch { return 'system'; }
}

function applyTheme(mode) {
  const root = document.documentElement;
  try { localStorage.setItem('themeMode', mode); } catch {}
  if (mode === 'dark') root.setAttribute('data-theme', 'dark');
  else if (mode === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
}

export default function Settings({ onBack }) {
  const warmupSetting = useLiveQuery(() => db.settings.get('warmupTime'));
  const soundSetting = useLiveQuery(() => db.settings.get('soundEnabled'));
  const voiceSetting = useLiveQuery(() => db.settings.get('voiceEnabled'));
  const percentSetting = useLiveQuery(() => db.settings.get('showPercent'));
  const [themeMode, setThemeMode] = useState(getTheme);

  const warmupTime = warmupSetting?.value ?? 10;
  const soundEnabled = soundSetting?.value ?? true;
  const showPercent = percentSetting?.value ?? true;
  const voiceEnabled = voiceSetting?.value ?? true;
  const [confirmReset, setConfirmReset] = useState(false);

  async function handleReset() {
    await db.delete();
    await db.open();
    await initDefaults();
    try { localStorage.removeItem('themeMode'); } catch {}
    document.documentElement.removeAttribute('data-theme');
    setConfirmReset(false);
    window.location.reload();
  }

  return (
    <>
      <div className="header">
        <button className="menu-btn" onClick={onBack}>←</button>
        <h1>Einstellungen</h1>
        <div style={{ width: 40 }} />
      </div>
      <div className="settings-view">
        <div className="setting-group">
          <div className="setting-label">Aufwärmzeit</div>
          <div className="option-row">
            {WARMUP_OPTIONS.map(v => (
              <button
                key={v}
                className={`option-btn ${warmupTime === v ? 'selected' : ''}`}
                onClick={() => db.settings.put({ key: 'warmupTime', value: v })}
              >
                {v === 0 ? 'Aus' : `${v}s`}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <div className="setting-label">Erscheinungsbild</div>
          <div className="option-row">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`option-btn ${themeMode === opt.value ? 'selected' : ''}`}
                onClick={() => { setThemeMode(opt.value); applyTheme(opt.value); }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <div className="toggle-row">
            <span style={{ fontSize: 15 }}>Signaltöne</span>
            <button
              className={`toggle ${soundEnabled ? 'on' : ''}`}
              onClick={() => db.settings.put({ key: 'soundEnabled', value: !soundEnabled })}
            />
          </div>
          <div className="toggle-row">
            <span style={{ fontSize: 15 }}>Sprachansagen</span>
            <button
              className={`toggle ${voiceEnabled ? 'on' : ''}`}
              onClick={() => db.settings.put({ key: 'voiceEnabled', value: !voiceEnabled })}
            />
          </div>
          <div className="toggle-row">
            <span style={{ fontSize: 15 }}>Fortschrittsanzeige</span>
            <button
              className={`toggle ${showPercent ? 'on' : ''}`}
              onClick={() => db.settings.put({ key: 'showPercent', value: !showPercent })}
            />
          </div>
        </div>

        <div className="setting-group" style={{ marginTop: 32 }}>
          <div className="setting-label">App zurücksetzen</div>
          {!confirmReset ? (
            <button className="btn btn-danger" style={{ width: '100%' }} onClick={() => setConfirmReset(true)}>
              Alle Daten löschen
            </button>
          ) : (
            <div>
              <p style={{ fontSize: 14, color: 'var(--rest)', marginBottom: 12 }}>
                Alle Workouts, Einstellungen und Historie werden gelöscht. Bist du sicher?
              </p>
              <div className="btn-row">
                <button className="btn btn-secondary" onClick={() => setConfirmReset(false)}>Abbrechen</button>
                <button className="btn btn-danger" onClick={handleReset}>Ja, löschen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
