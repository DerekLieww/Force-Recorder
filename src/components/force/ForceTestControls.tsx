import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { bluetoothService } from '../../services/bluetooth';

interface ForceTestControlsProps {
  isRecording: boolean;
  selectedPerson: string | null;
  onStartTest: () => void;
  onStopTest: () => void;
}

export function ForceTestControls({
  isRecording,
  selectedPerson,
  onStartTest,
  onStopTest
}: ForceTestControlsProps) {
  const handleTare = async () => {
    try {
      await bluetoothService.tare();
    } catch (error) {
      console.error('Failed to tare device:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {!isRecording ? (
        <>
          <Button
            onClick={onStartTest}
            disabled={!selectedPerson}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Test
          </Button>
          <Button
            onClick={handleTare}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Tare
          </Button>
        </>
      ) : (
        <Button
          onClick={onStopTest}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Square className="w-4 h-4" />
          Stop Test
        </Button>
      )}
    </div>
  );
}