import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MetricType } from '../../types';

interface LineChartDataPoint {
  week: string;
  [provider: string]: string | number | null;
}

interface LineChartProps {
  data: LineChartDataPoint[];
  selectedMetric: MetricType;
  selectedProviders: string[];
  allProviders: string[];
  showBenchmarks?: boolean;
  benchmarkValues?: {
    average: number;
    median: number;
    topQuartile: number;
  };
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

export function LineChart({ data, selectedMetric, selectedProviders, allProviders, showBenchmarks = true, benchmarkValues }: LineChartProps) {
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
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}
            formatter={(value: string | number, name: string) => {
              let formatted = '';
              if (selectedMetric === 'percentOver20Min') {
                formatted = `${Number(value).toFixed(1)}%`;
              } else if (selectedMetric === 'avgDuration') {
                formatted = `${Number(value).toFixed(1)} min`;
              } else {
                formatted = Number(value).toLocaleString();
              }
              return [formatted, name];
            }}
            labelFormatter={(label) => `Week: ${label}`}
          />
          {showBenchmarks && benchmarkValues && (
            <>
              <ReferenceLine 
                y={benchmarkValues.average} 
                stroke="#3b82f6" 
                strokeDasharray="5 5" 
                label={{ value: `Avg: ${benchmarkValues.average.toFixed(1)}${selectedMetric === 'percentOver20Min' ? '%' : ''}`, position: 'right' }}
              />
              <ReferenceLine 
                y={benchmarkValues.median} 
                stroke="#10b981" 
                strokeDasharray="3 3" 
                label={{ value: `Median: ${benchmarkValues.median.toFixed(1)}${selectedMetric === 'percentOver20Min' ? '%' : ''}`, position: 'right' }}
              />
              <ReferenceLine 
                y={benchmarkValues.topQuartile} 
                stroke="#f59e0b" 
                strokeDasharray="2 2" 
                label={{ value: `Top 25%: ${benchmarkValues.topQuartile.toFixed(1)}${selectedMetric === 'percentOver20Min' ? '%' : ''}`, position: 'right' }}
              />
            </>
          )}
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
      {showBenchmarks && benchmarkValues && (
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }}></div>
            <span>Average</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-green-500" style={{ borderTop: '2px dashed #10b981' }}></div>
            <span>Median</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }}></div>
            <span>Top 25%</span>
          </div>
        </div>
      )}
    </div>
  );
}

