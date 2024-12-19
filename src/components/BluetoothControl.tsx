import React, { useState } from 'react';
import { useBluetoothStore } from '../store/bluetoothStore';
import { BluetoothStatus } from './BluetoothStatus';
import { DeviceSelector } from './bluetooth/DeviceSelector';
import { Alert } from './ui/Alert';
import { DeviceNotFoundError, ConnectionError } from '../services/bluetooth/errors';

export function BluetoothControl() {
  const { isConnected } = useBluetoothStore();
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: unknown) => {
    if (error instanceof DeviceNotFoundError) {
      setError('No Tindeq device was found. Please make sure your device is turned on and in range.');
    } else if (error instanceof ConnectionError) {
      setError('Failed to connect to the device. Please try again.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Device Connection</h2>
        <BluetoothStatus />
      </div>
      
      {error && (
        <Alert 
          type="error" 
          message={error} 
          onClose={() => setError(null)} 
          className="mb-4"
        />
      )}
      
      <div className="flex items-center gap-4">
        <DeviceSelector onError={handleError} />
      </div>
    </div>
  );
}