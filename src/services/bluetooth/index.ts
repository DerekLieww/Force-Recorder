import { DeviceManager } from './deviceManager';

// Create a single instance of the DeviceManager
const deviceManager = new DeviceManager();

// Export the instance as bluetoothService
export const bluetoothService = deviceManager;

// Export types
export type { BluetoothDevice, ForceReading, DeviceCommand } from './types';
export { DeviceNotFoundError, ConnectionError } from './errors';