import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { forecastAllProviders, Forecast } from '../utils/forecasting';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

interface ForecastingPanelProps {
  data: ProviderWeekData[];
}

export function ForecastingPanel({ data }: ForecastingPanelProps) {
  const forecasts = useMemo(() => {
    return forecastAllProviders(data, 'percentOver20Min');
  }, [data]);

  const getTrendIcon = (trend: Forecast['trend']) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: Forecast['confidence']) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800';
    }
  };

  if (forecasts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Forecasting</h3>
        <p className="text-gray-500 dark:text-gray-400">Insufficient data for forecasting</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Forecasting</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-4 w-4" />
          <span>Based on historical trends</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next Week</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next 2 Weeks</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Next Month</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Trend</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Confidence</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {forecasts.map(forecast => (
              <tr key={forecast.provider} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{forecast.provider}</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{forecast.nextWeek.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{forecast.nextTwoWeeks.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{forecast.nextMonth.toFixed(1)}%</td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(forecast.trend)}
                    <span className="capitalize">{forecast.trend}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(forecast.confidence)}`}>
                    {forecast.confidence.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Forecasts are based on linear regression and moving averages. 
          Actual results may vary. Confidence levels: High (8+ weeks, low variance), 
          Medium (4+ weeks, moderate variance), Low (limited data or high variance).
        </p>
      </div>
    </div>
  );
}

