import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartData {
  provider: string;
  totalVisits: number;
  visitsOver20Min: number;
  percentOver20Min: number;
}

interface BarChartProps {
  data: BarChartData[];
  selectedMetric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min';
}

const metricLabels: Record<string, string> = {
  totalVisits: 'Total Visits',
  visitsOver20Min: 'Visits Over 20 Min',
  percentOver20Min: '% Over 20 Min',
};

export function BarChart({ data, selectedMetric }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available for the selected filters</p>
      </div>
    );
  }

  // Sort data by selected metric
  const sortedData = [...data].sort((a, b) => b[selectedMetric] - a[selectedMetric]);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="provider" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            label={{ value: metricLabels[selectedMetric], angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
            formatter={(value: string | number) => {
              if (selectedMetric === 'percentOver20Min') {
                return `${Number(value).toFixed(1)}%`;
              }
              return Number(value).toLocaleString();
            }}
          />
                  <Legend />
                  <Bar dataKey="totalVisits" fill="#3b82f6" name="Total Visits" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="visitsOver20Min" fill="#10b981" name="Visits Over 20 Min" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="percentOver20Min" fill="#f59e0b" name="% Over 20 Min" radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

