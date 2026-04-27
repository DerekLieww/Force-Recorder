import { useState } from 'react';
import { useTrainingStore } from '../../store/trainingStore';
import { ROUTINES } from '../../constants/training';
import type { RoutineId, MvcUnit } from '../../constants/training';

export function RoutineSelector() {
  const { routine, mvc, mvcUnit, selectRoutine, setMvc, setMvcUnit } = useTrainingStore((s) => ({
    routine: s.routine,
    mvc: s.mvc,
    mvcUnit: s.mvcUnit,
    selectRoutine: s.selectRoutine,
    setMvc: s.setMvc,
    setMvcUnit: s.setMvcUnit,
  }));

  // Input value is in the display unit
  const displayMvc = mvcUnit === 'kg' ? +(mvc * 0.453592).toFixed(1) : +mvc.toFixed(1);
  const [inputVal, setInputVal] = useState(displayMvc > 0 ? String(displayMvc) : '');

  const handleUnitToggle = () => {
    const newUnit: MvcUnit = mvcUnit === 'lbs' ? 'kg' : 'lbs';
    setMvcUnit(newUnit);
    // Convert current display value to new unit for input field
    const currentLbs = mvc;
    const newDisplay = newUnit === 'kg'
      ? +(currentLbs * 0.453592).toFixed(1)
      : +currentLbs.toFixed(1);
    setInputVal(newDisplay > 0 ? String(newDisplay) : '');
  };

  const handleMvcChange = (val: string) => {
    setInputVal(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setMvc(num, mvcUnit);
    }
  };

  const targetLbs = routine ? mvc * ROUTINES[routine].intensityMin : 0;
  const targetDisplay = mvcUnit === 'kg'
    ? +(targetLbs * 0.453592).toFixed(1)
    : +targetLbs.toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
        Routine
      </div>

      <div className="flex flex-col gap-2">
        {(Object.entries(ROUTINES) as [string, typeof ROUTINES[1]][]).map(([id, config]) => {
          const rid = Number(id) as RoutineId;
          const selected = routine === rid;
          return (
            <button
              key={id}
              onClick={() => selectRoutine(rid)}
              className={`text-left rounded-lg px-3 py-2 border transition-colors ${
                selected
                  ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="font-semibold text-sm">
                {id}. {config.name}
              </div>
              <div className="text-xs opacity-70 mt-0.5">
                {Math.round(config.intensityMin * 100)}–{Math.round(config.intensityMax * 100)}% MVC ·{' '}
                {config.repDuration}s · {config.goal}
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
        <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-2">
          Max MVC
        </div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="1"
            value={inputVal}
            onChange={(e) => handleMvcChange(e.target.value)}
            placeholder="0"
            className="w-24 px-2 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUnitToggle}
            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {mvcUnit}
          </button>
        </div>
        {routine && mvc > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
            Target ≥ {targetDisplay} {mvcUnit} ({Math.round(ROUTINES[routine].intensityMin * 100)}% MVC)
          </div>
        )}
      </div>
    </div>
  );
}
