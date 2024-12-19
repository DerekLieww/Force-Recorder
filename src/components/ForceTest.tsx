import React, { useCallback, useEffect } from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { useForceStore } from '../store/forceStore';
import { googleSheetsService } from '../services/googleSheets';
import { bluetoothService } from '../services/bluetooth';
import { detectPlateau } from '../utils/forceCalculation';
import { deviceManager } from '../services/bluetooth/deviceManager';

const FORCE_THRESHOLD = 2; // Newtons - minimum force to consider for plateau
const TIME_THRESHOLD = 500; // ms - time window to check for plateau

export function ForceTest() {
  const {
    readings,
    isRecording,
    selectedPerson,
    plateauForce,
    startRecording,
    stopRecording,
    clearReadings,
    setPlateauForce,
  } = useForceStore();

  const calculatePlateau = useCallback(() => {
    if (readings.length < 10) return;

    const forces = readings.map(r => r.force);
    if (detectPlateau(forces)) {
      const mean = forces.slice(-10).reduce((a, b) => a + b, 0) / 10;
      setPlateauForce(mean);
      stopRecording();
      
      // Save to Google Sheets
      if (selectedPerson) {
        googleSheetsService.appendTestResult(
          selectedPerson,
          mean,
          Date.now()
        ).catch(error => {
          console.error('Failed to save test result:', error);
        });
      }
    }
  }, [readings, selectedPerson, setPlateauForce, stopRecording]);

  useEffect(() => {
    if (isRecording) {
      calculatePlateau();
    }
  }, [isRecording, calculatePlateau]);

  const handleStartTest = async () => {
    try {
      clearReadings();
      await bluetoothService.tare(); // Zero the device
      await deviceManager.startTest(); // This will handle sampling if needed
      startRecording();
    } catch (error) {
      console.error('Failed to start test:', error);
    }
  };

  const handleStopTest = async () => {
    try {
      await deviceManager.stopTest();
      stopRecording();
    } catch (error) {
      console.error('Failed to stop test:', error);
    }
  };

  const handleTare = async () => {
    try {
      await bluetoothService.tare();
    } catch (error) {
      console.error('Failed to tare device:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <>
            <Button
              onClick={handleStartTest}
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
            onClick={handleStopTest}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop Test
          </Button>
        )}
      </div>

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