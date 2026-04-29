import React from 'react';
import { BluetoothStatus } from './BluetoothStatus';
import { DeviceSelector } from './bluetooth/DeviceSelector';

export function BluetoothControl() {
  return (
    <div className="flex items-center gap-4">
      <BluetoothStatus />
      <DeviceSelector />
    </div>
  );
}