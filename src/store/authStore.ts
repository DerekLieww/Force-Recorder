import { create } from 'zustand';

interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  setAuthenticated: (value: boolean) => void;
  setUserInfo: (info: UserInfo | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userInfo: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setUserInfo: (info) => set({ userInfo: info }),
}));

