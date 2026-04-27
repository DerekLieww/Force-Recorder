import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTrainingStore } from '../../store/trainingStore';
import { ROUTINES } from '../../constants/training';
import type { ColorState } from '../../store/trainingStore';

const STROKE: Record<ColorState, string> = {
  neutral: '#6366f1',
  orange: '#f97316',
  green: '#22c55e',
};

const FILL: Record<ColorState, string> = {
  neutral: '#6366f133',
  orange: '#f9731633',
  green: '#22c55e33',
};

const LABEL: Record<ColorState, string> = {
  neutral: '',
  orange: '● ON TARGET',
  green: '✓ REP COMPLETE',
};

export function TrainingGraph() {
  const { repGraphData, colorState, mvc, mvcUnit, routine, repStartTime, phase } =
    useTrainingStore((s) => ({
      repGraphData: s.repGraphData,
      colorState: s.colorState,
      mvc: s.mvc,
      mvcUnit: s.mvcUnit,
      routine: s.routine,
      repStartTime: s.repStartTime,
      phase: s.phase,
    }));

  const config = routine ? ROUTINES[routine] : null;
  const targetLbs = config ? mvc * config.intensityMin : 0;
  const targetInUnit = mvcUnit === 'kg' ? targetLbs * 0.453592 : targetLbs;
  const yMax = mvcUnit === 'kg' ? mvc * 0.453592 * 1.1 : mvc * 1.1;
  const repDuration = config?.repDuration ?? 10;

  const stroke = STROKE[colorState];
  const fill = FILL[colorState];

  const elapsedLabel = repStartTime
    ? `${((Date.now() - repStartTime) / 1000).toFixed(1)}s / ${repDuration}s`
    : phase === 'rep' ? 'Pull to target...' : '';

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
          Live Force
        </div>
        {LABEL[colorState] && (
          <div
            className="text-xs font-bold tracking-wide"
            style={{ color: stroke }}
          >
            {LABEL[colorState]}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={repGraphData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#33333333" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, repDuration]}
              tickFormatter={(v) => `${v}s`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, yMax || 10]}
              tickFormatter={(v) => `${Math.round(v)}`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              label={{
                value: mvcUnit,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 10, fill: '#94a3b8' },
              }}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, background: '#1e293b', border: 'none', borderRadius: 6 }}
              formatter={(v: number) => [`${v.toFixed(1)} ${mvcUnit}`, 'Force']}
              labelFormatter={(l) => `${Number(l).toFixed(2)}s`}
            />
            {targetInUnit > 0 && (
              <ReferenceLine
                y={targetInUnit}
                stroke={stroke}
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Target ${targetInUnit.toFixed(0)} ${mvcUnit}`,
                  position: 'insideTopLeft',
                  fontSize: 10,
                  fill: stroke,
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="force"
              stroke={stroke}
              strokeWidth={2.5}
              fill={fill}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Current force + rep timer */}
      {repGraphData.length > 0 && (
        <div
          className="flex items-end justify-between pt-2 border-t"
          style={{ borderColor: `${stroke}44` }}
        >
          <div>
            <span className="text-3xl font-extrabold" style={{ color: stroke }}>
              {repGraphData[repGraphData.length - 1].force.toFixed(1)}
            </span>
            <span className="text-sm ml-1" style={{ color: stroke }}>
              {mvcUnit}
            </span>
          </div>
          {elapsedLabel && (
            <div className="text-xs text-gray-400">{elapsedLabel}</div>
          )}
        </div>
      )}
    </div>
  );
}
