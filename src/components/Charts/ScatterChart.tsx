import { useMemo } from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { ProviderWeekData } from '../../types';

interface ScatterChartProps {
  data: ProviderWeekData[];
}

export function ScatterChart({ data }: ScatterChartProps) {
  const scatterData = useMemo(() => {
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

    return Array.from(providerStats.entries()).map(([provider, stats]) => {
      const percentOver20 = stats.totalVisits > 0 ? (stats.visitsOver20 / stats.totalVisits) * 100 : 0;
      return {
        provider,
        totalVisits: stats.totalVisits,
        percentOver20Min: parseFloat(percentOver20.toFixed(1)),
      };
    });
  }, [data]);

  const avgPercent = useMemo(() => {
    if (scatterData.length === 0) return 0;
    return scatterData.reduce((sum, d) => sum + d.percentOver20Min, 0) / scatterData.length;
  }, [scatterData]);

  const getColor = (percent: number) => {
    if (percent >= 20) return '#10b981'; // green
    if (percent >= 10) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  if (scatterData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available for scatter plot</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsScatterChart data={scatterData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            type="number"
            dataKey="totalVisits" 
            name="Total Visits"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: 'Total Visits', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="number"
            dataKey="percentOver20Min" 
            name="% Over 20 Min"
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: '% Over 20 Min', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)', 
              border: '1px solid var(--tooltip-border, #e5e7eb)', 
              borderRadius: '8px',
              color: 'var(--tooltip-text, #000)'
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === 'percentOver20Min') {
                return [`${value.toFixed(1)}%`, '% Over 20 Min'];
              }
              return [value.toLocaleString(), name];
            }}
            labelFormatter={(label, payload) => {
              if (payload && payload[0]) {
                return `Provider: ${payload[0].payload.provider}`;
              }
              return '';
            }}
          />
          <ReferenceLine 
            y={20} 
            stroke="#10b981" 
            strokeDasharray="5 5" 
            label={{ value: '20% Target', position: 'right' }}
          />
          <ReferenceLine 
            y={avgPercent} 
            stroke="#3b82f6" 
            strokeDasharray="3 3" 
            label={{ value: `Avg: ${avgPercent.toFixed(1)}%`, position: 'right' }}
          />
          <Scatter name="Providers" data={scatterData} fill="#3b82f6">
            {scatterData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.percentOver20Min)} />
            ))}
          </Scatter>
        </RechartsScatterChart>
      </ResponsiveContainer>
      <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>≥20%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span>10-20%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>&lt;10%</span>
        </div>
      </div>
    </div>
  );
}

