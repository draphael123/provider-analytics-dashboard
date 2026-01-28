import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { calculateStatistics, calculateAllCorrelations, Correlation } from '../utils/advancedAnalytics';

interface AdvancedAnalyticsProps {
  data: ProviderWeekData[];
  selectedProvider?: string | null;
}

export function AdvancedAnalytics({ data, selectedProvider }: AdvancedAnalyticsProps) {
  const stats = useMemo(() => {
    const metrics: Array<'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'> = [
      'totalVisits',
      'visitsOver20Min',
      'percentOver20Min',
    ];

    return metrics.map(metric => calculateStatistics(data, metric, selectedProvider || undefined));
  }, [data, selectedProvider]);

  const correlations = useMemo(() => {
    return calculateAllCorrelations(data);
  }, [data]);

  const getCorrelationStrengthColor = (strength: Correlation['strength']) => {
    switch (strength) {
      case 'very_strong':
        return 'text-purple-600 dark:text-purple-400';
      case 'strong':
        return 'text-blue-600 dark:text-blue-400';
      case 'moderate':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'weak':
        return 'text-gray-600 dark:text-gray-400';
      default:
        return 'text-gray-400 dark:text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Advanced Analytics</h3>
      
      {selectedProvider && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Statistics for: <span className="font-medium">{selectedProvider}</span>
        </p>
      )}

      {/* Statistical Summaries */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Statistical Summary</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Metric</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Mean</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Median</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Std Dev</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Max</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Q1</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Q3</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {stats.map(stat => (
                <tr key={stat.metric} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{stat.metric}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.mean.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.median.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.stdDev.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.min.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.max.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.q1.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{stat.q3.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Correlations */}
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Correlation Analysis</h4>
        <div className="space-y-3">
          {correlations.map((corr, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {corr.metric1} ↔ {corr.metric2}
                </span>
                <span className={`text-sm font-bold ${getCorrelationStrengthColor(corr.strength)}`}>
                  {corr.coefficient.toFixed(3)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{corr.interpretation}</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Math.abs(corr.coefficient) > 0.7 ? 'bg-purple-500' :
                      Math.abs(corr.coefficient) > 0.5 ? 'bg-blue-500' :
                      Math.abs(corr.coefficient) > 0.3 ? 'bg-indigo-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${Math.abs(corr.coefficient) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

