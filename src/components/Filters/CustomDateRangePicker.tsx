import { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { ProviderWeekData } from '../../types';
import { getUniqueWeeks, sortWeeks } from '../../utils/dataTransformer';

interface CustomDateRangePickerProps {
  data: ProviderWeekData[];
  weekRange: [string, string] | null;
  onRangeChange: (range: [string, string] | null) => void;
}

export function CustomDateRangePicker({ data, weekRange, onRangeChange }: CustomDateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const weeks = sortWeeks(getUniqueWeeks(data));

  const handleQuickSelect = (option: 'last4' | 'last8' | 'last12' | 'all' | 'thisMonth' | 'lastMonth') => {
    if (weeks.length === 0) return;

    if (option === 'all') {
      onRangeChange([weeks[0], weeks[weeks.length - 1]]);
    } else if (option === 'last4' || option === 'last8' || option === 'last12') {
      const numWeeks = option === 'last4' ? 4 : option === 'last8' ? 8 : 12;
      if (weeks.length >= numWeeks) {
        onRangeChange([weeks[weeks.length - numWeeks], weeks[weeks.length - 1]]);
      } else {
        onRangeChange([weeks[0], weeks[weeks.length - 1]]);
      }
    } else if (option === 'thisMonth' || option === 'lastMonth') {
      // For month-based selection, use the most recent weeks
      const recentWeeks = weeks.slice(-4);
      onRangeChange([recentWeeks[0], recentWeeks[recentWeeks.length - 1]]);
    }
    setIsOpen(false);
  };

  const handleWeekSelect = (week: string, isStart: boolean) => {
    if (weekRange) {
      onRangeChange(isStart ? [week, weekRange[1]] : [weekRange[0], week]);
    } else {
      onRangeChange([week, week]);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <Calendar className="h-4 w-4" />
        <span className="flex-1 text-left">
          {weekRange ? `${weekRange[0]} - ${weekRange[1]}` : 'Select Date Range'}
        </span>
        {weekRange && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRangeChange(null);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date Range</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick Select Presets */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Select</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickSelect('last4')}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Last 4 Weeks
                  </button>
                  <button
                    onClick={() => handleQuickSelect('last8')}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Last 8 Weeks
                  </button>
                  <button
                    onClick={() => handleQuickSelect('last12')}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Last 12 Weeks
                  </button>
                  <button
                    onClick={() => handleQuickSelect('all')}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    All Weeks
                  </button>
                </div>
              </div>

              {/* Custom Week Selection */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Range</p>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start Week</label>
                    <select
                      value={weekRange?.[0] || ''}
                      onChange={(e) => handleWeekSelect(e.target.value, true)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select start week</option>
                      {weeks.map(week => (
                        <option key={week} value={week}>{week}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">End Week</label>
                    <select
                      value={weekRange?.[1] || ''}
                      onChange={(e) => handleWeekSelect(e.target.value, false)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select end week</option>
                      {weeks.map(week => (
                        <option key={week} value={week}>{week}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

