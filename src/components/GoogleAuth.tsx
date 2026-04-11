import { googleLogout, useGoogleLogin, type TokenResponse } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';
import { useAuthStore } from '../store/authStore';
import { UserProfile } from './UserProfile';
import axios from 'axios';

export function GoogleAuth() {
  const { setAuthenticated, setUserInfo, userInfo } = useAuthStore();

  const logOut = () => {
    googleLogout();
    setUserInfo(null);
    setAuthenticated(false);
  };

  const onSuccesss = (credentialResponse: TokenResponse) => {
    try {
      if (credentialResponse?.access_token) {
        googleSheetsService.setAccessToken(credentialResponse.access_token);
        setAuthenticated(true);

        axios
          .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentialResponse.access_token}`, {
            headers: {
              Authorization: `Bearer ${credentialResponse.access_token}`,
              Accept: 'application/json',
            },
          })
          .then((res) => setUserInfo(res.data))
          .catch((err) => console.log(err));
      }
    } catch (error) {
      console.error('Failed to process Google login:', error);
      setAuthenticated(false);
    }
  };

  const onErrorr = () => {
    console.error('Google Login Failed');
    setAuthenticated(false);
  };

  const login = useGoogleLogin({
    scope: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
      'openid',
      'email',
      'profile',
    ].join(' '),
    onSuccess: onSuccesss,
    onError: onErrorr,
  });

  return (
    <div className="flex items-center gap-4 w-full">
      {userInfo ? (
        <UserProfile userInfo={userInfo} onLogout={logOut} />
      ) : (
        <button
          aria-label="Sign in with Google"
          className="flex items-center bg-white border border-gray-300 rounded-md p-0.5 pr-3 hover:bg-gray-50 transition-colors flex-shrink-0 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
          onClick={() => login()}
        >
          <div className="flex items-center justify-center bg-white w-8 h-8 rounded-l dark:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
              <title>Sign in with Google</title>
              <desc>Google G Logo</desc>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
          <span className="text-sm text-gray-600 font-medium dark:text-gray-200">Sign in with Google</span>
        </button>
      )}
      <div className="flex-1">
        <GoogleSheetsStatus />
      </div>
    </div>
  );
}
