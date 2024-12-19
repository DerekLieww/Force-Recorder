// Force Reading Types
export interface ForceReading {
  timestamp: number;
  force: number;
}

// Command Types
export type DeviceCommand = 'IDLE' | 'SAMPLING' | 'TESTING';

export interface CommandState {
  current: DeviceCommand;
  lastUpdated: number;
}

// Store Types
export interface DeviceState {
  isConnecting: boolean;
  error: string | null;
}