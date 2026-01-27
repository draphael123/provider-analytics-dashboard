import { MetricType } from '../../types';

interface MetricFilterProps {
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

const availableMetrics: { value: MetricType; label: string }[] = [
  { value: 'totalVisits', label: 'Total Visits' },
  { value: 'percentOver20Min', label: '% Over 20 Min' },
];

export function MetricFilter({ selectedMetrics, onMetricsChange }: MetricFilterProps) {
  const handleToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      onMetricsChange(selectedMetrics.filter(m => m !== metric));
    } else {
      onMetricsChange([...selectedMetrics, metric]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Metrics
      </label>
      <div className="space-y-2">
        {availableMetrics.map((metric) => (
          <label
            key={metric.value}
            className="flex items-center cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedMetrics.includes(metric.value)}
              onChange={() => handleToggle(metric.value)}
              className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{metric.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

