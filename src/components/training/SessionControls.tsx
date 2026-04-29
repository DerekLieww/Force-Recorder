import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useTrainingStore } from '../../store/trainingStore';

export function SessionControls() {
  const { phase, routine, mvc, startSession, resetSession } = useTrainingStore((s) => ({
    phase: s.phase,
    routine: s.routine,
    mvc: s.mvc,
    startSession: s.startSession,
    resetSession: s.resetSession,
  }));

  const [confirmStop, setConfirmStop] = useState(false);

  const canStart = phase === 'idle' && !!routine && mvc > 0;

  const handleStop = () => {
    if (!confirmStop) {
      setConfirmStop(true);
      setTimeout(() => setConfirmStop(false), 2500);
      return;
    }
    setConfirmStop(false);
    resetSession();
  };

  if (phase === 'idle' || phase === 'complete') {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => { setConfirmStop(false); startSession(); }}
          disabled={!canStart}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Play className="w-4 h-4" />
          {phase === 'complete' ? 'Restart' : 'Start Session'}
        </button>
        {!canStart && mvc === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500">Enter your max MVC above to start</p>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleStop}
      className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 ${
        confirmStop
          ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-500'
      }`}
    >
      <Square className="w-4 h-4" />
      {confirmStop ? 'Confirm Stop' : 'Stop'}
    </button>
  );
}
