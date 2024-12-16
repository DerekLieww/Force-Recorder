import {
  TINDEQ_SERVICE_UUID,
  TINDEQ_CHARACTERISTIC_UUID,
  TINDEQ_CONTROL_CHARACTERISTIC_UUID,
  COMMAND
} from '../../constants/bluetooth';
import { parseTindeqData } from './bluetoothParser';
import { ForceReading } from './types';

export class ForceReader {
  private forceCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private controlCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onForceUpdate: ((reading: ForceReading) => void) | null = null;

  async initialize(server: BluetoothRemoteGATTServer): Promise<void> {
    try {
      const service = await server.getPrimaryService(TINDEQ_SERVICE_UUID);
      
      this.forceCharacteristic = await service.getCharacteristic(TINDEQ_CHARACTERISTIC_UUID);
      this.controlCharacteristic = await service.getCharacteristic(TINDEQ_CONTROL_CHARACTERISTIC_UUID);

      // Start notifications immediately after connection
      await this.startNotifications();
    } catch (error) {
      console.error('Force reader initialization failed:', error);
      throw error;
    }
  }

  private handleForceReading = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    const force = parseTindeqData(value);
    const reading: ForceReading = {
      timestamp: Date.now(),
      force
    };

    this.onForceUpdate?.(reading);
  };

  async startNotifications(): Promise<void> {
    if (!this.forceCharacteristic) {
      throw new Error('Force characteristic not initialized');
    }

    await this.forceCharacteristic.startNotifications();
    this.forceCharacteristic.addEventListener(
      'characteristicvaluechanged',
      this.handleForceReading
    );
  }

  async stopNotifications(): Promise<void> {
    if (this.forceCharacteristic) {
      await this.forceCharacteristic.stopNotifications();
      this.forceCharacteristic.removeEventListener(
        'characteristicvaluechanged',
        this.handleForceReading
      );
    }
  }

  setForceUpdateCallback(callback: (reading: ForceReading) => void): void {
    this.onForceUpdate = callback;
  }

  async startSampling(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Control characteristic not initialized');
    }
    await this.controlCharacteristic.writeValue(COMMAND.START_SAMPLING);
  }

  async stopSampling(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Control characteristic not initialized');
    }
    await this.controlCharacteristic.writeValue(COMMAND.STOP_SAMPLING);
  }

  async tare(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Control characteristic not initialized');
    }
    await this.controlCharacteristic.writeValue(COMMAND.TARE);
  }

  async cleanup(): Promise<void> {
    await this.stopNotifications();
    this.forceCharacteristic = null;
    this.controlCharacteristic = null;
    this.onForceUpdate = null;
  }
}