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
  private device: BluetoothDevice | null | undefined = null;
  private forceCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined;
  private controlCharacteristic: BluetoothRemoteGATTCharacteristic | undefined = undefined;

  constructor() {
    console.log('BluetoothService: Initializing new instance');
    
  }
  async scanForDevices(): Promise<BluetoothDevice | null> {
    console.log('BluetoothService: Scanning for Progressor devices', {
      serviceUuid: TINDEQ_SERVICE_UUID
    });

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Progressor' }],
        optionalServices: [TINDEQ_SERVICE_UUID]
      });

      console.log('BluetoothService: Device found', {
        deviceName: device.name,
        deviceId: device.id
      });

      return device;
    } catch (error) {
      console.error('BluetoothService: Scanning failed', error);
      return null;
    }
  }

  async connectToDevice(deviceId: string): Promise<void> {
    console.log('BluetoothService: Attempting to connect to device', { deviceId });
    try {
      // Disconnect existing device if any
      if (this.device?.gatt?.connected) {
        console.log('BluetoothService: Disconnecting existing device');
        await this.disconnect();
      }

      // Connect to the selected device
      this.device = await navigator.bluetooth.getDevices()
        .then(devices => {
          const foundDevice = devices.find(d => d.id === deviceId);
          console.log('BluetoothService: Found device in paired devices', { 
            deviceFound: !!foundDevice 
          });
          return foundDevice;
        });
      
      if (!this.device) {
        console.error('BluetoothService: Device not found');
        throw new Error('Device not found');
      }

      const server = await this.device.gatt?.connect();
      console.log('BluetoothService: Connected to GATT server');

      const service = await server?.getPrimaryService(TINDEQ_SERVICE_UUID);
      console.log('BluetoothService: Primary service obtained');
      
      // Get both characteristics
      this.forceCharacteristic = await service?.getCharacteristic(TINDEQ_CHARACTERISTIC_UUID);
      this.controlCharacteristic = await service?.getCharacteristic(TINDEQ_CONTROL_CHARACTERISTIC_UUID);

      console.log('BluetoothService: Characteristics obtained', {
        forceCharacteristic: this.forceCharacteristic,
        controlCharacteristic: this.controlCharacteristic
      });


      if(this.controlCharacteristic){
        await bluetoothService.startSampling();
      }

      if (this.forceCharacteristic) {
        
        console.log('BluetoothService: Notifications started');
        
        this.forceCharacteristic.addEventListener('characteristicvaluechanged', 
          this.handleForceReading.bind(this));
        await this.forceCharacteristic.startNotifications();
        console.log('BluetoothService: Added characteristic value changed listener');
      }
    } catch (error) {
      console.error('BluetoothService: Connection failed', error);
      throw error;
    }
  }

  private handleForceReading = (event: Event): void => {
    console.log('BluetoothService: Force reading event triggered');
    
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    if (!value) {
      console.warn('BluetoothService: Received empty characteristic value');
      return;
    }
    console.log("value:",value);

    const force = parseTindeqData(value);
    console.log('BluetoothService: Parsed force value', { force });

    const reading: TindeqReading = {
      timestamp: Date.now(),
      force
    };

    console.log('BluetoothService: Adding reading to force store', reading);
    useForceStore.getState().addReading(reading);
    console.log('Changing readings', useForceStore.getState().readings);
  };

  async startSampling(): Promise<void> {
    console.log('BluetoothService: Starting sampling');
    
    if (!this.controlCharacteristic) {
      console.error('BluetoothService: Device not connected');
      throw new Error('Device not connected');
    }
    
    try {
      await this.controlCharacteristic.writeValueWithoutResponse(COMMAND.START_SAMPLING);
      console.log('BluetoothService: Sampling started successfully', { 
        command: 'START_SAMPLING' 
      });
    } catch (error) {
      console.error('BluetoothService: Failed to start sampling', error);
      throw error;
    }
  }

  async stopSampling(): Promise<void> {
    console.log('BluetoothService: Stopping sampling');
    
    if (!this.controlCharacteristic) {
      console.error('BluetoothService: Device not connected');
      throw new Error('Device not connected');
    }
    
    try {
      await this.controlCharacteristic.writeValue(COMMAND.STOP_SAMPLING);
      console.log('BluetoothService: Sampling stopped successfully', { 
        command: 'STOP_SAMPLING' 
      });
    } catch (error) {
      console.error('BluetoothService: Failed to stop sampling', error);
      throw error;
    }
  }

  async tare(): Promise<void> {
    console.log('BluetoothService: Performing tare operation');
    
    if (!this.controlCharacteristic) {
      console.error('BluetoothService: Device not connected');
      throw new Error('Device not connected');
    }
    
    try {
      await this.controlCharacteristic.writeValue(COMMAND.TARE);
      console.log('BluetoothService: Tare operation completed successfully', { 
        command: 'TARE' 
      });
    } catch (error) {
      console.error('BluetoothService: Failed to tare device', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('BluetoothService: Disconnecting device');
    
    try {
      if (this.forceCharacteristic) {
        console.log('BluetoothService: Stopping sampling before disconnect');
        await this.stopSampling();
        
        console.log('BluetoothService: Stopping notifications');
        await this.forceCharacteristic.stopNotifications();
      }

      if (this.device?.gatt?.connected) {
        console.log('BluetoothService: Disconnecting GATT server');
        this.device.gatt.disconnect();
      }

      console.log('BluetoothService: Clearing device references');
      this.forceCharacteristic = undefined;
      this.controlCharacteristic = undefined;
      this.device = null;

      console.log('BluetoothService: Disconnection complete');
    } catch (error) {
      console.error('BluetoothService: Error during disconnection', error);
      throw error;
    }
  }

  isConnected(): boolean {
    const connected = this.device?.gatt?.connected ?? false;
    console.log('BluetoothService: Connection status checked', { connected });
    return connected;
  }

  getConnectedDevice(): BluetoothDevice | null | undefined {
    console.log('BluetoothService: Retrieving connected device', { 
      deviceExists: !!this.device 
    });
    return this.device;
  }
}

export const bluetoothService = new BluetoothService();