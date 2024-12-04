import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BluetoothControl } from './components/BluetoothControl';
import { ForceDisplay } from './components/ForceDisplay';
import { GoogleAuth } from './components/GoogleAuth';
import { PersonSelector } from './components/PersonSelector';
import { ForceTest } from './components/ForceTest';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tindeq Force Logger
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <BluetoothControl />
                  <ForceDisplay />
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <PersonSelector />
                    <div className="mt-4">
                      <ForceTest />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <GoogleAuth />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;