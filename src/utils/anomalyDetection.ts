import { ProviderWeekData } from '../types';

export interface Anomaly {
  provider: string;
  week: string;
  type: 'spike' | 'drop' | 'outlier' | 'consistency';
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min';
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export function detectAnomalies(data: ProviderWeekData[]): Anomaly[] {
  const anomalies: Anomaly[] = [];

  if (data.length === 0) return anomalies;

  // Group by provider
  const providerData = new Map<string, ProviderWeekData[]>();
  data.forEach(item => {
    const existing = providerData.get(item.provider) || [];
    existing.push(item);
    providerData.set(item.provider, existing);
  });

  providerData.forEach((providerWeeks, provider) => {
    // Sort by week chronologically
    const sorted = [...providerWeeks].sort((a, b) => {
      const weekA = a.week.match(/(\d{1,2})\/(\d{1,2})/);
      const weekB = b.week.match(/(\d{1,2})\/(\d{1,2})/);
      if (!weekA || !weekB) return a.week.localeCompare(b.week);
      
      const monthA = parseInt(weekA[1]);
      const dayA = parseInt(weekA[2]);
      const monthB = parseInt(weekB[1]);
      const dayB = parseInt(weekB[2]);
      
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });

    if (sorted.length < 2) return;

    // Calculate statistics for each metric
    const metrics = ['totalVisits', 'visitsOver20Min', 'percentOver20Min'] as const;
    
    metrics.forEach(metric => {
      const values = sorted.map(d => d[metric]);
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Detect outliers (values beyond 2 standard deviations)
      sorted.forEach((weekData, _index) => {
        const value = weekData[metric];
        const deviation = Math.abs(value - mean);
        const zScore = stdDev > 0 ? deviation / stdDev : 0;

        if (zScore > 2) {
          const severity = zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low';
          const type = value > mean ? 'spike' : 'drop';
          
          anomalies.push({
            provider,
            week: weekData.week,
            type: type === 'spike' ? 'spike' : 'drop',
            metric,
            value,
            expectedValue: mean,
            deviation: deviation,
            severity,
            description: `${type === 'spike' ? 'Unusual spike' : 'Unusual drop'} in ${metric}: ${value.toFixed(metric === 'percentOver20Min' ? 1 : 0)}${metric === 'percentOver20Min' ? '%' : ''} (expected ~${mean.toFixed(metric === 'percentOver20Min' ? 1 : 0)}${metric === 'percentOver20Min' ? '%' : ''})`,
          });
        }
      });

      // Detect week-over-week spikes/drops (>50% change)
      for (let i = 1; i < sorted.length; i++) {
        const current = sorted[i][metric];
        const previous = sorted[i - 1][metric];
        
        if (previous > 0) {
          const change = Math.abs((current - previous) / previous);
          
          if (change > 0.5) {
            const type = current > previous ? 'spike' : 'drop';
            const severity = change > 1 ? 'high' : change > 0.75 ? 'medium' : 'low';
            
            anomalies.push({
              provider,
              week: sorted[i].week,
              type,
              metric,
              value: current,
              expectedValue: previous,
              deviation: Math.abs(current - previous),
              severity,
              description: `${type === 'spike' ? 'Significant increase' : 'Significant decrease'} in ${metric}: ${((current - previous) / previous * 100).toFixed(1)}% change from previous week`,
            });
          }
        }
      }
    });

    // Detect consistency issues (high variance)
    const percentValues = sorted.map(d => d.percentOver20Min);
    const percentMean = percentValues.reduce((sum, v) => sum + v, 0) / percentValues.length;
    const percentVariance = percentValues.reduce((sum, v) => sum + Math.pow(v - percentMean, 2), 0) / percentValues.length;
    const percentStdDev = Math.sqrt(percentVariance);
    const coefficientOfVariation = percentMean > 0 ? percentStdDev / percentMean : 0;

    if (coefficientOfVariation > 0.5 && sorted.length >= 4) {
      anomalies.push({
        provider,
        week: sorted[sorted.length - 1].week,
        type: 'consistency',
        metric: 'percentOver20Min',
        value: percentStdDev,
        expectedValue: percentMean * 0.2, // Expected std dev should be <20% of mean
        deviation: percentStdDev - (percentMean * 0.2),
        severity: coefficientOfVariation > 0.75 ? 'high' : 'medium',
        description: `High variability in performance: coefficient of variation is ${(coefficientOfVariation * 100).toFixed(1)}% (std dev: ${percentStdDev.toFixed(1)}%)`,
      });
    }
  });

  return anomalies.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}

