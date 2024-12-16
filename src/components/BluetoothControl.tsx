import React from 'react';
import { useBluetoothStore } from '../store/bluetoothStore';
import { BluetoothStatus } from './BluetoothStatus';
import { DeviceSelector } from './bluetooth/DeviceSelector';

export function BluetoothControl() {
  const { isConnected } = useBluetoothStore();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Device Connection</h2>
        <BluetoothStatus />
      </div>
      
      <div className="flex items-center gap-4">
        <DeviceSelector />
      </div>
    </div>
  );
}