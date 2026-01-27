import { useMemo } from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ProviderWeekData } from '../../types';

interface PieChartProps {
  data: ProviderWeekData[];
}

export function PieChart({ data }: PieChartProps) {
  const pieData = useMemo(() => {
    // Categorize providers by performance tier
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

    // Categorize
    let excellent = 0;
    let good = 0;
    let needsImprovement = 0;

    providerStats.forEach((stat) => {
      if (stat.percentOver20 >= 20) {
        excellent++;
      } else if (stat.percentOver20 >= 10) {
        good++;
      } else {
        needsImprovement++;
      }
    });

    return [
      { name: 'Excellent (≥20%)', value: excellent, color: '#10b981' },
      { name: 'Good (10-20%)', value: good, color: '#f59e0b' },
      { name: 'Needs Improvement (<10%)', value: needsImprovement, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [data]);

  if (pieData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No data available for pie chart</p>
      </div>
    );
  }

  const total = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--tooltip-bg, #fff)', 
              border: '1px solid var(--tooltip-border, #e5e7eb)', 
              borderRadius: '8px',
              color: 'var(--tooltip-text, #000)'
            }}
            formatter={(value: number) => [`${value} providers (${((value / total) * 100).toFixed(1)}%)`, 'Count']}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

