import { TINDEQ_SERVICE_UUID } from '../../constants/bluetooth';
import { DeviceNotFoundError, ConnectionError } from './errors';

export class BluetoothConnection {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;

  async connect(deviceId: string): Promise<BluetoothRemoteGATTServer> {
    try {
      // Get the actual device from the browser
      const devices = await navigator.bluetooth.getDevices();
      const foundDevice = devices.find(d => d.id === deviceId);
      
      if (!foundDevice) {
        throw new DeviceNotFoundError('Selected device not found');
      }

      if (!foundDevice.gatt) {
        throw new ConnectionError('Device does not support GATT');
      }

      const server = await foundDevice.gatt.connect();
      
      if (!server) {
        throw new ConnectionError('Failed to establish GATT server connection');
      }

      this.device = foundDevice;
      this.server = server;

      return server;
    } catch (error) {
      if (error instanceof DeviceNotFoundError || error instanceof ConnectionError) {
        throw error;
      }
      throw new ConnectionError('Failed to connect to device', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.server?.connected) {
        await this.server.disconnect();
      }
      this.server = null;
      this.device = null;
    } catch (error) {
      throw new ConnectionError('Failed to disconnect from device', error);
    }
  }

  isConnected(): boolean {
    return this.server?.connected ?? false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }
}