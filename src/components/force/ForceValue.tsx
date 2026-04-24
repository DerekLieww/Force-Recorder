import React from 'react';

interface ForceValueProps {
  value: number;
  unit: string;
  color: string;
}

export function ForceValue({ value, unit, color }: ForceValueProps) {
  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${color}`}>
        {value.toFixed(1)}
      </div>
      <div className="text-sm text-gray-500 mt-1">{unit}</div>
    </div>
  );
}