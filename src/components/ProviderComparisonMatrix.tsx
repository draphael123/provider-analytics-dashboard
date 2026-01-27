import { useMemo } from 'react';
import { ProviderWeekData } from '../types';

interface ProviderComparisonMatrixProps {
  data: ProviderWeekData[];
  selectedProviders: string[];
}

interface ProviderStats {
  provider: string;
  totalVisits: number;
  visitsOver20Min: number;
  percentOver20Min: number;
  weeks: number;
}

export function ProviderComparisonMatrix({ data, selectedProviders, onProvidersChange }: ProviderComparisonMatrixProps) {
  const comparisonData = useMemo(() => {
    const statsMap = new Map<string, ProviderStats>();

    data.forEach(item => {
      if (selectedProviders.includes(item.provider)) {
        const existing = statsMap.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20Min += item.visitsOver20Min;
        existing.weeks += 1;
      } else {
        statsMap.set(item.provider, {
          provider: item.provider,
          totalVisits: item.totalVisits,
          visitsOver20Min: item.visitsOver20Min,
          percentOver20Min: item.percentOver20Min,
          weeks: 1,
        });
      }
      }
    });

    return Array.from(statsMap.values()).map(stat => ({
      ...stat,
      percentOver20Min: stat.totalVisits > 0 
        ? (stat.visitsOver20Min / stat.totalVisits) * 100 
        : 0,
    }));
  }, [data, selectedProviders]);

  if (selectedProviders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Select 2-4 providers to compare</p>
      </div>
    );
  }

  if (selectedProviders.length > 4) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Please select 4 or fewer providers for comparison</p>
      </div>
    );
  }

  const maxValues = useMemo(() => {
    return {
      totalVisits: Math.max(...comparisonData.map(d => d.totalVisits), 1),
      percentOver20Min: Math.max(...comparisonData.map(d => d.percentOver20Min), 1),
    };
  }, [comparisonData]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Provider Comparison Matrix</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonData.map((stat) => (
          <div key={stat.provider} className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">{stat.provider}</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Total Visits</span>
                  <span className="font-medium">{stat.totalVisits.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(stat.totalVisits / maxValues.totalVisits) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>% Over 20 Min</span>
                  <span className="font-medium">{stat.percentOver20Min.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stat.percentOver20Min >= 20 ? 'bg-green-600' :
                      stat.percentOver20Min >= 10 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (stat.percentOver20Min / maxValues.percentOver20Min) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  <div>Over 20 Min: {stat.visitsOver20Min.toLocaleString()}</div>
                  <div>Weeks: {stat.weeks}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

