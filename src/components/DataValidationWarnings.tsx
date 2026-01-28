import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { validateData, ValidationWarning } from '../utils/dataValidation';
import { AlertTriangle, X } from 'lucide-react';

interface DataValidationWarningsProps {
  data: ProviderWeekData[];
  onDismiss?: (warningId: string) => void;
  dismissedWarnings?: Set<string>;
}

export function DataValidationWarnings({ data, onDismiss, dismissedWarnings = new Set() }: DataValidationWarningsProps) {
  const warnings = useMemo(() => {
    return validateData(data);
  }, [data]);

  const visibleWarnings = warnings.filter(w => {
    const id = `${w.type}-${w.provider || ''}-${w.week || ''}`;
    return !dismissedWarnings.has(id);
  });

  if (visibleWarnings.length === 0) {
    return null;
  }

  const highSeverity = visibleWarnings.filter(w => w.severity === 'high');
  const mediumSeverity = visibleWarnings.filter(w => w.severity === 'medium');
  const lowSeverity = visibleWarnings.filter(w => w.severity === 'low');

  const getSeverityColor = (severity: ValidationWarning['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border-2 border-amber-200 dark:border-amber-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Validation Warnings</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          {highSeverity.length > 0 && <span className="text-red-600 dark:text-red-400">{highSeverity.length} High</span>}
          {mediumSeverity.length > 0 && <span className="text-amber-600 dark:text-amber-400">{mediumSeverity.length} Medium</span>}
          {lowSeverity.length > 0 && <span className="text-blue-600 dark:text-blue-400">{lowSeverity.length} Low</span>}
        </div>
      </div>

      <div className="space-y-2">
        {visibleWarnings.slice(0, 5).map((warning, index) => {
          const id = `${warning.type}-${warning.provider || ''}-${warning.week || ''}`;
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-2 ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                      warning.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                      warning.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                    }`}>
                      {warning.severity.toUpperCase()}
                    </span>
                    {warning.provider && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">{warning.provider}</span>
                    )}
                    {warning.week && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">Week: {warning.week}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white">{warning.message}</p>
                </div>
                {onDismiss && (
                  <button
                    onClick={() => onDismiss(id)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Dismiss warning"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {visibleWarnings.length > 5 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Showing 5 of {visibleWarnings.length} warnings
        </p>
      )}
    </div>
  );
}

