export function calcDuration(w) {
  const total = (w.workTime * w.exercises + w.restTime * (w.exercises - 1)) * w.rounds + w.roundRest * (w.rounds - 1);
  return Math.ceil(total / 60);
}
