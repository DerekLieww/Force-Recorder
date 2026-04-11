import React from 'react';
import { BluetoothStatus } from './BluetoothStatus';
import { DeviceSelector } from './bluetooth/DeviceSelector';

export function BluetoothControl() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Device Connection</h2>
        <BluetoothStatus />
      </div>

      <div className="flex items-center gap-4">
        <DeviceSelector />
      </div>
    </div>
  );
}