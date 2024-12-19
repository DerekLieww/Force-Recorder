import React from 'react';
import { Timer } from 'lucide-react';
import { useDeviceCommandStore } from '../../store/deviceCommandStore';

interface ForceStatusProps {
  isRecording: boolean;
}

export function ForceStatus({ isRecording }: ForceStatusProps) {
  const { currentCommand } = useDeviceCommandStore();

  return (
    <div className="flex items-center gap-4">
      {currentCommand === 'SAMPLING' && !isRecording && (
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-500" />
          <span className="text-blue-500">Sampling</span>
        </div>
      )}
      {isRecording && (
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-red-500 animate-pulse" />
          <span className="text-red-500">Recording Test</span>
        </div>
      )}
    </div>
  );
}