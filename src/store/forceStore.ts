import { create } from 'zustand';
import { TindeqReading } from '../services/bluetooth';

interface ForceState {
  readings: TindeqReading[];
  isRecording: boolean;
  selectedPerson: string | null;
  plateauForce: number | null;
  addReading: (reading: TindeqReading) => void;
  startRecording: () => void;
  stopRecording: () => void;
  clearReadings: () => void;
  setSelectedPerson: (name: string) => void;
  setPlateauForce: (force: number) => void;
}

export const useForceStore = create<ForceState>((set) => ({
  readings: [],
  isRecording: false,
  selectedPerson: null,
  plateauForce: null,
  addReading: (reading) =>
    set((state) => ({
      readings: state.isRecording ? [...state.readings, reading] : state.readings,
    })),
  startRecording: () => set({ isRecording: true, plateauForce: null }),
  stopRecording: () => set({ isRecording: false }),
  clearReadings: () => set({ readings: [], plateauForce: null }),
  setSelectedPerson: (name) => set({ selectedPerson: name }),
  setPlateauForce: (force) => set({ plateauForce: force }),
}));