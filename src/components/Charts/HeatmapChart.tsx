import { useMemo } from 'react';
import { ProviderWeekData } from '../../types';
import { getUniqueProviders, getUniqueWeeks, sortWeeks } from '../../utils/dataTransformer';

interface HeatmapChartProps {
  data: ProviderWeekData[];
  selectedProviders?: string[];
}

export function HeatmapChart({ data, selectedProviders }: HeatmapChartProps) {
  const allProviders = useMemo(() => getUniqueProviders(data), [data]);
  const allWeeks = useMemo(() => sortWeeks(getUniqueWeeks(data)), [data]);
  
  const providersToShow = selectedProviders && selectedProviders.length > 0 
    ? selectedProviders 
    : allProviders;

  const heatmapData = useMemo(() => {
    const map = new Map<string, number>();
    
    data.forEach(item => {
      if (providersToShow.includes(item.provider)) {
        const key = `${item.provider}|${item.week}`;
        map.set(key, item.percentOver20Min);
      }
    });

    return map;
  }, [data, providersToShow]);

  const getColorIntensity = (value: number): string => {
    if (value === 0) return 'bg-gray-100';
    if (value < 5) return 'bg-red-200';
    if (value < 10) return 'bg-orange-300';
    if (value < 15) return 'bg-yellow-400';
    if (value < 20) return 'bg-green-400';
    return 'bg-green-600';
  };

  const getTextColor = (value: number): string => {
    if (value < 10) return 'text-gray-800';
    return 'text-white';
  };

  if (providersToShow.length === 0 || allWeeks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No data available for heatmap</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Heatmap</h3>
      <p className="text-sm text-gray-600 mb-4">% Over 20 Minutes by Provider and Week</p>
      
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Week headers */}
          <div className="flex">
            <div className="w-48 flex-shrink-0"></div>
            <div className="flex">
              {allWeeks.map(week => (
                <div
                  key={week}
                  className="w-24 flex-shrink-0 text-xs text-gray-600 font-medium px-2 py-1 border-b border-gray-200"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  {week.replace('Week of ', '')}
                </div>
              ))}
            </div>
          </div>

          {/* Provider rows */}
          <div className="divide-y divide-gray-200">
            {providersToShow.map(provider => (
              <div key={provider} className="flex hover:bg-gray-50">
                <div className="w-48 flex-shrink-0 px-3 py-2 text-sm font-medium text-gray-900 border-r border-gray-200">
                  {provider}
                </div>
                <div className="flex">
                  {allWeeks.map(week => {
                    const key = `${provider}|${week}`;
                    const value = heatmapData.get(key) || 0;
                    return (
                      <div
                        key={week}
                        className={`w-24 h-12 flex-shrink-0 flex items-center justify-center text-xs font-medium border-r border-b border-gray-200 ${getColorIntensity(value)} ${getTextColor(value)}`}
                        title={`${provider} - ${week}: ${value.toFixed(1)}%`}
                      >
                        {value > 0 ? `${value.toFixed(0)}%` : '—'}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs">
        <span className="text-gray-600">Legend:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300"></div>
          <span>0%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-200"></div>
          <span>&lt;5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-300"></div>
          <span>5-10%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400"></div>
          <span>10-15%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400"></div>
          <span>15-20%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-600"></div>
          <span>&gt;20%</span>
        </div>
      </div>
    </div>
  );
}

