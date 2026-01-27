import { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProviderWeekData } from '../../types';

interface StackedBarChartProps {
  data: ProviderWeekData[];
}

export function StackedBarChart({ data }: StackedBarChartProps) {
  const chartData = useMemo(() => {
    // Get the most recent week
    const weeks = Array.from(new Set(data.map(d => d.week))).sort();
    const latestWeek = weeks[weeks.length - 1];
    
    const providers = Array.from(new Set(data.map(d => d.provider)));
    
    return providers.map(provider => {
      const providerWeekData = data.find(
        d => d.provider === provider && d.week === latestWeek
      );
      
      if (!providerWeekData) {
        return {
          provider,
          visitsUnder20: 0,
          visitsOver20: 0,
        };
      }
      
      return {
        provider,
        visitsUnder20: providerWeekData.totalVisits - providerWeekData.visitsOver20Min,
        visitsOver20: providerWeekData.visitsOver20Min,
      };
    }).sort((a, b) => (b.visitsUnder20 + b.visitsOver20) - (a.visitsUnder20 + a.visitsOver20));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available for stacked bar chart</p>
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
            label={{ value: 'Total Visits', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)', 
              border: '1px solid var(--tooltip-border, #e5e7eb)', 
              borderRadius: '8px',
              color: 'var(--tooltip-text, #000)'
            }}
            formatter={(value: number) => value.toLocaleString()}
          />
          <Legend />
          <Bar dataKey="visitsUnder20" stackId="a" fill="#94a3b8" name="Visits Under 20 Min" />
          <Bar dataKey="visitsOver20" stackId="a" fill="#10b981" name="Visits Over 20 Min" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

