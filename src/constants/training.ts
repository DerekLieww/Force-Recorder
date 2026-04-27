export type RoutineId = 1 | 2 | 3 | 4;
export type MvcUnit = 'lbs' | 'kg';

interface BaseRoutine {
  name: string;
  goal: string;
  intensityMin: number;
  intensityMax: number;
  repDuration: number;
  restBetweenReps: number;
  restBetweenSets: number;
  sets: number;
}

interface HandsRoutine extends BaseRoutine {
  hasHands: true;
  repsPerHand: number;
}

interface NoHandsRoutine extends BaseRoutine {
  hasHands: false;
  reps: number;
}

export type RoutineConfig = HandsRoutine | NoHandsRoutine;

export const ROUTINES: Record<RoutineId, RoutineConfig> = {
  1: {
    name: 'Max Recruitment',
    goal: 'Neural drive & motor unit recruitment',
    intensityMin: 0.85,
    intensityMax: 1.00,
    repDuration: 4,
    restBetweenReps: 5,
    restBetweenSets: 180,
    sets: 2,
    hasHands: true,
    repsPerHand: 4,
  },
  2: {
    name: 'Max Strength',
    goal: 'Maximal force production',
    intensityMin: 0.90,
    intensityMax: 0.95,
    repDuration: 8,
    restBetweenReps: 180,
    restBetweenSets: 180,
    sets: 3,
    hasHands: true,
    repsPerHand: 4,
  },
  3: {
    name: 'Density Pulls',
    goal: 'Tendon remodeling & stiffness',
    intensityMin: 0.50,
    intensityMax: 0.70,
    repDuration: 35,
    restBetweenReps: 17,
    restBetweenSets: 120,
    sets: 3,
    hasHands: false,
    reps: 2,
  },
  4: {
    name: 'Low-Intensity',
    goal: 'Maintenance & daily loading',
    intensityMin: 0.30,
    intensityMax: 0.40,
    repDuration: 10,
    restBetweenReps: 20,
    restBetweenSets: 0,
    sets: 1,
    hasHands: false,
    reps: 6,
  },
};
