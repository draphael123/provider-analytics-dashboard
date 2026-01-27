import { MetricType } from '../../types';

interface ChartControlsProps {
  selectedMetric: MetricType;
  onMetricChange: (metric: MetricType) => void;
}

const metrics: { value: MetricType; label: string }[] = [
  { value: 'totalVisits', label: 'Total Visits' },
  { value: 'percentOver20Min', label: '% Over 20 Min' },
  { value: 'avgDuration', label: 'Avg Duration' },
];

export function ChartControls({ selectedMetric, onMetricChange }: ChartControlsProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <span className="text-sm font-medium text-gray-700">Metric:</span>
      <div className="flex gap-2">
        {metrics.map((metric) => (
          <button
            key={metric.value}
            onClick={() => onMetricChange(metric.value)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedMetric === metric.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
    </div>
  );
}

