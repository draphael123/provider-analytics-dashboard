import { useMemo, useState } from 'react';
import { ProviderWeekData } from '../types';
import { CheckCircle, Circle, AlertCircle, Lightbulb, X } from 'lucide-react';
import { calculatePerformanceScore } from '../utils/performanceScoring';
import { detectAnomalies } from '../utils/anomalyDetection';

interface ActionItem {
  id: string;
  provider: string;
  type: 'improvement' | 'anomaly' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  completed: boolean;
  createdAt: string;
}

interface ActionItemsProps {
  data: ProviderWeekData[];
}

export function ActionItems({ data }: ActionItemsProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const actionItems = useMemo(() => {
    const items: ActionItem[] = [];
    const providers = Array.from(new Set(data.map(d => d.provider)));

    // Generate recommendations based on performance scores
    const scores = providers.map(provider => calculatePerformanceScore(provider, data));
    const lowPerformers = scores.filter(s => s.score < 60).sort((a, b) => a.score - b.score);

    lowPerformers.forEach(score => {
      const providerData = data.filter(d => d.provider === score.provider);
      const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
      const visitsOver20 = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
      const percent = totalVisits > 0 ? (visitsOver20 / totalVisits) * 100 : 0;

      items.push({
        id: `improvement-${score.provider}`,
        provider: score.provider,
        type: 'improvement',
        priority: score.score < 40 ? 'high' : 'medium',
        title: `Improve Performance: ${score.provider}`,
        description: `Current performance score: ${score.score}/100 (Grade: ${score.grade}). ${percent.toFixed(1)}% of visits exceed 20 minutes. Consider additional training or process improvements.`,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Detect anomalies
    const anomalies = detectAnomalies(data);
    const highPriorityAnomalies = anomalies.filter(a => a.severity === 'high').slice(0, 5);

    highPriorityAnomalies.forEach(anomaly => {
      items.push({
        id: `anomaly-${anomaly.provider}-${anomaly.week}`,
        provider: anomaly.provider,
        type: 'anomaly',
        priority: anomaly.severity === 'high' ? 'high' : anomaly.severity === 'medium' ? 'medium' : 'low',
        title: `Anomaly Detected: ${anomaly.provider}`,
        description: `${anomaly.description} in week ${anomaly.week}.`,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    });

    // Generate general recommendations
    const avgPercent = data.reduce((sum, d) => sum + d.percentOver20Min, 0) / data.length;
    if (avgPercent > 15) {
      items.push({
        id: 'recommendation-team-average',
        provider: 'Team',
        type: 'recommendation',
        priority: 'medium',
        title: 'Team Average Above Target',
        description: `Team average is ${avgPercent.toFixed(1)}% visits over 20 minutes. Consider team-wide training or process review.`,
        completed: false,
        createdAt: new Date().toISOString(),
      });
    }

    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [data]);

  const toggleCompleted = (id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const visibleItems = actionItems.filter(item => !completedItems.has(item.id));
  const completedCount = completedItems.size;

  if (actionItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Action Items & Recommendations</h3>
        <p className="text-gray-500 dark:text-gray-400">No action items at this time. Great job!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Items & Recommendations</h3>
        {completedCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedCount} completed
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleItems.map(item => {
          const Icon = item.type === 'improvement' ? AlertCircle :
                      item.type === 'anomaly' ? AlertCircle :
                      Lightbulb;
          
          const priorityColors = {
            high: 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
            medium: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20',
            low: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
          };

          return (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-2 ${priorityColors[item.priority]} transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  item.priority === 'high' ? 'bg-red-500' :
                  item.priority === 'medium' ? 'bg-amber-500' :
                  'bg-blue-500'
                } text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          item.priority === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                        }`}>
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{item.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Provider: {item.provider}</p>
                    </div>
                    <button
                      onClick={() => toggleCompleted(item.id)}
                      className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                      aria-label="Mark as completed"
                    >
                      <Circle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount > 0 && (
        <details className="mt-4">
          <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200">
            Show {completedCount} completed item{completedCount !== 1 ? 's' : ''}
          </summary>
          <div className="mt-2 space-y-2">
            {actionItems
              .filter(item => completedItems.has(item.id))
              .map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400 line-through">{item.title}</span>
                    <button
                      onClick={() => toggleCompleted(item.id)}
                      className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      aria-label="Unmark as completed"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </details>
      )}
    </div>
  );
}

