import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import { useHistoryStore } from '../store/historyStore';
import { useForceStore } from '../store/forceStore';
import { useTheme } from '../hooks/useTheme';

type Unit = 'kg' | 'lbs';

export function HistoryChart() {
  const [unit, setUnit] = useState<Unit>('kg');
  const { history, isLoadingHistory } = useHistoryStore();
  const selectedPerson = useForceStore((state) => state.selectedPerson);
  const { isDark } = useTheme();

  const gridColor = isDark ? '#374151' : '#f0f0f0';
  const tickColor = isDark ? '#9ca3af' : '#6b7280';

  if (!selectedPerson) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 dark:text-gray-500">
        <span className="text-3xl">📊</span>
        <p className="text-sm text-center">Sign in with Google and select a person<br />to view session history</p>
      </div>
    );
  }

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Loading history…
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No records yet
      </div>
    );
  }

  const data = history.map((entry) => ({
    label: format(new Date(entry.timestamp), 'MMM d HH:mm'),
    fullDate: format(new Date(entry.timestamp), 'MMM d, yyyy HH:mm'),
    value: unit === 'kg' ? entry.forceKg : entry.forceLbs,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {selectedPerson}'s History
        </h3>
        <div className="flex rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden text-sm">
          <button
            onClick={() => setUnit('kg')}
            className={`px-3 py-1 transition-colors ${
              unit === 'kg'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            kg
          </button>
          <button
            onClick={() => setUnit('lbs')}
            className={`px-3 py-1 transition-colors ${
              unit === 'lbs'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            lbs
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
              label={{
                value: unit,
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 11, fill: tickColor },
              }}
              width={40}
            />
            <Tooltip
              formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, 'Peak Force']}
              labelFormatter={(_label, payload) =>
                payload?.[0]?.payload?.fullDate ?? _label
              }
              contentStyle={{ fontSize: 12, borderRadius: 6 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
