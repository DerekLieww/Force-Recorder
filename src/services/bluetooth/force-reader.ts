import {
  TINDEQ_SERVICE_UUID,
  TINDEQ_CHARACTERISTIC_UUID,
  TINDEQ_CONTROL_CHARACTERISTIC_UUID,
  COMMAND
} from '../../constants/bluetooth';
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
      await this.startNotifications();
    } catch (error) {
      console.error('ForceReader: Initialization failed', error);
      throw error;
    }
  }

  private handleForceReading = (event: Event): void => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (!value) return;

    const dataBytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    const force = this.parseTindeqData(dataBytes);

    if (force !== null) {
      const reading: ForceReading = {
        timestamp: Date.now(),
        force
      };
      this.onForceUpdate?.(reading);
    }
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
      try {
        await this.forceCharacteristic.stopNotifications();
        this.forceCharacteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleForceReading
        );
      } catch (error) {
        console.error('ForceReader: Failed to stop notifications', error);
      }
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
    try {
      await this.stopNotifications();
    } catch (error) {
      console.error('ForceReader: Error during cleanup', error);
    }
    this.forceCharacteristic = null;
    this.controlCharacteristic = null;
    this.onForceUpdate = null;
  }

  private parseTindeqData(dataBytes: Uint8Array): number | null {
    if (dataBytes.length < 6) return null;

    const tag = dataBytes[0];
    const length = dataBytes[1];

    if (tag !== 0x01 || length !== 4) return null;

    const dataView = new DataView(dataBytes.buffer, dataBytes.byteOffset + 2, 4);
    const force = dataView.getFloat32(0, true);

    if (isNaN(force) || !isFinite(force)) return null;

    return force;
  }
}
