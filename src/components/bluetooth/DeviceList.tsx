import React from 'react';
import { Bluetooth } from 'lucide-react';
import { Button } from '../ui/Button';

interface BluetoothDevice {
  id: string;
  name: string;
}

interface DeviceListProps {
  devices: BluetoothDevice[];
  onSelectDevice: (deviceId: string) => void;
}

export function DeviceList({ devices, onSelectDevice }: DeviceListProps) {
  if (devices.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No Tindeq devices found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {devices.map((device) => (
        <Button
          key={device.id}
          onClick={() => onSelectDevice(device.id)}
          variant="secondary"
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Bluetooth className="w-4 h-4" />
            {device.name}
          </span>
        </Button>
      ))}
    </div>
  );
}