import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: (() => {
    const stored = localStorage.getItem('theme');
    const dark = stored === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    return dark;
  })(),
  toggle: () => {
    const next = !get().isDark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    set({ isDark: next });
  },
}));

export function useTheme() {
  return useThemeStore();
}
