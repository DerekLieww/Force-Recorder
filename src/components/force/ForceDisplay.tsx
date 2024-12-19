import React from 'react';
import { LineChart } from 'lucide-react';
import { useForceStore } from '../../store/forceStore';
import { convertForce } from '../../utils/forceConversion';
import { ForceValue } from './ForceValue';
import { ForceStatus } from './ForceStatus';

export function ForceDisplay() {
  const { readings, isRecording } = useForceStore();
  const currentForce = readings[readings.length - 1]?.force ?? 0;
  const forceUnits = convertForce(currentForce);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Force Reading</h2>
        <ForceStatus isRecording={isRecording} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 py-8">
        <ForceValue 
          value={forceUnits.newtons}
          unit="Newtons"
          color="text-blue-600"
        />
        <ForceValue 
          value={forceUnits.pounds}
          unit="Pounds"
          color="text-green-600"
        />
        <ForceValue 
          value={forceUnits.kilograms}
          unit="Kilograms"
          color="text-purple-600"
        />
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