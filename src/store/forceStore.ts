import { create } from 'zustand';
import type { ForceReading } from '../services/bluetooth/types';

interface ForceState {
  readings: ForceReading[];
  isRecording: boolean;
  selectedPerson: string | null;
  highestForce: number;
  addReading: (reading: ForceReading) => void;
  resetHighestForce: () => void;
  setSelectedPerson: (name: string) => void;
}

export const useForceStore = create<ForceState>((set) => ({
  readings: [],
  isRecording: false,
  selectedPerson: null,
  highestForce: 0,
  addReading: (reading) =>
    set((state) => ({
      readings: [...state.readings, reading],
      highestForce: Math.max(state.highestForce, reading.force),
    })),
  resetHighestForce: () => set({ highestForce: 0 }),
  setSelectedPerson: (name) => set({ selectedPerson: name }),
}));
