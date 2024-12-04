import React, { useState } from 'react';
import { bluetoothService } from '../services/bluetooth';
import { Button } from './ui/Button';
import { Bluetooth, BluetoothOff } from 'lucide-react';

export function BluetoothControl() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await bluetoothService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await bluetoothService.disconnect();
      setIsConnected(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
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
  );
}