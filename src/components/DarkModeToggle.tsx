import { useTheme } from '../hooks/useTheme';

export function DarkModeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dark</span>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={isDark}
          onChange={toggle}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors ${
            isDark ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </label>
  );
}
