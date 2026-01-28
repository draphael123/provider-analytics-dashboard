import { RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface DataRefreshProps {
  onRefresh: () => void;
  lastUpdated?: Date;
  autoRefreshInterval?: number; // in minutes
}

export function DataRefresh({ onRefresh, lastUpdated, autoRefreshInterval }: DataRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number | null>(null);

  useEffect(() => {
    if (!autoRefreshInterval) return;

    const interval = setInterval(() => {
      onRefresh();
    }, autoRefreshInterval * 60 * 1000);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      if (lastUpdated) {
        const elapsed = Date.now() - lastUpdated.getTime();
        const remaining = (autoRefreshInterval * 60 * 1000) - elapsed;
        setTimeUntilRefresh(Math.max(0, Math.floor(remaining / 1000)));
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, [autoRefreshInterval, onRefresh, lastUpdated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="h-3 w-3" />
          <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}
      {timeUntilRefresh !== null && timeUntilRefresh > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Next refresh: {formatTime(timeUntilRefresh)}
        </div>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Refresh data"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}

