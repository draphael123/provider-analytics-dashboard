import { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { ProviderWeekData } from '../../types';

interface GoalProgressChartProps {
  data: ProviderWeekData[];
  goalPercent?: number;
}

export function GoalProgressChart({ data, goalPercent = 20 }: GoalProgressChartProps) {
  const chartData = useMemo(() => {
    // Aggregate by provider
    const providerStats = new Map<string, { totalVisits: number; visitsOver20: number; percentOver20: number }>();
    
    data.forEach(item => {
      const existing = providerStats.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20 += item.visitsOver20Min;
      } else {
        providerStats.set(item.provider, {
          totalVisits: item.totalVisits,
          visitsOver20: item.visitsOver20Min,
          percentOver20: 0,
        });
      }
    });

    // Calculate percentages
    providerStats.forEach((stat) => {
      stat.percentOver20 = stat.totalVisits > 0 ? (stat.visitsOver20 / stat.totalVisits) * 100 : 0;
    });

    return Array.from(providerStats.entries())
      .map(([provider, stats]) => ({
        provider,
        percentOver20Min: parseFloat(stats.percentOver20.toFixed(1)),
        goal: goalPercent,
        progress: Math.min(100, (stats.percentOver20 / goalPercent) * 100),
      }))
      .sort((a, b) => b.percentOver20Min - a.percentOver20Min)
      .slice(0, 15); // Top 15 providers
  }, [data, goalPercent]);

  const getColor = (percent: number) => {
    if (percent >= goalPercent) return '#10b981'; // green - goal achieved
    if (percent >= goalPercent * 0.75) return '#f59e0b'; // amber - close
    return '#ef4444'; // red - needs work
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available for goal progress chart</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="provider" 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: '% Over 20 Min', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)', 
              border: '1px solid var(--tooltip-border, #e5e7eb)', 
              borderRadius: '8px',
              color: 'var(--tooltip-text, #000)'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'percentOver20Min') {
                return [`${value.toFixed(1)}%`, 'Current %'];
              }
              if (name === 'goal') {
                return [`${value}%`, 'Goal'];
              }
              return [value, name];
            }}
          />
          <ReferenceLine 
            y={goalPercent} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            label={{ value: `${goalPercent}% Goal`, position: 'right' }}
          />
          <Bar dataKey="percentOver20Min" name="Current %">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentOver20Min)} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Goal Achieved (≥{goalPercent}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span>Close (≥{goalPercent * 0.75}%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Needs Work (&lt;{goalPercent * 0.75}%)</span>
        </div>
      </div>
    </div>
  );
}

