import { LineChart, Timer, TrendingUp } from 'lucide-react';
import { useForceStore } from '../store/forceStore';
import { convertForce } from '../utils/forceConversion';

export function ForceDisplay() {
  const { readings, isRecording, highestForce } = useForceStore(state => ({
    readings: state.readings,
    isRecording: state.isRecording,
    highestForce: state.highestForce
  }));

  // Get the latest force reading
  const currentForce = readings.length > 0 ? readings[readings.length - 1].force : 0;
  const currentForceUnits = convertForce(currentForce);
  const highestForceUnits = convertForce(highestForce);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Force Reading</h2>
        {isRecording && (
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="text-red-500">Recording</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Current Force */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Current Force</h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentForceUnits.newtons.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Newtons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentForceUnits.pounds.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pounds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentForceUnits.kilograms.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kilograms</div>
            </div>
          </div>
        </div>

        {/* Highest Force */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Highest Force
          </h3>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {highestForceUnits.newtons.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Newtons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {highestForceUnits.pounds.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pounds</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {highestForceUnits.kilograms.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Kilograms</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-4">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4" />
          <span>Samples: {readings.length}</span>
        </div>
      </div>
    </div>
  );
}