import { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BluetoothControl } from './components/BluetoothControl';
import { ForceDisplay } from './components/ForceDisplay';
import { GoogleAuth } from './components/GoogleAuth';
import { PersonSelector } from './components/PersonSelector';
import { ForceTest } from './components/ForceTest';
import { HistoryChart } from './components/HistoryChart';
import { DarkModeToggle } from './components/DarkModeToggle';
import { TrainingTab } from './components/TrainingTab';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [activeTab, setActiveTab] = useState<'test' | 'training'>('test');

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Tindeq Force Logger
              </h1>
              <div className="flex items-center gap-4">
                <BluetoothControl />
                <DarkModeToggle />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-slate-100 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-950 border-t border-gray-100 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <nav className="flex gap-1 py-2">
                {(['test', 'training'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors focus:outline-none ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab === 'test' ? 'Force Test' : 'Training'}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {activeTab === 'test' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <ForceDisplay />
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <PersonSelector />
                  <div className="mt-4">
                    <ForceTest />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Session History
                  </span>
                  <GoogleAuth />
                </div>
                <div className="flex-1 p-4 min-h-0" style={{ minHeight: '440px' }}>
                  <HistoryChart />
                </div>
              </div>
            </div>
          ) : (
            <TrainingTab />
          )}
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
