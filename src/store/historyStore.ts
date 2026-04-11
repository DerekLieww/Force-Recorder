import { create } from 'zustand';

export interface HistoryEntry {
  timestamp: string;
  forceKg: number;
  forceLbs: number;
}

interface HistoryState {
  history: HistoryEntry[];
  isLoadingHistory: boolean;
  setHistory: (entries: HistoryEntry[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoadingHistory: false,
  setHistory: (entries) => set({ history: entries }),
  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  clearHistory: () => set({ history: [] }),
}));
