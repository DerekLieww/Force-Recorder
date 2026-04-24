import React from 'react';
import { Bluetooth, BluetoothOff, Loader2 } from 'lucide-react';
import { useBluetoothStore } from '../../store/bluetoothStore';

export function DeviceStatus() {
  const { isConnected, isConnecting } = useBluetoothStore();

  return (
    <div className="flex items-center gap-2">
      {isConnecting ? (
        <>
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-700">Connecting...</span>
        </>
      ) : isConnected ? (
        <>
          <Bluetooth className="w-5 h-5 text-green-500" />
          <span className="text-green-700">Connected to Tindeq</span>
        </>
      ) : (
        <>
          <BluetoothOff className="w-5 h-5 text-red-500" />
          <span className="text-red-700">Not Connected</span>
        </>
      )}
    </div>
  );
}