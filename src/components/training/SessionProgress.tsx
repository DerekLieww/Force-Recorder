import { useEffect, useRef, useState } from 'react';
import { useTrainingStore } from '../../store/trainingStore';
import { ROUTINES } from '../../constants/training';
import type { ColorState } from '../../store/trainingStore';

const ACCENT: Record<ColorState, string> = {
  neutral: '#6366f1',
  orange: '#f97316',
  green: '#22c55e',
};

export function SessionProgress() {
  const {
    phase,
    routine,
    currentRep,
    currentSet,
    colorState,
    restStartTime,
    currentRestDuration,
    tickRest,
  } = useTrainingStore((s) => ({
    phase: s.phase,
    routine: s.routine,
    currentRep: s.currentRep,
    currentSet: s.currentSet,
    colorState: s.colorState,
    restStartTime: s.restStartTime,
    currentRestDuration: s.currentRestDuration,
    tickRest: s.tickRest,
  }));

  // Force re-render every 100ms during rest so the countdown display stays live.
  // tickRest() only changes store state when rest expires, so without this the
  // restRemaining display would be stale between ticks.
  const [, forceUpdate] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase === 'rest') {
      intervalRef.current = setInterval(() => {
        tickRest();
        forceUpdate((n) => n + 1);
      }, 100);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, tickRest]);

  if (!routine) return null;

  const config = ROUTINES[routine];
  const totalSets = config.sets;
  const totalReps = config.hasHands ? config.repsPerHand : config.reps;
  const accent = ACCENT[colorState];

  const restRemaining = phase === 'rest' && restStartTime
    ? Math.max(0, currentRestDuration - (Date.now() - restStartTime) / 1000)
    : 0;

  if (phase === 'complete') {
    return (
      <div className="text-center py-4">
        <div className="text-2xl font-bold" style={{ color: ACCENT.green }}>
          Session Complete!
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {totalSets} sets · {totalReps} reps{config.hasHands ? ' per hand' : ''}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
        Progress
      </div>
      <div className="flex gap-4 justify-between">
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: accent }}>
            {currentSet}
            <span className="text-sm text-gray-400 font-normal">/{totalSets}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Set</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: accent }}>
            {currentRep}
            <span className="text-sm text-gray-400 font-normal">/{totalReps}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Rep{config.hasHands ? '/hand' : ''}
          </div>
        </div>
        {phase === 'rest' && (
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {restRemaining.toFixed(0)}s
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Rest</div>
          </div>
        )}
      </div>
    </div>
  );
}
