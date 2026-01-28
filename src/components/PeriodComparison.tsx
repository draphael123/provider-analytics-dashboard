import { useMemo, useState } from 'react';
import { ProviderWeekData } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { sortWeeks } from '../utils/dataTransformer';

interface PeriodComparisonProps {
  data: ProviderWeekData[];
}

export function PeriodComparison({ data }: PeriodComparisonProps) {
  const [period1, setPeriod1] = useState<[string, string] | null>(null);
  const [period2, setPeriod2] = useState<[string, string] | null>(null);

  const weeks = useMemo(() => {
    return sortWeeks(Array.from(new Set(data.map(d => d.week))));
  }, [data]);

  const period1Data = useMemo(() => {
    if (!period1) return [];
    const [start, end] = period1;
    return data.filter(d => {
      const weekIndex = weeks.indexOf(d.week);
      const startIndex = weeks.indexOf(start);
      const endIndex = weeks.indexOf(end);
      return weekIndex >= startIndex && weekIndex <= endIndex;
    });
  }, [data, period1, weeks]);

  const period2Data = useMemo(() => {
    if (!period2) return [];
    const [start, end] = period2;
    return data.filter(d => {
      const weekIndex = weeks.indexOf(d.week);
      const startIndex = weeks.indexOf(start);
      const endIndex = weeks.indexOf(end);
      return weekIndex >= startIndex && weekIndex <= endIndex;
    });
  }, [data, period2, weeks]);

  const comparison = useMemo(() => {
    if (!period1Data.length || !period2Data.length) return null;

    const p1Total = period1Data.reduce((sum, d) => sum + d.totalVisits, 0);
    const p1Over20 = period1Data.reduce((sum, d) => sum + d.visitsOver20Min, 0);
    const p1Percent = p1Total > 0 ? (p1Over20 / p1Total) * 100 : 0;

    const p2Total = period2Data.reduce((sum, d) => sum + d.totalVisits, 0);
    const p2Over20 = period2Data.reduce((sum, d) => sum + d.visitsOver20Min, 0);
    const p2Percent = p2Total > 0 ? (p2Over20 / p2Total) * 100 : 0;

    const change = p2Percent - p1Percent;

    return {
      period1: { total: p1Total, over20: p1Over20, percent: p1Percent },
      period2: { total: p2Total, over20: p2Over20, percent: p2Percent },
      change,
      changeDirection: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'neutral',
    };
  }, [period1Data, period2Data]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Period Comparison</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period 1</label>
          <div className="flex gap-2">
            <select
              value={period1?.[0] || ''}
              onChange={(e) => setPeriod1(e.target.value ? [e.target.value, period1?.[1] || e.target.value] : null)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Start week</option>
              {weeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
            <select
              value={period1?.[1] || ''}
              onChange={(e) => setPeriod1(period1?.[0] ? [period1[0], e.target.value] : null)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">End week</option>
              {weeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period 2</label>
          <div className="flex gap-2">
            <select
              value={period2?.[0] || ''}
              onChange={(e) => setPeriod2(e.target.value ? [e.target.value, period2?.[1] || e.target.value] : null)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Start week</option>
              {weeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
            <select
              value={period2?.[1] || ''}
              onChange={(e) => setPeriod2(period2?.[0] ? [period2[0], e.target.value] : null)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">End week</option>
              {weeks.map(week => (
                <option key={week} value={week}>{week}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {comparison && (
        <div className="grid grid-cols-2 gap-6">
          <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Period 1</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Visits:</span>
                <span className="font-semibold">{comparison.period1.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">% Over 20 Min:</span>
                <span className="font-semibold">{comparison.period1.percent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Period 2</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Visits:</span>
                <span className="font-semibold">{comparison.period2.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">% Over 20 Min:</span>
                <span className="font-semibold">{comparison.period2.percent.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="col-span-2 border-t border-gray-200 dark:border-gray-800 pt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Comparison</h4>
            <div className="flex items-center gap-2">
              {comparison.changeDirection === 'down' ? (
                <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : comparison.changeDirection === 'up' ? (
                <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <Minus className="h-5 w-5 text-gray-400" />
              )}
              <span className={`text-lg font-bold ${
                comparison.changeDirection === 'down' ? 'text-green-600 dark:text-green-400' :
                comparison.changeDirection === 'up' ? 'text-red-600 dark:text-red-400' :
                'text-gray-600 dark:text-gray-400'
              }`}>
                {comparison.change > 0 ? '+' : ''}{comparison.change.toFixed(1)}% change
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {comparison.changeDirection === 'down' 
                ? 'Performance improved (decreased % over 20 min)' 
                : comparison.changeDirection === 'up'
                ? 'Performance declined (increased % over 20 min)'
                : 'No significant change'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

