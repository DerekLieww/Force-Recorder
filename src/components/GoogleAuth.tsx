import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';
import { useAuthStore } from '../store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function GoogleAuth() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const onSuccess = (credentialResponse: any) => {
    if (credentialResponse?.credential) {
      googleSheetsService.setAccessToken(credentialResponse.credential);
      setAuthenticated(true);
    }
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
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          type="standard"
          theme="filled_blue"
          size="large"
          width="250"
          cookiePolicy="single_host_origin"
          scope="https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file"
        />
      </GoogleOAuthProvider>
      <GoogleSheetsStatus />
    </div>
  );
}