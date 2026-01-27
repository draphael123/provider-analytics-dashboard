import { useState, useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface ProviderRankingTableProps {
  data: ProviderWeekData[];
  onProviderSelect?: (provider: string) => void;
}

type SortField = 'provider' | 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min';
type SortDirection = 'asc' | 'desc';

interface ProviderStats {
  provider: string;
  totalVisits: number;
  visitsOver20Min: number;
  percentOver20Min: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
}

export function ProviderRankingTable({ data, onProviderSelect }: ProviderRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>('percentOver20Min');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const providerStats = useMemo(() => {
    const statsMap = new Map<string, ProviderStats>();

    data.forEach(item => {
      const existing = statsMap.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20Min += item.visitsOver20Min;
      } else {
        statsMap.set(item.provider, {
          provider: item.provider,
          totalVisits: item.totalVisits,
          visitsOver20Min: item.visitsOver20Min,
          percentOver20Min: item.percentOver20Min,
          trend: 'neutral',
          trendValue: 0,
        });
      }
    });

    // Calculate trends and final percentages
    const stats = Array.from(statsMap.values()).map(stat => {
      stat.percentOver20Min = stat.totalVisits > 0 
        ? (stat.visitsOver20Min / stat.totalVisits) * 100 
        : 0;
      
      // Calculate week-over-week trend (compare most recent week vs previous week)
      const providerData = data.filter(d => d.provider === stat.provider);
      if (providerData.length > 1) {
        // Sort by week chronologically
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
        
        // Compare most recent week vs previous week
        const recent = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];
        
        const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
        const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
        
        stat.trendValue = recentPercent - prevPercent; // Negative is good (decreasing)
        stat.trend = stat.trendValue > 1 ? 'up' : stat.trendValue < -1 ? 'down' : 'neutral';
      }
      
      return stat;
    });

    return stats;
  }, [data]);

  const sortedStats = useMemo(() => {
    return [...providerStats].sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'provider') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, [providerStats, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-primary-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary-600" />
    );
  };

  const getPerformanceColor = (percent: number) => {
    if (percent >= 20) return 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-300 dark:border-green-700';
    if (percent >= 10) return 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 border-amber-300 dark:border-amber-700';
    return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 border-2 border-red-300 dark:border-red-700';
  };

  const getPerformanceBadge = (percent: number) => {
    if (percent >= 20) return { text: 'Excellent', color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md' };
    if (percent >= 10) return { text: 'Good', color: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md' };
    return { text: 'Needs Improvement', color: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md' };
  };

  if (sortedStats.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No data available for ranking</p>
      </div>
    );
  }

  // Calculate benchmarks
  const avgPercent = sortedStats.reduce((sum, s) => sum + s.percentOver20Min, 0) / sortedStats.length;
  const medianPercent = [...sortedStats].sort((a, b) => a.percentOver20Min - b.percentOver20Min)[Math.floor(sortedStats.length / 2)]?.percentOver20Min || 0;
  const topQuartile = [...sortedStats].sort((a, b) => b.percentOver20Min - a.percentOver20Min)[Math.floor(sortedStats.length * 0.25)]?.percentOver20Min || 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Provider Performance Ranking</h3>
        <p className="text-sm text-gray-500 mt-1">
          Benchmarks: Avg {avgPercent.toFixed(1)}% | Median {medianPercent.toFixed(1)}% | Top 25% {topQuartile.toFixed(1)}%
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('provider')}
              >
                <div className="flex items-center gap-2">
                  Provider
                  {getSortIcon('provider')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalVisits')}
              >
                <div className="flex items-center gap-2">
                  Total Visits
                  {getSortIcon('totalVisits')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('percentOver20Min')}
              >
                <div className="flex items-center gap-2">
                  % Over 20 Min
                  {getSortIcon('percentOver20Min')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trend
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedStats.map((stat, index) => {
              const performance = getPerformanceBadge(stat.percentOver20Min);
              return (
                <tr
                  key={stat.provider}
                  className={`hover:bg-gray-50 cursor-pointer ${getPerformanceColor(stat.percentOver20Min)}`}
                  onClick={() => onProviderSelect?.(stat.provider)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.provider}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.totalVisits.toLocaleString()}
                  </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{stat.percentOver20Min.toFixed(1)}%</span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 shadow-inner">
                                <div
                                  className={`h-2.5 rounded-full transition-all ${
                                    stat.percentOver20Min >= 20 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                                    stat.percentOver20Min >= 10 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                                    'bg-gradient-to-r from-red-500 to-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(100, stat.percentOver20Min)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {stat.trend === 'up' ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span>+{stat.trendValue.toFixed(1)}%</span>
                      </div>
                    ) : stat.trend === 'down' ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <TrendingDown className="h-4 w-4" />
                        <span>{stat.trendValue.toFixed(1)}%</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${performance.color}`}>
                      {performance.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

