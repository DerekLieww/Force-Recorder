export interface TindeqReading {
  timestamp: number;
  force: number;
}

class BluetoothService {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  
  async connect(): Promise<void> {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Progressor' }],
        optionalServices: ['force_service'] // Replace with actual service UUID
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService('force_service');
      this.characteristic = await service?.getCharacteristic('force_characteristic');
      
      if (this.characteristic) {
        await this.characteristic.startNotifications();
        this.characteristic.addEventListener('characteristicvaluechanged', this.handleForceReading);
      }
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  private handleForceReading(event: Event): TindeqReading {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) return { timestamp: Date.now(), force: 0 };
    
    // Convert the raw data to force value (implementation depends on Tindeq's protocol)
    const force = this.parseForceValue(value);
    return {
      timestamp: Date.now(),
      force
    };
  }

  private parseForceValue(value: DataView): number {
    // Implement according to Tindeq's data format
    // This is a placeholder implementation
    return value.getFloat32(0, true);
  }

  async disconnect(): Promise<void> {
    if (this.characteristic) {
      await this.characteristic.stopNotifications();
    }
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
  }

  isConnected(): boolean {
    return this.device?.gatt?.connected ?? false;
  }
}

export const bluetoothService = new BluetoothService();