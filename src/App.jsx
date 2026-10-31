import { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initDefaults } from './db';
import { useTimer } from './hooks/useTimer';
import TimerDisplay from './components/TimerDisplay';
import Controls from './components/Controls';
import WorkoutCards from './components/WorkoutCards';
import ProgressBorder from './components/ProgressBorder';
import SideMenu from './components/SideMenu';
import Settings from './components/Settings';
import History from './components/History';
import WorkoutEditor from './components/WorkoutEditor';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [view, setView] = useState('timer');
  const [sessionParams, setSessionParams] = useState(null);
  const [loadedWorkoutId, setLoadedWorkoutId] = useState(null);
  const [modified, setModified] = useState(false);
  const savedRef = useRef(false);

  const soundSetting = useLiveQuery(() => db.settings.get('soundEnabled'));
  const warmupSetting = useLiveQuery(() => db.settings.get('warmupTime'));
  const percentSetting = useLiveQuery(() => db.settings.get('showPercent'));
  const workouts = useLiveQuery(() => db.workouts.toArray());

  const voiceSetting = useLiveQuery(() => db.settings.get('voiceEnabled'));
  const soundEnabled = soundSetting?.value ?? true;
  const voiceEnabled = voiceSetting?.value ?? true;
  const warmupTime = warmupSetting?.value ?? 10;
  const showPercent = percentSetting?.value ?? true;

  const timer = useTimer(soundEnabled, voiceEnabled);

  useEffect(() => { initDefaults(); }, []);

  useEffect(() => {
    if (!sessionParams && workouts?.length) {
      const w = workouts[0];
      setSessionParams({ workTime: w.workTime, restTime: w.restTime, exercises: w.exercises, rounds: w.rounds, roundRest: w.roundRest, name: w.name });
      setLoadedWorkoutId(w.id);
    }
  }, [workouts, sessionParams]);

  useEffect(() => {
    if (timer.phase === 'finished' && !savedRef.current && sessionParams) {
      savedRef.current = true;
      db.history.add({
        name: sessionParams.name,
        workTime: sessionParams.workTime,
        restTime: sessionParams.restTime,
        exercises: sessionParams.exercises,
        rounds: sessionParams.rounds,
        roundRest: sessionParams.roundRest,
        totalDuration: timer.totalDuration,
        date: new Date().toISOString(),
      });
    }
    if (timer.phase !== 'finished') {
      savedRef.current = false;
    }
  }, [timer.phase, timer.totalDuration, sessionParams]);

  const loadWorkout = useCallback((w) => {
    setSessionParams({ workTime: w.workTime, restTime: w.restTime, exercises: w.exercises, rounds: w.rounds, roundRest: w.roundRest, name: w.name });
    setLoadedWorkoutId(w.id);
    setModified(false);
    timer.stop();
  }, [timer]);

  function handleParamsChange(newParams) {
    setSessionParams(newParams);
    setModified(true);
  }

  function handleStart() {
    if (sessionParams) {
      timer.start(sessionParams, warmupTime);
    }
  }

  async function handleSaveAsNew() {
    const count = await db.workouts.count();
    if (count >= 12) return;
    const name = sessionParams.name?.includes('(Kopie)') ? sessionParams.name : `${sessionParams.name || 'Workout'} (Kopie)`;
    await db.workouts.add({ ...sessionParams, name });
    setModified(false);
  }

  if (view === 'settings') {
    return (
      <div className="app">
        <Settings onBack={() => setView('timer')} />
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="app">
        <WorkoutEditor
          onBack={() => setView('timer')}
          onSaved={(w) => { if (w) loadWorkout(w); }}
        />
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="app">
        <History onBack={() => setView('timer')} />
      </div>
    );
  }

  const isRunning = timer.phase !== 'idle' && timer.phase !== 'finished';

  return (
    <div className="app">
      {showPercent && <ProgressBorder timer={timer} showPercent />}

      <div className="header">
        <div style={{ width: 40 }} />
        <button className="menu-btn" onClick={() => setMenuOpen(true)}>☰</button>
      </div>

      <TimerDisplay timer={timer} />

      <Controls timer={timer} onStart={handleStart} />

      {!isRunning && timer.phase !== 'finished' && sessionParams && (
        <>
          <WorkoutCards params={sessionParams} onChange={handleParamsChange} />
          {modified && workouts && workouts.length < 12 && (
            <div style={{ padding: '0 20px 16px' }}>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleSaveAsNew}>
                Als neues Workout speichern
              </button>
            </div>
          )}
        </>
      )}

      {timer.phase === 'finished' && (
        <div className="finished-overlay">
          <div className="emoji">💪</div>
          <h2>Geschafft!</h2>
          <p>{sessionParams?.name}</p>
          <button className="btn btn-primary" style={{ marginTop: 16, padding: '14px 48px' }} onClick={timer.stop}>
            Zurück
          </button>
        </div>
      )}

      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelectWorkout={loadWorkout}
        activeWorkoutId={loadedWorkoutId}
        onOpenSettings={() => { setView('settings'); setMenuOpen(false); }}
        onOpenHistory={() => { setView('history'); setMenuOpen(false); }}
        onOpenEditor={() => { setView('editor'); setMenuOpen(false); }}
      />
    </div>
  );
}
