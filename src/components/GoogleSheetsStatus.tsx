import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { googleSheetsService } from '../services/googleSheets';
import { useAuthStore } from '../store/authStore';

export function GoogleSheetsStatus() {
  const [sheetExists, setSheetExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      checkSheetStatus();
    } else {
      setSheetExists(null);
      setError(null);
    }
  }, [isAuthenticated]);

  const checkSheetStatus = async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsChecking(true);
      setError(null);
      const exists = await googleSheetsService.checkSpreadsheetExists();
      setSheetExists(exists);
    } catch (error) {
      console.error('Failed to check spreadsheet status:', error);
      setError('Failed to check spreadsheet status');
      setSheetExists(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCreateSheet = async () => {
    try {
      setIsCreating(true);
      setError(null);
      await googleSheetsService.createSpreadsheet();
      await checkSheetStatus();
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
      setError('Failed to create spreadsheet');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Checking sheet status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {sheetExists ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-700">Sheet connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">Sheet not found</span>
            </>
          )}
        </div>
        
        {!sheetExists && (
          <Button
            onClick={handleCreateSheet}
            disabled={isCreating}
            variant="secondary"
            className="flex items-center gap-2"
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isCreating ? 'Creating...' : 'Create Sheet'}
          </Button>
        )}
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
          <button
            onClick={checkSheetStatus}
            className="ml-2 text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}