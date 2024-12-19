import React, { useEffect, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { DeviceList } from './DeviceList';
import { Modal } from '../ui/Modal';
import { useBluetoothStore } from '../../store/bluetoothStore';
import { bluetoothService } from '../../services/bluetooth';

interface DeviceSelectorProps {
  onError: (error: unknown) => void;
}

export function DeviceSelector({ onError }: DeviceSelectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const { isConnected, setConnected, setConnecting } = useBluetoothStore();

  useEffect(() => {
    if (showModal) {
      const scannedDevices = bluetoothService.getScannedDevices();
      setDevices(scannedDevices);
    }
  }, [showModal]);

  const handleScan = async () => {
    setIsScanning(true);
    setDevices([]);
    
    try {
      const foundDevices = await bluetoothService.scanForDevices();
      setDevices(foundDevices);
    } catch (error) {
      onError(error);
      setDevices([]);
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
      onError(error);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setConnected(false);
      setDevices([]); // Clear devices list after disconnection
    } catch (error) {
      onError(error);
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
            className="w-full flex items-center justify-center gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scan for Devices
              </>
            )}
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