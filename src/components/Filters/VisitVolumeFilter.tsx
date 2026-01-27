import { useMemo } from 'react';
import { ProviderWeekData } from '../../types';

interface VisitVolumeFilterProps {
  data: ProviderWeekData[];
  selectedVolume: string | null;
  onVolumeChange: (volume: string | null) => void;
}

export function VisitVolumeFilter({ data, selectedVolume, onVolumeChange }: VisitVolumeFilterProps) {
  const volumeThresholds = useMemo(() => {
    if (data.length === 0) return { low: 0, medium: 0, high: 0 };

    // Calculate total visits per provider
    const providerVisits = new Map<string, number>();
    data.forEach(item => {
      const existing = providerVisits.get(item.provider) || 0;
      providerVisits.set(item.provider, existing + item.totalVisits);
    });

    const visits = Array.from(providerVisits.values()).sort((a, b) => a - b);
    if (visits.length === 0) return { low: 0, medium: 0, high: 0 };

    const low = visits[Math.floor(visits.length * 0.33)];
    const medium = visits[Math.floor(visits.length * 0.67)];

    return { low, medium, high: visits[visits.length - 1] };
  }, [data]);

  const volumeOptions = [
    { value: 'high', label: 'High Volume', description: `≥${volumeThresholds.medium.toLocaleString()} visits` },
    { value: 'medium', label: 'Medium Volume', description: `${volumeThresholds.low.toLocaleString()}-${volumeThresholds.medium.toLocaleString()}` },
    { value: 'low', label: 'Low Volume', description: `<${volumeThresholds.low.toLocaleString()} visits` },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Visit Volume
      </label>
      <select
        value={selectedVolume || ''}
        onChange={(e) => onVolumeChange(e.target.value || null)}
        className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        <option value="">All Volumes</option>
        {volumeOptions.map(volume => (
          <option key={volume.value} value={volume.value}>
            {volume.label} ({volume.description})
          </option>
        ))}
      </select>
    </div>
  );
}

