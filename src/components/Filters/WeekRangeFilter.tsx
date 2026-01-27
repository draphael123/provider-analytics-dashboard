import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getUniqueWeeks } from '../../utils/dataTransformer';
import { ProviderWeekData } from '../../types';

interface WeekRangeFilterProps {
  data: ProviderWeekData[];
  weekRange: [string, string] | null;
  onRangeChange: (range: [string, string] | null) => void;
}

export function WeekRangeFilter({ data, weekRange, onRangeChange }: WeekRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const weeks = getUniqueWeeks(data);

  const handleQuickSelect = (option: 'last4' | 'last8' | 'all') => {
    if (option === 'all') {
      if (weeks.length > 0) {
        onRangeChange([weeks[0], weeks[weeks.length - 1]]);
      }
    } else {
      const numWeeks = option === 'last4' ? 4 : 8;
      if (weeks.length >= numWeeks) {
        onRangeChange([weeks[weeks.length - numWeeks], weeks[weeks.length - 1]]);
      } else if (weeks.length > 0) {
        onRangeChange([weeks[0], weeks[weeks.length - 1]]);
      }
    }
    setIsOpen(false);
  };

  const handleStartChange = (week: string) => {
    if (weekRange) {
      onRangeChange([week, weekRange[1]]);
    } else if (weeks.length > 0) {
      onRangeChange([week, weeks[weeks.length - 1]]);
    }
  };

  const handleEndChange = (week: string) => {
    if (weekRange) {
      onRangeChange([weekRange[0], week]);
    } else if (weeks.length > 0) {
      onRangeChange([weeks[0], week]);
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Week Range
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between"
        >
          <span className="text-sm text-gray-700">
            {weekRange
              ? `${weekRange[0]} - ${weekRange[1]}`
              : 'All weeks'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Quick Select</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleQuickSelect('last4')}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Last 4 weeks
                </button>
                <button
                  onClick={() => handleQuickSelect('last8')}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Last 8 weeks
                </button>
                <button
                  onClick={() => handleQuickSelect('all')}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  All time
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Week</label>
                <select
                  value={weekRange?.[0] || ''}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Week</label>
                <select
                  value={weekRange?.[1] || ''}
                  onChange={(e) => handleEndChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {weeks.map((week) => (
                    <option key={week} value={week}>
                      {week}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

