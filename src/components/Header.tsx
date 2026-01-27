import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function Header() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 shadow-lg border-b-4 border-indigo-400 dark:border-indigo-600 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Provider Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-blue-100 dark:text-blue-200">
              Analyze provider visit metrics and week-over-week performance
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white/20 dark:bg-white/10 text-white hover:bg-white/30 dark:hover:bg-white/20 backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

