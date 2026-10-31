import Dexie from 'dexie';

export const db = new Dexie('IntervalTimerDB');

db.version(1).stores({
  workouts: '++id, name',
  settings: 'key',
});

db.version(2).stores({
  workouts: '++id, name',
  settings: 'key',
  history: '++id, date',
});

export const DEFAULT_WORKOUTS = [
  {
    name: '40/20 Standard',
    workTime: 40,
    restTime: 20,
    exercises: 8,
    rounds: 5,
    roundRest: 60,
  },
  {
    name: '20/10 Tabata',
    workTime: 20,
    restTime: 10,
    exercises: 8,
    rounds: 5,
    roundRest: 60,
  },
];

export async function initDefaults() {
  const count = await db.workouts.count();
  if (count === 0) {
    await db.workouts.bulkAdd(DEFAULT_WORKOUTS);
  }

  const warmup = await db.settings.get('warmupTime');
  if (!warmup) await db.settings.put({ key: 'warmupTime', value: 10 });

  const sound = await db.settings.get('soundEnabled');
  if (!sound) await db.settings.put({ key: 'soundEnabled', value: true });

  const pct = await db.settings.get('showPercent');
  if (!pct) await db.settings.put({ key: 'showPercent', value: true });

  const voice = await db.settings.get('voiceEnabled');
  if (!voice) await db.settings.put({ key: 'voiceEnabled', value: true });
}
