import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart as RechartsAreaChart } from 'recharts';
import { MetricType } from '../../types';

interface AreaChartDataPoint {
  week: string;
  [provider: string]: string | number | null;
}

interface AreaChartProps {
  data: AreaChartDataPoint[];
  selectedMetric: MetricType;
  selectedProviders: string[];
  allProviders: string[];
}

const metricLabels: Record<MetricType, string> = {
  totalVisits: 'Total Visits',
  percentOver20Min: '% Over 20 Min',
};

const colors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
];

export function AreaChart({ data, selectedMetric, selectedProviders, allProviders }: AreaChartProps) {
  const providersToShow = selectedProviders.length > 0 ? selectedProviders : allProviders.slice(0, 8);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            {providersToShow.map((provider, index) => (
              <linearGradient key={provider} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.1}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis 
            dataKey="week" 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            className="dark:stroke-gray-400"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ value: metricLabels[selectedMetric], angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)', 
              border: '1px solid var(--tooltip-border, #e5e7eb)', 
              borderRadius: '8px', 
              padding: '8px',
              color: 'var(--tooltip-text, #000)'
            }}
            formatter={(value: string | number, name: string) => {
              let formatted = '';
              if (selectedMetric === 'percentOver20Min') {
                formatted = `${Number(value).toFixed(1)}%`;
              } else {
                formatted = Number(value).toLocaleString();
              }
              return [formatted, name];
            }}
            labelFormatter={(label) => `Week: ${label}`}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {providersToShow.map((provider, index) => (
            <Area
              key={provider}
              type="monotone"
              dataKey={provider}
              stroke={colors[index % colors.length]}
              fill={`url(#color${index})`}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

