import React from 'react';
import { googleLogout,GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { googleSheetsService } from '../services/googleSheets';
import { GoogleSheetsStatus } from './GoogleSheetsStatus';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; 

export function GoogleAuth() {
  const { setAuthenticated, setUserInfo, userInfo } = useAuthStore();
    // log out function to log the user out of google and set the profile array to null
    const logOut = () => {
      googleLogout();
      setUserInfo(null);
      setAuthenticated(false);
  };
  const onSuccesss = (credentialResponse: any) => {
    try {
      console.log(credentialResponse);
      if (credentialResponse?.access_token) {
        console.log(credentialResponse);
        googleSheetsService.setAccessToken(credentialResponse.access_token);
        setAuthenticated(true);

        axios
          .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${credentialResponse.access_token}`, {
              headers: {
                  Authorization: `Bearer ${credentialResponse.access_token}`,
                  Accept: 'application/json'
              }
          })
          .then((res) => {
              setUserInfo(res.data);
              console.log(res.data);
          })
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
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
      "openid",
      "email",
      "profile"].join(" "),
    onSuccess: onSuccesss,
    onError: onErrorr,

  });
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Connect to Google Sheets
      </h2>
      <GoogleOAuthProvider 
        clientId={GOOGLE_CLIENT_ID}
      >
      <GoogleSheetsStatus />
      {userInfo ? (
        <div>
          <img src={userInfo.picture} alt="user image" />
          <h3>User Logged in</h3>
          <p>Name: {userInfo.name}</p>
          <p>Email Address: {userInfo.email}</p>
          <br />
          <br />

          <button
            onClick={logOut}
          className={`
            relative 
            px-5 
            py-2 
            text-sm 
            font-medium 
            text-white 
            bg-gray-800 
            rounded-lg 
            group 
            focus:outline-none 
            focus:ring-2 
            focus:ring-offset-2 
            focus:ring-gray-500
            hover:bg-gray-700
            transition-all 
            duration-300 
            ease-in-out
            transform 
            hover:-translate-y-0.5 
            active:translate-y-0
            shadow-md 
            hover:shadow-lg
          `}
        >
          <span className="block relative">
            Sign Out
          </span>
        </button>
        </div>
        ) : (
        <button
          aria-label="Sign in with Google"
          className="flex items-center bg-white border border-button-border-light rounded-md p-0.5 pr-3"
          onClick={() => login()}
        >
          <div className="flex items-center justify-center bg-white w-9 h-9 rounded-l">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
              <title>Sign in with Google</title>
              <desc>Google G Logo</desc>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                className="fill-google-logo-blue"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                className="fill-google-logo-green"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                className="fill-google-logo-yellow"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                className="fill-google-logo-red"
              ></path>
            </svg>
          </div>
          <span className="text-sm text-google-text-gray tracking-wider">Sign in with Google</span>
        </button>
        )}
      
      </GoogleOAuthProvider>
    </div>
  );
}
