import { useState } from 'react';
import { Save, RotateCcw, Check } from 'lucide-react';
import { useForceStore } from '../store/forceStore';
import { useHistoryStore } from '../store/historyStore';
import { googleSheetsService } from '../services/googleSheets';
import { bluetoothService } from '../services/bluetooth/index';

export function ForceTest() {
  const [saved, setSaved] = useState(false);

  const { highestForce, selectedPerson, resetHighestForce } = useForceStore();
  const { setHistory, setLoadingHistory, clearHistory } = useHistoryStore();

  const refreshHistory = async (name: string) => {
    setLoadingHistory(true);
    clearHistory();
    try {
      const entries = await googleSheetsService.getHistoryForPerson(name);
      setHistory(entries);
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRecord = async () => {
    if (!selectedPerson || highestForce === 0) return;
    try {
      await googleSheetsService.appendTestResult(selectedPerson, highestForce, Date.now());
      resetHighestForce();
      setSaved(true);
      await refreshHistory(selectedPerson);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to record test:', error);
    }
  };

  const handleTare = async () => {
    try {
      await bluetoothService.tare();
    } catch (error) {
      console.error('Failed to tare device:', error);
    }
  };

  const handleReset = () => {
    resetHighestForce();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handleRecord}
          disabled={!selectedPerson || highestForce === 0 || saved}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            saved
              ? 'bg-green-600 text-white focus:ring-green-500'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Record'}
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-base bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Peak
        </button>

        <button
          onClick={handleTare}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-base bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <RotateCcw className="w-4 h-4" />
          Tare
        </button>
      </div>
    </div>
  );
}
