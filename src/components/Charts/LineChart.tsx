import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MetricType } from '../../types';
import { getUniqueProviders } from '../../utils/dataTransformer';

interface LineChartProps {
  data: any[];
  selectedMetric: MetricType;
  selectedProviders: string[];
  allProviders: string[];
}

const metricLabels: Record<MetricType, string> = {
  totalVisits: 'Total Visits',
  percentOver20Min: '% Over 20 Min',
  avgDuration: 'Avg Duration (min)',
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

export function LineChart({ data, selectedMetric, selectedProviders, allProviders }: LineChartProps) {
  const providersToShow = selectedProviders.length > 0 ? selectedProviders : allProviders.slice(0, 8);
  
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: metricLabels[selectedMetric], angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: any) => {
              if (selectedMetric === 'percentOver20Min') {
                return `${Number(value).toFixed(1)}%`;
              }
              if (selectedMetric === 'avgDuration') {
                return `${Number(value).toFixed(1)} min`;
              }
              return Number(value).toLocaleString();
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          {providersToShow.map((provider, index) => (
            <Line
              key={provider}
              type="monotone"
              dataKey={provider}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

