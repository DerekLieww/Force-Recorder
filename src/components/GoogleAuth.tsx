import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';

export function GoogleAuth() {
  const onSuccess = (response: any) => {
    googleSheetsService.setAccessToken(response.access_token);
  };

  const onError = () => {
    console.error('Google Login Failed');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Connect to Google Sheets
      </h2>
      <GoogleLogin onSuccess={onSuccess} onError={onError} />
    </div>
  );
}