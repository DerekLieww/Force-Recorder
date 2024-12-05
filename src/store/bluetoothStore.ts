import { create } from 'zustand';

interface BluetoothState {
  isConnected: boolean;
  isConnecting: boolean;
  setConnected: (value: boolean) => void;
  setConnecting: (value: boolean) => void;
}

export const useBluetoothStore = create<BluetoothState>((set) => ({
  isConnected: false,
  isConnecting: false,
  setConnected: (value) => set({ isConnected: value }),
  setConnecting: (value) => set({ isConnecting: value }),
}));