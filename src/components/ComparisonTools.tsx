import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ComparisonToolsProps {
  data: ProviderWeekData[];
  selectedProviders: string[];
}

export function ComparisonTools({ data, selectedProviders }: ComparisonToolsProps) {
  const [provider1, provider2] = selectedProviders.length >= 2 
    ? [selectedProviders[0], selectedProviders[1]]
    : selectedProviders.length === 1
    ? [selectedProviders[0], null]
    : [null, null];

  const comparisonData = useMemo(() => {
    if (!provider1) return null;

    const provider1Data = data.filter(d => d.provider === provider1);
    const provider2Data = provider2 ? data.filter(d => d.provider === provider2) : [];

    const provider1Stats = {
      provider: provider1,
      totalVisits: provider1Data.reduce((sum, d) => sum + d.totalVisits, 0),
      visitsOver20Min: provider1Data.reduce((sum, d) => sum + d.visitsOver20Min, 0),
      percentOver20Min: 0,
      weeks: provider1Data.length,
      trend: 0,
    };
    provider1Stats.percentOver20Min = provider1Stats.totalVisits > 0
      ? (provider1Stats.visitsOver20Min / provider1Stats.totalVisits) * 100
      : 0;

    // Calculate trend for provider 1
    if (provider1Data.length > 1) {
      const sorted = [...provider1Data].sort((a, b) => {
        const weekA = a.week.match(/(\d{1,2})\/(\d{1,2})/);
        const weekB = b.week.match(/(\d{1,2})\/(\d{1,2})/);
        if (!weekA || !weekB) return a.week.localeCompare(b.week);
        const monthA = parseInt(weekA[1]);
        const dayA = parseInt(weekA[2]);
        const monthB = parseInt(weekB[1]);
        const dayB = parseInt(weekB[2]);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });
      const recent = sorted[sorted.length - 1];
      const previous = sorted[sorted.length - 2];
      const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
      const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
      provider1Stats.trend = recentPercent - prevPercent;
    }

    let provider2Stats = null;
    if (provider2 && provider2Data.length > 0) {
      provider2Stats = {
        provider: provider2,
        totalVisits: provider2Data.reduce((sum, d) => sum + d.totalVisits, 0),
        visitsOver20Min: provider2Data.reduce((sum, d) => sum + d.visitsOver20Min, 0),
        percentOver20Min: 0,
        weeks: provider2Data.length,
        trend: 0,
      };
      provider2Stats.percentOver20Min = provider2Stats.totalVisits > 0
        ? (provider2Stats.visitsOver20Min / provider2Stats.totalVisits) * 100
        : 0;

      // Calculate trend for provider 2
      if (provider2Data.length > 1) {
        const sorted = [...provider2Data].sort((a, b) => {
          const weekA = a.week.match(/(\d{1,2})\/(\d{1,2})/);
          const weekB = b.week.match(/(\d{1,2})\/(\d{1,2})/);
          if (!weekA || !weekB) return a.week.localeCompare(b.week);
          const monthA = parseInt(weekA[1]);
          const dayA = parseInt(weekA[2]);
          const monthB = parseInt(weekB[1]);
          const dayB = parseInt(weekB[2]);
          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        });
        const recent = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];
        const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
        const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
        provider2Stats.trend = recentPercent - prevPercent;
      }
    }

    return { provider1: provider1Stats, provider2: provider2Stats };
  }, [data, provider1, provider2]);

  if (!comparisonData || !comparisonData.provider1) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Provider Comparison</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select 1-2 providers from the filter to compare their performance.
        </p>
      </div>
    );
  }

  const { provider1: p1, provider2: p2 } = comparisonData;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Provider Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Provider 1 */}
        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{p1.provider}</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Visits:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{p1.totalVisits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Visits Over 20 Min:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{p1.visitsOver20Min.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">% Over 20 Min:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{p1.percentOver20Min.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
              <div className="flex items-center gap-1">
                {p1.trend < -1 ? (
                  <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : p1.trend > 1 ? (
                  <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                ) : (
                  <Minus className="h-4 w-4 text-gray-400" />
                )}
                <span className={`font-semibold ${
                  p1.trend < -1 ? 'text-green-600 dark:text-green-400' :
                  p1.trend > 1 ? 'text-red-600 dark:text-red-400' :
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {p1.trend !== 0 ? `${p1.trend > 0 ? '+' : ''}${p1.trend.toFixed(1)}%` : 'No change'}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Weeks:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{p1.weeks}</span>
            </div>
          </div>
        </div>

        {/* Provider 2 or Comparison */}
        {p2 ? (
          <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-3">{p2.provider}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Visits:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{p2.totalVisits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Visits Over 20 Min:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{p2.visitsOver20Min.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">% Over 20 Min:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{p2.percentOver20Min.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                <div className="flex items-center gap-1">
                  {p2.trend < -1 ? (
                    <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : p2.trend > 1 ? (
                    <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`font-semibold ${
                    p2.trend < -1 ? 'text-green-600 dark:text-green-400' :
                    p2.trend > 1 ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {p2.trend !== 0 ? `${p2.trend > 0 ? '+' : ''}${p2.trend.toFixed(1)}%` : 'No change'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Weeks:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{p2.weeks}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Select a second provider to compare
            </p>
          </div>
        )}
      </div>

      {/* Comparison Metrics */}
      {p2 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Comparison</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">% Over 20 Min Difference</p>
              <p className={`text-lg font-bold ${
                p1.percentOver20Min < p2.percentOver20Min ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {p1.percentOver20Min < p2.percentOver20Min ? '-' : '+'}
                {Math.abs(p1.percentOver20Min - p2.percentOver20Min).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {p1.percentOver20Min < p2.percentOver20Min ? `${p1.provider} is better` : `${p2.provider} is better`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Visits Difference</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.abs(p1.totalVisits - p2.totalVisits).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Trend Comparison</p>
              <p className={`text-lg font-bold ${
                p1.trend < p2.trend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {p1.trend < p2.trend ? `${p1.provider} improving faster` : `${p2.provider} improving faster`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

