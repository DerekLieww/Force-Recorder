import { create } from 'zustand';
import { convertForce } from '../utils/forceConversion';
import { ROUTINES, type RoutineId, type MvcUnit } from '../constants/training';

export type TrainingPhase = 'idle' | 'rep' | 'rest' | 'complete';
export type ColorState = 'neutral' | 'orange' | 'green';

export interface RepDataPoint {
  t: number;
  force: number;
}

interface TrainingState {
  routine: RoutineId | null;
  mvc: number;             // always in lbs internally; UI components convert for display using mvcUnit
  mvcUnit: MvcUnit;
  phase: TrainingPhase;
  colorState: ColorState;
  activeHand: 'left' | 'right';
  currentRep: number;      // 1-indexed, counts reps per hand (hasHands) or total reps
  currentSet: number;      // 1-indexed
  firstHandDone: boolean;  // for hasHands routines: true after first hand completes within a rep pair
  repStartTime: number | null;     // ms — when force first crossed target this rep
  repPhaseStartTime: number | null; // ms — when this rep phase began (for graph X axis)
  restStartTime: number | null;    // ms
  currentRestDuration: number;     // seconds — set at rest transition
  repGraphData: RepDataPoint[];

  selectRoutine: (id: RoutineId) => void;
  setMvc: (value: number, unit: MvcUnit) => void;
  setMvcUnit: (unit: MvcUnit) => void;
  startSession: () => void;
  onForceUpdate: (forceNewtons: number) => void;
  completeRep: () => void;
  tickRest: () => void;
  resetSession: () => void;
}

function toLbs(value: number, unit: MvcUnit): number {
  return unit === 'kg' ? value * 2.20462 : value;
}

export const useTrainingStore = create<TrainingState>((set, get) => ({
  routine: null,
  mvc: 0,
  mvcUnit: 'lbs',
  phase: 'idle',
  colorState: 'neutral',
  activeHand: 'right',
  currentRep: 1,
  currentSet: 1,
  firstHandDone: false,
  repStartTime: null,
  repPhaseStartTime: null,
  restStartTime: null,
  currentRestDuration: 0,
  repGraphData: [],

  selectRoutine: (id) => set({ routine: id }),

  setMvc: (value, unit) => set({ mvc: toLbs(value, unit), mvcUnit: unit }),

  // mvcUnit is display-only; mvc stays in lbs. UI must convert mvc for display.
  setMvcUnit: (unit) => set({ mvcUnit: unit }),

  startSession: () => {
    const { routine, mvc } = get();
    if (!routine || mvc <= 0) return;
    set({
      phase: 'rep',
      colorState: 'neutral',
      activeHand: 'right',
      currentRep: 1,
      currentSet: 1,
      firstHandDone: false,
      repStartTime: null,
      repPhaseStartTime: Date.now(),
      restStartTime: null,
      currentRestDuration: 0,
      repGraphData: [],
    });
  },

  onForceUpdate: (forceNewtons) => {
    const state = get();
    if (state.phase !== 'rep' || state.colorState === 'green' || !state.routine || state.mvc <= 0) return;

    const config = ROUTINES[state.routine];
    const converted = convertForce(forceNewtons);
    const forceLbs = converted.pounds;
    const forceInUnit = state.mvcUnit === 'kg' ? converted.kilograms : forceLbs;
    const targetLbs = state.mvc * config.intensityMin;
    const now = Date.now();

    const t = state.repPhaseStartTime
      ? (now - state.repPhaseStartTime) / 1000
      : 0;

    const maxPoints = (config.repDuration + 2) * 100;
    const newData: RepDataPoint[] = [
      ...state.repGraphData.slice(-(maxPoints - 1)),
      { t, force: forceInUnit },
    ];

    if (forceLbs >= targetLbs) {
      if (!state.repStartTime) {
        set({ repStartTime: now, colorState: 'orange', repGraphData: newData });
      } else {
        const elapsed = (now - state.repStartTime) / 1000;
        if (elapsed >= config.repDuration) {
          set({ colorState: 'green', repGraphData: newData });
          setTimeout(() => get().completeRep(), 600);
        } else {
          set({ colorState: 'orange', repGraphData: newData });
        }
      }
    } else {
      if (state.repStartTime !== null) {
        set({ repStartTime: null, colorState: 'neutral', repGraphData: newData });
      } else {
        set({ repGraphData: newData });
      }
    }
  },

  completeRep: () => {
    const state = get();
    if (!state.routine) return;
    if (state.phase !== 'rep') return;
    const config = ROUTINES[state.routine];

    if (config.hasHands) {
      if (!state.firstHandDone) {
        // First hand done — rest, then switch to second hand
        set({
          phase: 'rest',
          firstHandDone: true,
          activeHand: state.activeHand === 'right' ? 'left' : 'right',
          colorState: 'neutral',
          repStartTime: null,
          repPhaseStartTime: null,
          restStartTime: Date.now(),
          currentRestDuration: config.restBetweenReps,
          repGraphData: [],
        });
      } else {
        // Both hands done for this rep pair
        const isLastRep = state.currentRep >= config.repsPerHand;
        const isLastSet = state.currentSet >= config.sets;

        if (isLastRep && isLastSet) {
          set({ phase: 'complete', colorState: 'neutral', firstHandDone: false });
          return;
        }

        const nextSet = isLastRep ? state.currentSet + 1 : state.currentSet;
        const nextRep = isLastRep ? 1 : state.currentRep + 1;
        const restDuration = isLastRep
          ? config.restBetweenSets
          : config.restBetweenReps;

        set({
          phase: 'rest',
          firstHandDone: false,
          activeHand: 'right',
          colorState: 'neutral',
          repStartTime: null,
          repPhaseStartTime: null,
          restStartTime: Date.now(),
          currentRestDuration: restDuration,
          repGraphData: [],
          currentRep: nextRep,
          currentSet: nextSet,
        });
      }
    } else {
      const isLastRep = state.currentRep >= config.reps;
      const isLastSet = state.currentSet >= config.sets;

      if (isLastRep && isLastSet) {
        set({ phase: 'complete', colorState: 'neutral' });
        return;
      }

      const nextSet = isLastRep ? state.currentSet + 1 : state.currentSet;
      const nextRep = isLastRep ? 1 : state.currentRep + 1;
      const restDuration = isLastRep
        ? config.restBetweenSets
        : config.restBetweenReps;

      set({
        phase: 'rest',
        colorState: 'neutral',
        repStartTime: null,
        repPhaseStartTime: null,
        restStartTime: Date.now(),
        currentRestDuration: restDuration,
        repGraphData: [],
        currentRep: nextRep,
        currentSet: nextSet,
      });
    }
  },

  tickRest: () => {
    const state = get();
    if (state.phase !== 'rest' || !state.restStartTime) return;
    const elapsed = (Date.now() - state.restStartTime) / 1000;
    if (elapsed >= state.currentRestDuration) {
      set({
        phase: 'rep',
        restStartTime: null,
        repStartTime: null,
        repPhaseStartTime: Date.now(),
        repGraphData: [],
      });
    }
  },

  resetSession: () => set({
    phase: 'idle',
    colorState: 'neutral',
    activeHand: 'right',
    currentRep: 1,
    currentSet: 1,
    firstHandDone: false,
    repStartTime: null,
    repPhaseStartTime: null,
    restStartTime: null,
    currentRestDuration: 0,
    repGraphData: [],
  }),
}));
