import { 
  TINDEQ_SERVICE_UUID, 
  TINDEQ_CHARACTERISTIC_UUID,
  TINDEQ_CONTROL_CHARACTERISTIC_UUID,
  COMMAND 
} from '../constants/bluetooth';
import { parseTindeqData } from './bluetoothParser';
import { useForceStore } from '../store/forceStore';

export interface TindeqReading {
  timestamp: number;
  force: number;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private forceCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private controlCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async scanForDevices(): Promise<BluetoothDevice | null> {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Progressor' }],
        optionalServices: [TINDEQ_SERVICE_UUID]
      });
      return device;
    } catch (error) {
      console.error('Scanning failed:', error);
      return null;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    try {
      // Disconnect existing device if any
      if (this.device?.gatt?.connected) {
        await this.disconnect();
      }

      // Connect to the selected device
      this.device = await navigator.bluetooth.getDevices()
        .then(devices => devices.find(d => d.id === deviceId));
      
      if (!this.device) {
        throw new Error('Device not found');
      }

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService(TINDEQ_SERVICE_UUID);
      
      // Get both characteristics
      this.forceCharacteristic = await service?.getCharacteristic(TINDEQ_CHARACTERISTIC_UUID);
      this.controlCharacteristic = await service?.getCharacteristic(TINDEQ_CONTROL_CHARACTERISTIC_UUID);

      if (this.forceCharacteristic) {
        await this.forceCharacteristic.startNotifications();
        this.forceCharacteristic.addEventListener('characteristicvaluechanged', 
          this.handleForceReading.bind(this));
      }
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  private handleForceReading = (event: Event): void => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return;

    const force = parseTindeqData(value);
    const reading: TindeqReading = {
      timestamp: Date.now(),
      force
    };

    useForceStore.getState().addReading(reading);
  };

  async startSampling(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Device not connected');
    }
    await this.controlCharacteristic.writeValue(COMMAND.START_SAMPLING);
  }

  async stopSampling(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Device not connected');
    }
    await this.controlCharacteristic.writeValue(COMMAND.STOP_SAMPLING);
  }

  async tare(): Promise<void> {
    if (!this.controlCharacteristic) {
      throw new Error('Device not connected');
    }
    await this.controlCharacteristic.writeValue(COMMAND.TARE);
  }

  async disconnect(): Promise<void> {
    if (this.forceCharacteristic) {
      await this.stopSampling();
      await this.forceCharacteristic.stopNotifications();
    }
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.forceCharacteristic = null;
    this.controlCharacteristic = null;
    this.device = null;
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }

  getConnectedDevice(): BluetoothDevice | null {
    return this.device;
  }
}

export const bluetoothService = new BluetoothService();