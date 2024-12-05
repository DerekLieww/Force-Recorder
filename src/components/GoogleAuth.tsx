import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';
import { useAuthStore } from '../store/authStore';

export function GoogleAuth() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const onSuccess = (response: any) => {
    googleSheetsService.setAccessToken(response.access_token);
    setAuthenticated(true);
  };

  const onError = () => {
    console.error('Google Login Failed');
    setAuthenticated(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Connect to Google Sheets
      </h2>
      <GoogleLogin onSuccess={onSuccess} onError={onError} />
      <GoogleSheetsStatus />
    </div>
  );
}