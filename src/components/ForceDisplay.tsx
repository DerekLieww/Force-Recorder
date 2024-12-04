import React from 'react';
import { useForceStore } from '../store/forceStore';
import { LineChart, Timer } from 'lucide-react';
import { convertForce } from '../utils/forceConversion';

export function ForceDisplay() {
  const { readings, isRecording } = useForceStore();
  const currentForce = readings[readings.length - 1]?.force ?? 0;
  const forceUnits = convertForce(currentForce);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Force Reading</h2>
        {isRecording && (
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-red-500">Recording</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4 py-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {forceUnits.newtons.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Newtons</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {forceUnits.pounds.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Pounds</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {forceUnits.kilograms.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">Kilograms</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4" />
          <span>Samples: {readings.length}</span>
        </div>
      </div>
    </div>
  );
}