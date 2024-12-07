import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { googleSheetsService } from '../services/googleSheets';
import { useForceStore } from '../store/forceStore';
import { useAuthStore } from '../store/authStore';
import { useNamesStore } from '../store/namesStore';
import { Button } from './ui/Button';
import { AddNameModal } from './AddNameModal';

export function PersonSelector() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { setSelectedPerson, selectedPerson } = useForceStore();
  const { localNames, setLocalNames } = useNamesStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      loadNames();
    }
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return <div className="text-gray-600">Please connect to Google Sheets first</div>;
  }

  if (loading) {
    return <div className="text-gray-600">Loading names...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-md">
        {error}
        <button
          onClick={loadNames}
          className="ml-2 text-red-700 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label htmlFor="person" className="block text-sm font-medium text-gray-700 mb-2">
            Select Person
          </label>
          <select
            id="person"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={selectedPerson || ''}
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="">Select a person</option>
            {localNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Person
        </Button>
      </div>

      <AddNameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}