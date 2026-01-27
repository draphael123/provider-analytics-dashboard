import { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProviderWeekData } from '../types';

interface PerformanceDistributionProps {
  data: ProviderWeekData[];
}

export function PerformanceDistribution({ data }: PerformanceDistributionProps) {
  const distributionData = useMemo(() => {
    const providerStats = new Map<string, number>();
    
    data.forEach(item => {
      const existing = providerStats.get(item.provider);
      if (existing === undefined) {
        // Calculate average % over 20 min for this provider
        const providerData = data.filter(d => d.provider === item.provider);
        const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
        const visitsOver20 = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
        const avgPercent = totalVisits > 0 ? (visitsOver20 / totalVisits) * 100 : 0;
        providerStats.set(item.provider, avgPercent);
      }
    });

    // Create bins for histogram (0-5%, 5-10%, 10-15%, etc.)
    const bins = [
      { range: '0-5%', min: 0, max: 5, count: 0 },
      { range: '5-10%', min: 5, max: 10, count: 0 },
      { range: '10-15%', min: 10, max: 15, count: 0 },
      { range: '15-20%', min: 15, max: 20, count: 0 },
      { range: '20-25%', min: 20, max: 25, count: 0 },
      { range: '25%+', min: 25, max: 100, count: 0 },
    ];

    providerStats.forEach(percent => {
      for (const bin of bins) {
        if (percent >= bin.min && percent < bin.max) {
          bin.count++;
          break;
        }
      }
    });

    return bins;
  }, [data]);

  const stats = useMemo(() => {
    const percents = Array.from(
      new Map(
        data.map(item => [item.provider, item])
      ).values()
    ).map(item => {
      const providerData = data.filter(d => d.provider === item.provider);
      const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
      const visitsOver20 = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
      return totalVisits > 0 ? (visitsOver20 / totalVisits) * 100 : 0;
    });

    const sorted = [...percents].sort((a, b) => a - b);
    const avg = percents.reduce((sum, p) => sum + p, 0) / percents.length;
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const q1 = sorted[Math.floor(sorted.length * 0.25)] || 0;
    const q3 = sorted[Math.floor(sorted.length * 0.75)] || 0;

    return { avg, median, q1, q3, min: sorted[0] || 0, max: sorted[sorted.length - 1] || 0 };
  }, [data]);

  if (distributionData.every(bin => bin.count === 0)) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No data available for distribution</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
      <p className="text-sm text-gray-600 mb-4">Distribution of % Over 20 Minutes across all providers</p>
      
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={distributionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="range" 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              label={{ value: 'Number of Providers', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              formatter={(value: number) => [`${value} providers`, 'Count']}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Average</div>
          <div className="text-lg font-semibold text-gray-900">{stats.avg.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Median</div>
          <div className="text-lg font-semibold text-gray-900">{stats.median.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Range</div>
          <div className="text-lg font-semibold text-gray-900">{stats.min.toFixed(1)}% - {stats.max.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Q1 (25th percentile)</div>
          <div className="text-lg font-semibold text-gray-900">{stats.q1.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Q3 (75th percentile)</div>
          <div className="text-lg font-semibold text-gray-900">{stats.q3.toFixed(1)}%</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-gray-600 text-xs">Total Providers</div>
          <div className="text-lg font-semibold text-gray-900">{distributionData.reduce((sum, bin) => sum + bin.count, 0)}</div>
        </div>
      </div>
    </div>
  );
}

