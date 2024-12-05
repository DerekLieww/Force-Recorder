import React from 'react';
import { bluetoothService } from '../services/bluetooth';
import { Button } from './ui/Button';
import { Bluetooth, BluetoothOff } from 'lucide-react';
import { useBluetoothStore } from '../store/bluetoothStore';
import { BluetoothStatus } from './BluetoothStatus';

export function BluetoothControl() {
  const { isConnected, isConnecting, setConnected, setConnecting } = useBluetoothStore();

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await bluetoothService.connect();
      setConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setConnected(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Device Connection</h2>
        <BluetoothStatus />
      </div>
      
      <div className="flex items-center gap-4">
        {isConnected ? (
          <Button
            onClick={handleDisconnect}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
          >
            <BluetoothOff className="w-4 h-4" />
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
          >
            <Bluetooth className="w-4 h-4" />
            {isConnecting ? 'Connecting...' : 'Connect Device'}
          </Button>
        )}
      </div>
    </div>
  );
}