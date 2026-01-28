import { ProviderWeekData } from '../types';

export interface ValidationWarning {
  type: 'missing_data' | 'suspicious_value' | 'inconsistency' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  message: string;
  provider?: string;
  week?: string;
}

export function validateData(data: ProviderWeekData[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  if (data.length === 0) {
    warnings.push({
      type: 'missing_data',
      severity: 'high',
      message: 'No data available',
    });
    return warnings;
  }

  // Check for missing or zero values
  data.forEach(item => {
    if (item.totalVisits === 0 && item.visitsOver20Min > 0) {
      warnings.push({
        type: 'inconsistency',
        severity: 'high',
        message: `Provider ${item.provider} has visits over 20 minutes but zero total visits in week ${item.week}`,
        provider: item.provider,
        week: item.week,
      });
    }

    if (item.totalVisits > 0 && item.visitsOver20Min > item.totalVisits) {
      warnings.push({
        type: 'inconsistency',
        severity: 'high',
        message: `Provider ${item.provider} has more visits over 20 minutes than total visits in week ${item.week}`,
        provider: item.provider,
        week: item.week,
      });
    }

    // Check for suspiciously high percentages
    if (item.percentOver20Min > 100) {
      warnings.push({
        type: 'suspicious_value',
        severity: 'high',
        message: `Provider ${item.provider} has percentage over 100% in week ${item.week}`,
        provider: item.provider,
        week: item.week,
      });
    }

    // Check for unusually high visit counts (potential data entry error)
    if (item.totalVisits > 10000) {
      warnings.push({
        type: 'suspicious_value',
        severity: 'medium',
        message: `Provider ${item.provider} has unusually high visit count (${item.totalVisits}) in week ${item.week}`,
        provider: item.provider,
        week: item.week,
      });
    }
  });

  // Check for missing weeks for providers
  const providers = Array.from(new Set(data.map(d => d.provider)));
  const weeks = Array.from(new Set(data.map(d => d.week)));

  providers.forEach(provider => {
    const providerWeeks = data.filter(d => d.provider === provider).map(d => d.week);
    const missingWeeks = weeks.filter(w => !providerWeeks.includes(w));
    
    if (missingWeeks.length > 0 && missingWeeks.length < weeks.length / 2) {
      warnings.push({
        type: 'missing_data',
        severity: 'low',
        message: `Provider ${provider} is missing data for ${missingWeeks.length} week(s)`,
        provider,
      });
    }
  });

  return warnings.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

