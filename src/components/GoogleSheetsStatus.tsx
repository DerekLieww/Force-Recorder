import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { googleSheetsService } from '../services/googleSheets';
import { useAuthStore } from '../store/authStore';

export function GoogleSheetsStatus() {
  const [sheetExists, setSheetExists] = useState<boolean | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      checkSheetStatus();
    }
  }, [isAuthenticated]);

  const checkSheetStatus = async () => {
    try {
      const exists = await googleSheetsService.checkSpreadsheetExists();
      setSheetExists(exists);
    } catch (error) {
      console.error('Failed to check spreadsheet status:', error);
      setSheetExists(false);
    }
  };

  const handleCreateSheet = async () => {
    try {
      setIsCreating(true);
      await googleSheetsService.createSpreadsheet();
      await checkSheetStatus();
    } catch (error) {
      console.error('Failed to create spreadsheet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (sheetExists === null) {
    return <div className="text-gray-500">Checking sheet status...</div>;
  }

  return (
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
          <Plus className="w-4 h-4" />
          {isCreating ? 'Creating...' : 'Create Sheet'}
        </Button>
      )}
    </div>
  );
}