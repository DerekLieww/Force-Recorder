import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { DeviceList } from './DeviceList';
import { Modal } from '../ui/Modal';
import { useBluetoothStore } from '../../store/bluetoothStore';
import { bluetoothService } from '../../services/bluetooth';
import { BluetoothDevice } from '../../services/bluetooth/types';

export function DeviceSelector() {
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const { isConnected, setConnected, setConnecting } = useBluetoothStore();

  const handleScan = async () => {
    setIsScanning(true);
    setDevices([]);
    
    try {
      const device = await bluetoothService.scanForDevices();
      if (device) {
        setDevices([{
          id: device.id,
          name: device.name || 'Unknown Tindeq Device'
        }]);
      }
    } catch (error) {
      console.error('Scanning failed:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectDevice = async (deviceId: string) => {
    setConnecting(true);
    try {
      await bluetoothService.connectToDevice(deviceId);
      setConnected(true);
      setShowModal(false);
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setConnected(false);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  return (
    <>
      {!isConnected ? (
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Find Tindeq Device
        </Button>
      ) : (
        <Button
          onClick={handleDisconnect}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Disconnect Device
        </Button>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Select Tindeq Device"
      >
        <div className="space-y-4">
          <Button
            onClick={handleScan}
            disabled={isScanning}
            className="w-full"
          >
            {isScanning ? 'Scanning...' : 'Scan for Devices'}
          </Button>
          
          <DeviceList
            devices={devices}
            onSelectDevice={handleSelectDevice}
          />
        </div>
      </Modal>
    </>
  );
}