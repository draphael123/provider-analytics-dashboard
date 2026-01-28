import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { LineChart } from './Charts/LineChart';
import { X, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { sortWeeks } from '../utils/dataTransformer';

interface ProviderDetailViewProps {
  provider: string;
  data: ProviderWeekData[];
  allProviders: string[];
  onClose: () => void;
  onSendMessage?: (provider: string) => void;
}

export function ProviderDetailView({ provider, data, allProviders, onClose, onSendMessage }: ProviderDetailViewProps) {
  const providerData = useMemo(() => {
    return data.filter(d => d.provider === provider);
  }, [data, provider]);

  const stats = useMemo(() => {
    if (providerData.length === 0) {
      return {
        totalVisits: 0,
        visitsOver20Min: 0,
        percentOver20Min: 0,
        weeks: 0,
        trend: 0,
        trendDirection: 'neutral' as 'up' | 'down' | 'neutral',
      };
    }

    const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
    const visitsOver20Min = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
    const percentOver20Min = totalVisits > 0 ? (visitsOver20Min / totalVisits) * 100 : 0;

    // Calculate week-over-week trend
    let trend = 0;
    let trendDirection: 'up' | 'down' | 'neutral' = 'neutral';
    
    if (providerData.length > 1) {
      const sorted = [...providerData].sort((a, b) => {
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
      
      trend = recentPercent - prevPercent;
      trendDirection = trend > 1 ? 'up' : trend < -1 ? 'down' : 'neutral';
    }

    return {
      totalVisits,
      visitsOver20Min,
      percentOver20Min,
      weeks: providerData.length,
      trend,
      trendDirection,
    };
  }, [providerData]);

  const weeklyBreakdown = useMemo(() => {
    return sortWeeks(Array.from(new Set(providerData.map(d => d.week))))
      .map(week => {
        const weekData = providerData.find(d => d.week === week);
        return weekData ? {
          week,
          totalVisits: weekData.totalVisits,
          visitsOver20Min: weekData.visitsOver20Min,
          percentOver20Min: weekData.percentOver20Min,
        } : null;
      })
      .filter(Boolean) as Array<{
        week: string;
        totalVisits: number;
        visitsOver20Min: number;
        percentOver20Min: number;
      }>;
  }, [providerData]);

  if (providerData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Provider Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">No data available for {provider}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{provider}</h2>
              <p className="text-gray-600 dark:text-gray-400">Detailed performance breakdown</p>
            </div>
            <div className="flex gap-2">
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage?.(provider)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                  aria-label={`Send message to ${provider}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close provider detail view"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalVisits.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg p-4 border-2 border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">Visits Over 20 Min</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.visitsOver20Min.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-4 border-2 border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">% Over 20 Min</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.percentOver20Min.toFixed(1)}%</p>
            </div>
            <div className={`rounded-lg p-4 border-2 ${
              stats.trendDirection === 'down'
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800'
                : stats.trendDirection === 'up'
                ? 'bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                : 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-700'
            }`}>
              <p className={`text-sm font-medium ${
                stats.trendDirection === 'down' ? 'text-green-600 dark:text-green-400' :
                stats.trendDirection === 'up' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                Week-over-Week Trend
              </p>
              <div className="flex items-center gap-2 mt-1">
                {stats.trendDirection === 'down' ? (
                  <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : stats.trendDirection === 'up' ? (
                  <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                ) : null}
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.trend !== 0 ? `${stats.trend > 0 ? '+' : ''}${stats.trend.toFixed(1)}%` : 'No change'}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Week-over-Week Performance</h3>
            {providerData.length > 0 ? (
              <LineChart
                data={sortWeeks(Array.from(new Set(providerData.map(d => d.week)))).map(week => {
                  const weekData = providerData.find(d => d.week === week);
                  const dataPoint: Record<string, string | number | null> = { week };
                  dataPoint[provider] = weekData ? weekData.percentOver20Min : null;
                  return dataPoint;
                })}
                selectedMetric="percentOver20Min"
                selectedProviders={[provider]}
                allProviders={allProviders}
                showBenchmarks={true}
                benchmarkValues={{
                  average: stats.percentOver20Min,
                  median: stats.percentOver20Min,
                  topQuartile: stats.percentOver20Min,
                }}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No chart data available</p>
            )}
          </div>

          {/* Weekly Breakdown Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Breakdown</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Week</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Visits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Over 20 Min</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Over 20 Min</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {weeklyBreakdown.map((week, _index) => (
                    <tr key={week.week} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{week.week}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{week.totalVisits.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{week.visitsOver20Min.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{week.percentOver20Min.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

