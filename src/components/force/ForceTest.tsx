import React from 'react';
import { useForceStore } from '../../store/forceStore';
import { bluetoothService } from '../../services/bluetooth';
import { ForceTestControls } from './ForceTestControls';

export function ForceTest() {
  const {
    isRecording,
    selectedPerson,
    plateauForce,
    startRecording,
    stopRecording,
    clearReadings,
  } = useForceStore();

  const handleStartTest = async () => {
    try {
      clearReadings();
      await bluetoothService.tare();
      await bluetoothService.startTest();
      startRecording();
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleStopTest = async () => {
    try {
      await bluetoothService.stopTest();
      stopRecording();
    } catch (error) {
      console.error('Failed to stop test:', error);
    }
  };

  return (
    <div className="space-y-4">
      <ForceTestControls
        isRecording={isRecording}
        selectedPerson={selectedPerson}
        onStartTest={handleStartTest}
        onStopTest={handleStopTest}
      />

      {plateauForce && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-800">
            Plateau Force: <span className="font-bold">{plateauForce.toFixed(1)} N</span>
          </p>
        </div>
      )}
    </div>
  );
}