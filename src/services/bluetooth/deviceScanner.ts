import { DeviceNotFoundError, ConnectionError } from './errors';
import { TINDEQ_SERVICE_UUID } from '../../constants/bluetooth';

export class DeviceScanner {
  private scannedDevices: Map<string, BluetoothDevice> = new Map();

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      // Clear previously scanned devices
      this.scannedDevices.clear();

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Progressor' }],
        optionalServices: [TINDEQ_SERVICE_UUID]
      });

      if (!device) {
        throw new DeviceNotFoundError();
      }

      this.scannedDevices.set(device.id, device);
      return Array.from(this.scannedDevices.values());
    } catch (error) {
      if (error instanceof DeviceNotFoundError) {
        throw error;
      }
      if ((error as Error).name === 'NotFoundError') {
        throw new DeviceNotFoundError();
      }
      throw new ConnectionError('Failed to scan for devices', error);
    }
  }

  getScannedDevices(): BluetoothDevice[] {
    return Array.from(this.scannedDevices.values());
  }

  clearScannedDevices(): void {
    this.scannedDevices.clear();
  }
}