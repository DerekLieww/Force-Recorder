import { useTrainingStore } from '../store/trainingStore';
import { ROUTINES } from '../constants/training';
import { RoutineSelector } from './training/RoutineSelector';
import { HandIndicator } from './training/HandIndicator';
import { TrainingGraph } from './training/TrainingGraph';
import { SessionProgress } from './training/SessionProgress';
import { SessionControls } from './training/SessionControls';
import type { ColorState } from '../store/trainingStore';

const CONTAINER_BG: Record<ColorState, string> = {
  neutral: '',
  orange: 'linear-gradient(135deg, #431407, #1c0700)',
  green: 'linear-gradient(135deg, #052e16, #020f09)',
};

const PANEL_BORDER: Record<ColorState, string> = {
  neutral: 'border-gray-100 dark:border-gray-700',
  orange: 'border-orange-900/40',
  green: 'border-green-900/40',
};

const CARD_STYLE: Record<ColorState, string> = {
  neutral: 'bg-transparent',
  orange: 'bg-white/5 border border-orange-500/20',
  green: 'bg-white/5 border border-green-500/20',
};

export function TrainingTab() {
  const { colorState, routine, phase, activeHand } = useTrainingStore((s) => ({
    colorState: s.colorState,
    routine: s.routine,
    phase: s.phase,
    activeHand: s.activeHand,
  }));

  const isColored = colorState !== 'neutral';
  const config = routine ? ROUTINES[routine] : null;
  const showHands = !!config?.hasHands && phase !== 'idle';

  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
        isColored ? '' : 'bg-white dark:bg-gray-800'
      }`}
      style={isColored ? { background: CONTAINER_BG[colorState] } : undefined}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-[280px_1fr] min-h-[520px]"
      >
        {/* ── Left Panel ── */}
        <div
          className={`flex flex-col gap-4 p-5 border-r ${PANEL_BORDER[colorState]}`}
        >
          {phase === 'idle' ? (
            <RoutineSelector />
          ) : (
            config && (
              <div className={`rounded-lg p-3 ${CARD_STYLE[colorState]}`}>
                <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${
                  isColored ? 'text-orange-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Routine
                </div>
                <div className={`font-semibold text-sm ${
                  isColored ? 'text-orange-100' : 'text-gray-800 dark:text-gray-200'
                }`}>
                  {config.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{config.goal}</div>
              </div>
            )
          )}

          {showHands && (
            <div className={`rounded-lg p-3 ${CARD_STYLE[colorState]}`}>
              <HandIndicator activeHand={activeHand} colorState={colorState} />
            </div>
          )}

          {phase !== 'idle' && (
            <div className={`rounded-lg p-3 ${CARD_STYLE[colorState]}`}>
              <SessionProgress />
            </div>
          )}

          <div className="mt-auto">
            <SessionControls />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col p-5">
          <TrainingGraph />
        </div>
      </div>
    </div>
  );
}
