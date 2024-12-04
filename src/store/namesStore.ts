import { create } from 'zustand';

interface NamesState {
  localNames: string[];
  addLocalName: (name: string) => void;
  setLocalNames: (names: string[]) => void;
}

export const useNamesStore = create<NamesState>((set) => ({
  localNames: [],
  addLocalName: (name) =>
    set((state) => ({
      localNames: [...state.localNames, name],
    })),
  setLocalNames: (names) => set({ localNames: names }),
}));