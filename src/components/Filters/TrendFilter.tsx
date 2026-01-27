interface TrendFilterProps {
  selectedTrend: string | null;
  onTrendChange: (trend: string | null) => void;
}

export function TrendFilter({ selectedTrend, onTrendChange }: TrendFilterProps) {
  const trendOptions = [
    { value: 'improving', label: 'Improving', description: 'Increasing % Over 20 Min' },
    { value: 'declining', label: 'Declining', description: 'Decreasing % Over 20 Min' },
    { value: 'stable', label: 'Stable', description: 'No significant change' },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Trend
      </label>
      <select
        value={selectedTrend || ''}
        onChange={(e) => onTrendChange(e.target.value || null)}
        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Trends</option>
        {trendOptions.map(trend => (
          <option key={trend.value} value={trend.value}>
            {trend.label}
          </option>
        ))}
      </select>
    </div>
  );
}

