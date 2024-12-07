import React from 'react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';
import { useAuthStore } from '../store/authStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function GoogleAuth() {
  const { setAuthenticated, setUserInfo } = useAuthStore();

  const onSuccess = (credentialResponse: any) => {
    try {
      if (credentialResponse?.credential) {
        googleSheetsService.setAccessToken(credentialResponse.credential);
        setAuthenticated(true);
        
        // You can decode the credential to get user info if needed
        const decoded = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        setUserInfo({
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture
        });
      }
    } catch (error) {
      console.error('Failed to process Google login:', error);
      setAuthenticated(false);
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
      <GoogleOAuthProvider 
        clientId={GOOGLE_CLIENT_ID}
      >
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          useOneTap={false}
          context="signin"
          ux_mode="popup"
          auto_select={false}
        />
      </GoogleOAuthProvider>
      <GoogleSheetsStatus />
    </div>
  );
}