import { create } from 'zustand';
import { DeviceCommand } from '../services/bluetooth/types';

interface DeviceCommandState {
  currentCommand: DeviceCommand;
  setCurrentCommand: (command: DeviceCommand) => void;
}

export const useDeviceCommandStore = create<DeviceCommandState>((set) => ({
  currentCommand: 'IDLE',
  setCurrentCommand: (command) => set({ currentCommand: command }),
}));