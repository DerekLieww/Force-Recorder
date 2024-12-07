import React, { useCallback, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import { Button } from './ui/Button';
import { useForceStore } from '../store/forceStore';
import { googleSheetsService } from '../services/googleSheets';

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

    const recentReadings = readings.slice(-10);
    const forces = recentReadings.map(r => r.force);
    const mean = forces.reduce((a, b) => a + b, 0) / forces.length;
    const variance = forces.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / forces.length;

    if (variance < 1 && mean > FORCE_THRESHOLD) {
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

  const handleStartTest = () => {
    clearReadings();
    startRecording();
  };

  const handleStopTest = () => {
    stopRecording();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <Button
            onClick={handleStartTest}
            disabled={!selectedPerson}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Test
          </Button>
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