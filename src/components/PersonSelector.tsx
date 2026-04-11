import { useState, useRef, useEffect } from 'react';
import { googleSheetsService } from '../services/googleSheets';
import { useForceStore } from '../store/forceStore';
import { useAuthStore } from '../store/authStore';
import { useNamesStore } from '../store/namesStore';
import { useHistoryStore } from '../store/historyStore';

export function PersonSelector() {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { setSelectedPerson } = useForceStore();
  const { localNames, setLocalNames } = useNamesStore();
  const { setHistory, setLoadingHistory, clearHistory } = useHistoryStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) loadNames();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNames = async () => {
    try {
      setError(null);
      const fetchedNames = await googleSheetsService.getNames();
      setLocalNames(fetchedNames);
    } catch (error) {
      console.error('Failed to load names:', error);
      setError('Failed to load names. Please check your Google connection.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async (name: string) => {
    setLoadingHistory(true);
    clearHistory();
    try {
      const entries = await googleSheetsService.getHistoryForPerson(name);
      setHistory(entries);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelect = (name: string) => {
    setInputValue(name);
    setSelectedPerson(name);
    setIsOpen(false);
    loadHistory(name);
  };

  const filteredNames = localNames.filter((n) =>
    n.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showNewOption =
    inputValue.trim() !== '' &&
    !localNames.some((n) => n.toLowerCase() === inputValue.trim().toLowerCase());

  if (!isAuthenticated) {
    return <div className="text-gray-600 dark:text-gray-400">Please connect to Google Sheets first</div>;
  }

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading names...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
        {error}
        <button
          onClick={loadNames}
          className="ml-2 text-red-700 dark:text-red-400 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor="person-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Select Person
      </label>
      <input
        id="person-search"
        type="text"
        value={inputValue}
        onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        placeholder="Search or enter a name…"
        autoComplete="off"
      />
      {isOpen && (filteredNames.length > 0 || showNewOption) && (
        <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredNames.map((name) => (
            <li
              key={name}
              onMouseDown={() => handleSelect(name)}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {name}
            </li>
          ))}
          {showNewOption && (
            <li
              onMouseDown={() => handleSelect(inputValue.trim())}
              className="px-4 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 border-t border-gray-100 dark:border-gray-700"
            >
              Use "{inputValue.trim()}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}