let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, duration = 0.15, type = 'sine') {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.5, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

export function playWorkStart() {
  playTone(880, 0.15);
  setTimeout(() => playTone(1100, 0.15), 170);
  setTimeout(() => playTone(1320, 0.2), 340);
}

export function playRestStart() {
  playTone(440, 0.3, 'triangle');
}

export function playWorkoutEnd() {
  playTone(660, 0.15);
  setTimeout(() => playTone(880, 0.15), 180);
  setTimeout(() => playTone(1100, 0.15), 360);
  setTimeout(() => playTone(1320, 0.3), 540);
}

export function playCountdown() {
  playTone(600, 0.1);
}

export function playRoundStart() {
  playTone(1000, 0.12);
  setTimeout(() => playTone(1000, 0.12), 150);
}

export function announceRound(round) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(`Runde ${round}`);
    u.lang = 'de-DE';
    u.rate = 1.1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }
}

export function announcePhase(phase) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(phase);
    u.lang = 'de-DE';
    u.rate = 1.1;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }
}

export function unlockAudio() {
  const ctx = getCtx();
  if (ctx.state === 'suspended') ctx.resume();
}
