import { BluetoothConnection } from './bluetoothConnection';
import { ForceReader } from './forceReader';
import { ForceReading } from './types';
import { useForceStore } from '../../store/forceStore';

class BluetoothService {
  private connection: BluetoothConnection;
  private forceReader: ForceReader;

  constructor() {
    this.connection = new BluetoothConnection();
    this.forceReader = new ForceReader();
  }

  async scanForDevices() {
    return this.connection.scanForDevices();
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      const server = await this.connection.connect(deviceId);
      if (!server) {
        throw new Error('Failed to establish GATT server connection');
      }

      await this.forceReader.initialize(server);
      
      // Set up continuous force reading callback
      this.forceReader.setForceUpdateCallback((reading: ForceReading) => {
        useForceStore.getState().addReading(reading);
      });

      // Start sampling immediately after connection
      await this.forceReader.startSampling();
    } catch (error) {
      console.error('Device connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.forceReader.stopSampling();
      await this.forceReader.cleanup();
      await this.connection.disconnect();
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }

  async tare(): Promise<void> {
    return this.forceReader.tare();
  }

  async startSampling(): Promise<void> {
    return this.forceReader.startSampling();
  }

  async stopSampling(): Promise<void> {
    return this.forceReader.stopSampling();
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  getConnectedDevice() {
    return this.connection.getConnectedDevice();
  }
}

export const bluetoothService = new BluetoothService();