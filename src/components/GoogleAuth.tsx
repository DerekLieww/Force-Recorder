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
      {userInfo ? (
                <div>
                    <img src={userInfo.picture} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {userInfo.name}</p>
                    <p>Email Address: {userInfo.email}</p>
                    <br />
                    <br />
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
              <button onClick={() => login()}>
              <i className="fa-brands fa-google"></i>
                Sign in with Google 🚀 
            </button>
            )}
      
      </GoogleOAuthProvider>
      <GoogleSheetsStatus />
    </div>
  );
}
