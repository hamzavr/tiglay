import React from 'react';
import { Moon, Sun, Globe, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <User className="w-4 h-4" />
            <span>{user?.username}</span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
              {user?.role}
            </span>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLanguage('fr')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'fr'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => setLanguage('ar')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                language === 'ar'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              العربية
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;