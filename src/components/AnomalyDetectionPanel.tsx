import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { detectAnomalies, Anomaly } from '../utils/anomalyDetection';
import { AlertTriangle, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface AnomalyDetectionPanelProps {
  data: ProviderWeekData[];
}

export function AnomalyDetectionPanel({ data }: AnomalyDetectionPanelProps) {
  const anomalies = useMemo(() => {
    return detectAnomalies(data);
  }, [data]);

  const getAnomalyIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'spike':
        return <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'drop':
        return <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'outlier':
        return <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getSeverityColor = (severity: Anomaly['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  if (anomalies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Anomaly Detection</h3>
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <AlertTriangle className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-200">
            No anomalies detected. All data points are within expected ranges.
          </p>
        </div>
      </div>
    );
  }

  const highSeverity = anomalies.filter(a => a.severity === 'high');
  const mediumSeverity = anomalies.filter(a => a.severity === 'medium');
  const lowSeverity = anomalies.filter(a => a.severity === 'low');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Anomaly Detection</h3>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-red-600 dark:text-red-400 font-medium">{highSeverity.length} High</span>
          <span className="text-amber-600 dark:text-amber-400 font-medium">{mediumSeverity.length} Medium</span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">{lowSeverity.length} Low</span>
        </div>
      </div>

      <div className="space-y-3">
        {anomalies.slice(0, 10).map((anomaly, index) => (
          <div
            key={`${anomaly.provider}-${anomaly.week}-${index}`}
            className={`p-4 rounded-lg border-2 ${getSeverityColor(anomaly.severity)} transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getAnomalyIcon(anomaly.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">{anomaly.provider}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Week: {anomaly.week}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    anomaly.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                    anomaly.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                  }`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{anomaly.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>Metric: {anomaly.metric}</span>
                  <span>Value: {anomaly.value.toFixed(anomaly.metric === 'percentOver20Min' ? 1 : 0)}{anomaly.metric === 'percentOver20Min' ? '%' : ''}</span>
                  <span>Expected: ~{anomaly.expectedValue.toFixed(anomaly.metric === 'percentOver20Min' ? 1 : 0)}{anomaly.metric === 'percentOver20Min' ? '%' : ''}</span>
                  <span>Deviation: {anomaly.deviation.toFixed(anomaly.metric === 'percentOver20Min' ? 1 : 0)}{anomaly.metric === 'percentOver20Min' ? '%' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {anomalies.length > 10 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
          Showing top 10 anomalies. Total: {anomalies.length}
        </p>
      )}
    </div>
  );
}

