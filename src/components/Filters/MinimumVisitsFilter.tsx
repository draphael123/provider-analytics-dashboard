import { useState } from 'react';

interface MinimumVisitsFilterProps {
  minimumVisits: number | null;
  onMinimumVisitsChange: (min: number | null) => void;
}

export function MinimumVisitsFilter({ minimumVisits, onMinimumVisitsChange }: MinimumVisitsFilterProps) {
  const [inputValue, setInputValue] = useState<string>(minimumVisits?.toString() || '');

  const handleChange = (value: string) => {
    setInputValue(value);
    const num = parseInt(value, 10);
    if (value === '' || isNaN(num)) {
      onMinimumVisitsChange(null);
    } else {
      onMinimumVisitsChange(num);
    }
  };

  const quickOptions = [10, 25, 50, 100, 250, 500];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Minimum Total Visits
      </label>
      <div className="space-y-2">
        <input
          type="number"
          min="0"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter minimum visits"
          className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <div className="flex flex-wrap gap-2">
          {quickOptions.map(option => (
            <button
              key={option}
              onClick={() => {
                setInputValue(option.toString());
                onMinimumVisitsChange(option);
              }}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                minimumVisits === option
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {option}+
            </button>
          ))}
          {minimumVisits !== null && (
            <button
              onClick={() => {
                setInputValue('');
                onMinimumVisitsChange(null);
              }}
              className="px-3 py-1 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

