import { TINDEQ_SERVICE_UUID } from '../../constants/bluetooth';

export class BluetoothConnection {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;

  async scanForDevices(): Promise<BluetoothDevice[]> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Progressor' }],
        optionalServices: [TINDEQ_SERVICE_UUID]
      });

      return [device];
    } catch (error) {
      console.error('Scanning failed:', error);
      return [];
    }
  }

  async connect(deviceId: string): Promise<BluetoothRemoteGATTServer | null> {
    try {
      const devices = await navigator.bluetooth.getDevices();
      this.device = devices.find(d => d.id === deviceId) || null;
      
      if (!this.device) {
        throw new Error('Device not found');
      }

      this.server = await this.device.gatt?.connect() || null;
      return this.server;
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.server?.connected) {
      this.device?.gatt?.disconnect();
    }
    this.server = null;
    this.device = null;
  }

  isConnected(): boolean {
    return this.server?.connected ?? false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }
}