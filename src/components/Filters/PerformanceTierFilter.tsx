import { useMemo } from 'react';
import { ProviderWeekData } from '../../types';

interface PerformanceTierFilterProps {
  data: ProviderWeekData[];
  selectedTier: string | null;
  onTierChange: (tier: string | null) => void;
}

export function PerformanceTierFilter({ data, selectedTier, onTierChange }: PerformanceTierFilterProps) {
  const tiers = useMemo(() => {
    if (data.length === 0) return [];

    // Calculate average % Over 20 Min for each provider
    const providerStats = new Map<string, { totalVisits: number; visitsOver20: number }>();
    
    data.forEach(item => {
      const existing = providerStats.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20 += item.visitsOver20Min;
      } else {
        providerStats.set(item.provider, {
          totalVisits: item.totalVisits,
          visitsOver20: item.visitsOver20Min,
        });
      }
    });

    const percentages = Array.from(providerStats.values())
      .map(stat => stat.totalVisits > 0 ? (stat.visitsOver20 / stat.totalVisits) * 100 : 0)
      .filter(p => p > 0)
      .sort((a, b) => a - b);

    if (percentages.length === 0) return [];

    const median = percentages[Math.floor(percentages.length / 2)];
    const topQuartile = percentages[Math.floor(percentages.length * 0.75)];
    const bottomQuartile = percentages[Math.floor(percentages.length * 0.25)];

    return {
      top25: topQuartile,
      bottom25: bottomQuartile,
      median,
    };
  }, [data]);

  const tierOptions = [
    { value: 'top25', label: 'Top 25%', description: `≥${tiers.top25?.toFixed(1) || 0}%` },
    { value: 'aboveAvg', label: 'Above Average', description: `≥${tiers.median?.toFixed(1) || 0}%` },
    { value: 'belowAvg', label: 'Below Average', description: `<${tiers.median?.toFixed(1) || 0}%` },
    { value: 'bottom25', label: 'Bottom 25%', description: `<${tiers.bottom25?.toFixed(1) || 0}%` },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Performance Tier
      </label>
      <select
        value={selectedTier || ''}
        onChange={(e) => onTierChange(e.target.value || null)}
        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Tiers</option>
        {tierOptions.map(tier => (
          <option key={tier.value} value={tier.value}>
            {tier.label} ({tier.description})
          </option>
        ))}
      </select>
    </div>
  );
}

