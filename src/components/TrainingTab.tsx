import { useTrainingStore } from '../store/trainingStore';
import type { ColorState } from '../store/trainingStore';

const CONTAINER_BG: Record<ColorState, string> = {
  neutral: '',
  orange: 'linear-gradient(135deg, #431407, #1c0700)',
  green:  'linear-gradient(135deg, #052e16, #020f09)',
};

export function TrainingTab() {
  const colorState = useTrainingStore((s) => s.colorState);

  const isColored = colorState !== 'neutral';

  return (
    <div
      className={`rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
        isColored ? '' : 'bg-white dark:bg-gray-800'
      }`}
      style={isColored ? { background: CONTAINER_BG[colorState] } : undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0 min-h-[520px]">
        {/* Left panel */}
        <div className={`p-6 flex flex-col gap-4 border-r ${
          isColored
            ? 'border-white/10'
            : 'border-gray-100 dark:border-gray-700'
        }`}>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Left panel — coming soon</p>
        </div>
        {/* Right panel */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">Right panel — coming soon</p>
        </div>
      </div>
    </div>
  );
}
