import { useState, useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface ProviderRankingTableProps {
  data: ProviderWeekData[];
  onProviderSelect?: (provider: string) => void;
}

type SortField = 'provider' | 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min' | 'avgDuration';
type SortDirection = 'asc' | 'desc';

interface ProviderStats {
  provider: string;
  totalVisits: number;
  visitsOver20Min: number;
  percentOver20Min: number;
  avgDuration: number;
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
        existing.avgDuration = (existing.avgDuration + item.avgDuration) / 2;
      } else {
        statsMap.set(item.provider, {
          provider: item.provider,
          totalVisits: item.totalVisits,
          visitsOver20Min: item.visitsOver20Min,
          percentOver20Min: item.percentOver20Min,
          avgDuration: item.avgDuration,
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
      
      // Calculate trend (compare first half vs second half of data)
      const providerData = data.filter(d => d.provider === stat.provider);
      if (providerData.length > 1) {
        const sorted = [...providerData].sort((a, b) => a.week.localeCompare(b.week));
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid);
        const secondHalf = sorted.slice(mid);
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / secondHalf.length;
        
        stat.trendValue = secondAvg - firstAvg;
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
    if (percent >= 20) return 'bg-green-50 border-green-200';
    if (percent >= 10) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceBadge = (percent: number) => {
    if (percent >= 20) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (percent >= 10) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
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
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('avgDuration')}
              >
                <div className="flex items-center gap-2">
                  Avg Duration
                  {getSortIcon('avgDuration')}
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
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, stat.percentOver20Min)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {stat.avgDuration.toFixed(1)} min
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

