import { BluetoothConnection } from './bluetoothConnection';
import { ForceReader } from './forceReader';
import { CommandManager } from './commands';
import { DeviceScanner } from './deviceScanner';
import { ForceReading, DeviceCommand } from './types';
import { useForceStore } from '../../store/forceStore';

export class DeviceManager {
  private connection: BluetoothConnection;
  private forceReader: ForceReader;
  private commandManager: CommandManager;
  private deviceScanner: DeviceScanner;

  constructor() {
    this.connection = new BluetoothConnection();
    this.forceReader = new ForceReader();
    this.commandManager = new CommandManager();
    this.deviceScanner = new DeviceScanner();
  }

  async scanForDevices(): Promise<BluetoothDevice[]> {
    return this.deviceScanner.scanForDevices();
  }

  getScannedDevices(): BluetoothDevice[] {
    return this.deviceScanner.getScannedDevices();
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
      await this.startSampling();
    } catch (error) {
      console.error('Device connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.stopSampling();
      await this.forceReader.cleanup();
      await this.connection.disconnect();
      this.commandManager.setCommand('IDLE');
    } catch (error) {
      console.error('Disconnection failed:', error);
      throw error;
    }
  }

  async startSampling(): Promise<void> {
    if (!this.commandManager.isSampling()) {
      await this.forceReader.startSampling();
      this.commandManager.setCommand('SAMPLING');
    }
  }

  async stopSampling(): Promise<void> {
    if (this.commandManager.isSampling()) {
      await this.forceReader.stopSampling();
      this.commandManager.setCommand('IDLE');
    }
  }

  async startTest(): Promise<void> {
    if (!this.commandManager.isSampling()) {
      await this.startSampling();
    }
    this.commandManager.setCommand('TESTING');
  }

  async stopTest(): Promise<void> {
    this.commandManager.setCommand('SAMPLING');
  }

  async tare(): Promise<void> {
    return this.forceReader.tare();
  }

  getCurrentCommand(): DeviceCommand {
    return this.commandManager.getCurrentCommand();
  }

  isConnected(): boolean {
    return this.connection.isConnected();
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.connection.getConnectedDevice();
  }
}
export const deviceManager = new DeviceManager();