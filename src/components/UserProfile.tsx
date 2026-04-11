import { LogOut } from 'lucide-react';
import type { UserInfo } from '../store/authStore';

interface UserProfileProps {
  userInfo: UserInfo;
  onLogout: () => void;
}

export function UserProfile({ userInfo, onLogout }: UserProfileProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <img
        src={userInfo.picture}
        alt={userInfo.name}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{userInfo.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userInfo.email}</p>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
      >
        <LogOut className="w-3 h-3" />
        Sign out
      </button>
    </div>
  );
}
