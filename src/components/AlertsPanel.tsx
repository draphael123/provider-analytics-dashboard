import { useState, useEffect, useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { Bell, X, Mail, Smartphone } from 'lucide-react';
import { detectAnomalies } from '../utils/anomalyDetection';

interface Alert {
  id: string;
  type: 'threshold' | 'anomaly' | 'trend';
  severity: 'high' | 'medium' | 'low';
  provider: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface AlertsPanelProps {
  data: ProviderWeekData[];
  thresholdPercent?: number;
}

const ALERTS_STORAGE_KEY = 'provider-analytics-alerts';

export function AlertsPanel({ data, thresholdPercent = 20 }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  const newAlerts = useMemo(() => {
    const alertsList: Alert[] = [];

    // Check for threshold violations
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

    providerStats.forEach((stats, provider) => {
      const percent = stats.totalVisits > 0 ? (stats.visitsOver20 / stats.totalVisits) * 100 : 0;
      if (percent > thresholdPercent && stats.totalVisits > 10) {
        alertsList.push({
          id: `threshold-${provider}-${Date.now()}`,
          type: 'threshold',
          severity: percent > thresholdPercent * 1.5 ? 'high' : 'medium',
          provider,
          message: `${provider} exceeds threshold: ${percent.toFixed(1)}% visits over 20 minutes (threshold: ${thresholdPercent}%)`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
        });
      }
    });

    // Check for anomalies
    const anomalies = detectAnomalies(data);
    anomalies.filter(a => a.severity === 'high' || a.severity === 'medium').forEach(anomaly => {
      alertsList.push({
        id: `anomaly-${anomaly.provider}-${anomaly.week}`,
        type: 'anomaly',
        severity: anomaly.severity,
        provider: anomaly.provider,
        message: `Anomaly detected: ${anomaly.description}`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    });

    return alertsList;
  }, [data, thresholdPercent]);

  useEffect(() => {
    // Merge new alerts with existing ones (avoid duplicates)
    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.id));
      const updated = [...prev, ...uniqueNewAlerts].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save alerts:', error);
        }
      }
      
      return updated;
    });
  }, [newAlerts]);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const unacknowledgedCount = unacknowledgedAlerts.length;

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, acknowledged: true } : a);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save alerts:', error);
        }
      }
      return updated;
    });
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => {
      const updated = prev.filter(a => a.id !== id);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save alerts:', error);
        }
      }
      return updated;
    });
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-full shadow-lg transition-all hover:scale-110"
        aria-label="View alerts"
      >
        <Bell className="h-6 w-6" />
        {unacknowledgedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-800 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-2">
              {unacknowledgedAlerts.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No unacknowledged alerts
                </p>
              ) : (
                <div className="space-y-2">
                  {unacknowledgedAlerts.map(alert => {
                    const severityColors = {
                      high: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
                      medium: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
                      low: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
                    };

                    return (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border-2 ${severityColors[alert.severity]} transition-all`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                alert.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                                alert.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                                'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                              }`}>
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{alert.provider}</span>
                            </div>
                            <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              aria-label="Acknowledge"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              aria-label="Delete"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Notification Preferences:</p>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </button>
                <button className="flex-1 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-1">
                  <Smartphone className="h-3 w-3" />
                  SMS
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Note: Email/SMS integration requires backend setup
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

