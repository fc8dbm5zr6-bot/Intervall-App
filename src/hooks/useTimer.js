import { useState, useRef, useCallback, useEffect } from 'react';
import * as sounds from '../utils/sounds';

/*
  Phases: 'idle' | 'warmup' | 'work' | 'rest' | 'roundRest' | 'finished'
  The timer counts DOWN from the current phase's duration.
*/
export function useTimer(soundEnabled, voiceEnabled) {
  const [state, setState] = useState({
    phase: 'idle',
    timeLeft: 0,
    currentExercise: 1,
    currentRound: 1,
    totalExercises: 0,
    totalRounds: 0,
    isPaused: false,
    workout: null,
    warmupTime: 0,
    totalDuration: 0,
    elapsed: 0,
  });

  const intervalRef = useRef(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const voiceRef = useRef(voiceEnabled);
  voiceRef.current = voiceEnabled;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playSound = useCallback((fn, ...args) => {
    if (soundRef.current) fn(...args);
  }, []);

  const playVoice = useCallback((fn, ...args) => {
    if (voiceRef.current) fn(...args);
  }, []);

  const transition = useCallback((s) => {
    const { workout } = s;
    if (!workout) return { ...s, phase: 'finished' };

    if (s.phase === 'warmup') {
      playSound(sounds.playWorkStart);
      playVoice(sounds.announceRound, 1);
      return { ...s, phase: 'work', timeLeft: workout.workTime, currentExercise: 1, currentRound: 1 };
    }

    if (s.phase === 'work') {
      if (s.currentExercise < workout.exercises) {
        playSound(sounds.playRestStart);
        return { ...s, phase: 'rest', timeLeft: workout.restTime, currentExercise: s.currentExercise };
      }
      if (s.currentRound < workout.rounds) {
        playSound(sounds.playRoundStart);
        return { ...s, phase: 'roundRest', timeLeft: workout.roundRest };
      }
      playSound(sounds.playWorkoutEnd);
      return { ...s, phase: 'finished', timeLeft: 0 };
    }

    if (s.phase === 'rest') {
      playSound(sounds.playWorkStart);
      return { ...s, phase: 'work', timeLeft: workout.workTime, currentExercise: s.currentExercise + 1 };
    }

    if (s.phase === 'roundRest') {
      const nextRound = s.currentRound + 1;
      playSound(sounds.playWorkStart);
      playVoice(sounds.announceRound, nextRound);
      return { ...s, phase: 'work', timeLeft: workout.workTime, currentExercise: 1, currentRound: nextRound };
    }

    return s;
  }, [playSound]);

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.isPaused || prev.phase === 'idle' || prev.phase === 'finished') return prev;

      if (prev.timeLeft <= 1) {
        return { ...transition(prev), elapsed: prev.elapsed + 1 };
      }

      const next = prev.timeLeft - 1;
      if (next <= 3 && next > 0 && soundRef.current) {
        sounds.playCountdown();
      }
      return { ...prev, timeLeft: next, elapsed: prev.elapsed + 1 };
    });
  }, [transition]);

  const start = useCallback((workout, warmupTime = 0) => {
    clearTimer();
    sounds.unlockAudio();

    const hasWarmup = warmupTime > 0;
    const roundTime = workout.workTime * workout.exercises + workout.restTime * (workout.exercises - 1);
    const totalDuration = (hasWarmup ? warmupTime : 0) + roundTime * workout.rounds + workout.roundRest * (workout.rounds - 1);

    setState({
      phase: hasWarmup ? 'warmup' : 'work',
      timeLeft: hasWarmup ? warmupTime : workout.workTime,
      currentExercise: 1,
      currentRound: 1,
      totalExercises: workout.exercises,
      totalRounds: workout.rounds,
      isPaused: false,
      workout,
      warmupTime,
      totalDuration,
      elapsed: 0,
    });

    if (!hasWarmup) {
      playSound(sounds.playWorkStart);
      playVoice(sounds.announceRound, 1);
    }

    intervalRef.current = setInterval(tick, 1000);
  }, [clearTimer, tick, playSound, playVoice]);

  const togglePause = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    setState(prev => ({
      ...prev,
      phase: 'idle',
      timeLeft: 0,
      isPaused: false,
    }));
  }, [clearTimer]);

  useEffect(() => clearTimer, [clearTimer]);

  return { ...state, start, togglePause, stop };
}
