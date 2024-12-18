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

  constructor() {
    console.log('ForceReader: Initializing new instance');
  }

  async initialize(server: BluetoothRemoteGATTServer): Promise<void> {
    console.log('ForceReader: Initializing with GATT server', { 
      serviceUuid: TINDEQ_SERVICE_UUID 
    });

    try {
      const service = await server.getPrimaryService(TINDEQ_SERVICE_UUID);
      console.log('ForceReader: Primary service obtained');
      
      this.forceCharacteristic = await service.getCharacteristic(TINDEQ_CHARACTERISTIC_UUID);
      this.controlCharacteristic = await service.getCharacteristic(TINDEQ_CONTROL_CHARACTERISTIC_UUID);
      console.log('ForceReader: Characteristics obtained', {
        forceCharacteristic: !!this.forceCharacteristic,
        controlCharacteristic: !!this.controlCharacteristic
      });

      // Start notifications immediately after connection
      await this.startNotifications();
      console.log('ForceReader: Notifications started successfully');
    } catch (error) {
      console.error('ForceReader: Initialization failed', error);
      throw error;
    }
  }

  private handleForceReading = (event: Event): void => {
    console.log('ForceReader: Force reading event triggered');
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value) {
      console.warn('ForceReader: Received empty characteristic value');
      return;
    }

    // Convert DataView to Uint8Array
    const dataBytes = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    console.log('ForceReader: Received data bytes', { 
      dataLength: dataBytes.length, 
      dataBytes: Array.from(dataBytes) 
    });

    const force = this.parseTindeqData(dataBytes);
    
    if (force !== null) {
      const reading: ForceReading = {
        timestamp: Date.now(),
        force
      };

      console.log('ForceReader: Parsed force reading', reading);
      this.onForceUpdate?.(reading);
    }
  };

  async startNotifications(): Promise<void> {
    console.log('ForceReader: Starting notifications');
    if (!this.forceCharacteristic) {
      console.error('ForceReader: Force characteristic not initialized');
      throw new Error('Force characteristic not initialized');
    }

    try {
      await this.forceCharacteristic.startNotifications();
      console.log('ForceReader: Notifications started');
      this.forceCharacteristic.addEventListener(
        'characteristicvaluechanged',
        this.handleForceReading
      );
      console.log('ForceReader: Added characteristic value changed listener');
    } catch (error) {
      console.error('ForceReader: Failed to start notifications', error);
      throw error;
    }
  }

  async stopNotifications(): Promise<void> {
    console.log('ForceReader: Stopping notifications');
    if (this.forceCharacteristic) {
      try {
        await this.forceCharacteristic.stopNotifications();
        console.log('ForceReader: Notifications stopped');
        this.forceCharacteristic.removeEventListener(
          'characteristicvaluechanged',
          this.handleForceReading
        );
        console.log('ForceReader: Removed characteristic value changed listener');
      } catch (error) {
        console.error('ForceReader: Failed to stop notifications', error);
      }
    } else {
      console.warn('ForceReader: No force characteristic to stop notifications');
    }
  }

  setForceUpdateCallback(callback: (reading: ForceReading) => void): void {
    console.log('ForceReader: Setting force update callback');
    this.onForceUpdate = callback;
  }

  async startSampling(): Promise<void> {
    console.log('ForceReader: Starting sampling');
    if (!this.controlCharacteristic) {
      console.error('ForceReader: Control characteristic not initialized');
      throw new Error('Control characteristic not initialized');
    }
    
    try {
      await this.controlCharacteristic.writeValue(COMMAND.START_SAMPLING);
      console.log('ForceReader: Sampling started successfully', { 
        command: 'START_SAMPLING' 
      });
    } catch (error) {
      console.error('ForceReader: Failed to start sampling', error);
      throw error;
    }
  }

  async stopSampling(): Promise<void> {
    console.log('ForceReader: Stopping sampling');
    if (!this.controlCharacteristic) {
      console.error('ForceReader: Control characteristic not initialized');
      throw new Error('Control characteristic not initialized');
    }
    
    try {
      await this.controlCharacteristic.writeValue(COMMAND.STOP_SAMPLING);
      console.log('ForceReader: Sampling stopped successfully', { 
        command: 'STOP_SAMPLING' 
      });
    } catch (error) {
      console.error('ForceReader: Failed to stop sampling', error);
      throw error;
    }
  }

  async tare(): Promise<void> {
    console.log('ForceReader: Performing tare operation');
    if (!this.controlCharacteristic) {
      console.error('ForceReader: Control characteristic not initialized');
      throw new Error('Control characteristic not initialized');
    }
    
    try {
      await this.controlCharacteristic.writeValue(COMMAND.TARE);
      console.log('ForceReader: Tare operation completed successfully', { 
        command: 'TARE' 
      });
    } catch (error) {
      console.error('ForceReader: Failed to tare device', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    console.log('ForceReader: Initiating cleanup');
    try {
      await this.stopNotifications();
      console.log('ForceReader: Notifications stopped during cleanup');
    } catch (error) {
      console.error('ForceReader: Error during cleanup notifications', error);
    }
    
    this.forceCharacteristic = null;
    this.controlCharacteristic = null;
    this.onForceUpdate = null;
    
    console.log('ForceReader: Cleanup complete');
  }

  /**
   * Parses force data from Tindeq Progressor Bluetooth datapoint characteristic
   * 
   * @param dataBytes - Raw bytes received from the datapoint characteristic
   * @returns Parsed force value in Newtons, or null if parsing fails
   */
  private parseTindeqData(dataBytes: Uint8Array): number | null {
    console.log('ForceReader: Parsing Tindeq data', { 
      dataLength: dataBytes.length, 
      dataBytes: Array.from(dataBytes) 
    });

    // Check minimum length for force data (tag, length, and at least 4 bytes for float)
    if (dataBytes.length < 6) {
      console.warn(`ForceReader: Insufficient data length: ${dataBytes.length}`);
      return null;
    }
    
    // Unpack tag and length
    const tag = dataBytes[0];
    const length = dataBytes[1];
    
    console.log('ForceReader: Parsing details', { tag, length });

    // Check if this is a force data tag
    if (tag !== 0x01) {
      console.warn(`ForceReader: Unexpected tag: ${tag}`);
      return null;
    }
    
    // Verify length matches expected length for a float (4 bytes)
    if (length !== 4) {
      console.warn(`ForceReader: Unexpected length: ${length}`);
      return null;
    }
    
    // Extract force data (little-endian 32-bit float)
    const dataView = new DataView(dataBytes.buffer, dataBytes.byteOffset + 2, 4);
    const force = dataView.getFloat32(0, true); // true for little-endian
    
    // Optional: Add a sanity check for force value
    if (isNaN(force) || !isFinite(force)) {
      console.warn('ForceReader: Invalid force value parsed');
      return null;
    }
    
    console.log('ForceReader: Parsed force value', { force });
    return force;
  }
}