import { useMemo } from 'react';
import { ProviderWeekData } from '../../types';

interface TrendFilterProps {
  data: ProviderWeekData[];
  selectedTrend: string | null;
  onTrendChange: (trend: string | null) => void;
}

export function TrendFilter({ data, selectedTrend, onTrendChange }: TrendFilterProps) {
  const providerTrends = useMemo(() => {
    const trends = new Map<string, number>();
    
    data.forEach(item => {
      // Group by provider and week to calculate trends
      const providerData = data.filter(d => d.provider === item.provider);
      if (providerData.length > 1) {
        const sorted = [...providerData].sort((a, b) => a.week.localeCompare(b.week));
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid);
        const secondHalf = sorted.slice(mid);
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / secondHalf.length;
        const trend = secondAvg - firstAvg;
        
        trends.set(item.provider, trend);
      }
    });
    
    return trends;
  }, [data]);

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

