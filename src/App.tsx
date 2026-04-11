import { GoogleOAuthProvider } from '@react-oauth/google';
import { BluetoothControl } from './components/BluetoothControl';
import { ForceDisplay } from './components/ForceDisplay';
import { GoogleAuth } from './components/GoogleAuth';
import { PersonSelector } from './components/PersonSelector';
import { ForceTest } from './components/ForceTest';
import { HistoryChart } from './components/HistoryChart';
import { DarkModeToggle } from './components/DarkModeToggle';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tindeq Force Logger</h1>
            <DarkModeToggle />
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left Column */}
              <div className="space-y-6">
                <BluetoothControl />
                <ForceDisplay />
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <PersonSelector />
                  <div className="mt-4">
                    <ForceTest />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col" style={{ minHeight: '520px' }}>
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                  <GoogleAuth />
                </div>
                <div className="flex-1 p-4 min-h-0">
                  <HistoryChart />
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
