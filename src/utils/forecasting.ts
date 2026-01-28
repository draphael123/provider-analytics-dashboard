import { ProviderWeekData } from '../types';

export interface Forecast {
  provider: string;
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min';
  nextWeek: number;
  nextTwoWeeks: number;
  nextMonth: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: 'high' | 'medium' | 'low';
  method: 'linear' | 'moving_average' | 'exponential';
}

function linearRegression(data: number[]): { slope: number; intercept: number } {
  const n = data.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = data.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}

function movingAverage(data: number[], window: number): number {
  if (data.length < window) return data[data.length - 1] || 0;
  const recent = data.slice(-window);
  return recent.reduce((sum, v) => sum + v, 0) / recent.length;
}

function exponentialSmoothing(data: number[], alpha: number = 0.3): number {
  if (data.length === 0) return 0;
  if (data.length === 1) return data[0];
  
  let forecast = data[0];
  for (let i = 1; i < data.length; i++) {
    forecast = alpha * data[i] + (1 - alpha) * forecast;
  }
  return forecast;
}

export function forecastProvider(
  provider: string,
  data: ProviderWeekData[],
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'
): Forecast {
  const providerData = data.filter(d => d.provider === provider);
  
  if (providerData.length === 0) {
    return {
      provider,
      metric,
      nextWeek: 0,
      nextTwoWeeks: 0,
      nextMonth: 0,
      trend: 'stable',
      confidence: 'low',
      method: 'linear',
    };
  }

  // Sort by week chronologically
  const sorted = [...providerData].sort((a, b) => {
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

  const values = sorted.map(d => d[metric]);
  
  if (values.length < 2) {
    const lastValue = values[0] || 0;
    return {
      provider,
      metric,
      nextWeek: lastValue,
      nextTwoWeeks: lastValue,
      nextMonth: lastValue,
      trend: 'stable',
      confidence: 'low',
      method: 'moving_average',
    };
  }

  // Try multiple methods and use the most appropriate
  const linear = linearRegression(values);
  const ma = movingAverage(values, Math.min(4, values.length));
  const exp = exponentialSmoothing(values);

  // Use linear regression if we have enough data points
  let method: 'linear' | 'moving_average' | 'exponential' = 'linear';
  let nextWeek: number;
  let nextTwoWeeks: number;
  let nextMonth: number;

  if (values.length >= 4) {
    method = 'linear';
    const n = values.length;
    nextWeek = linear.slope * n + linear.intercept;
    nextTwoWeeks = linear.slope * (n + 1) + linear.intercept;
    nextMonth = linear.slope * (n + 3) + linear.intercept;
  } else {
    method = 'moving_average';
    nextWeek = ma;
    nextTwoWeeks = ma;
    nextMonth = ma;
  }

  // Determine trend
  const recentTrend = values.length >= 2 
    ? values[values.length - 1] - values[values.length - 2]
    : 0;
  const trend: 'increasing' | 'decreasing' | 'stable' = 
    recentTrend > 0.1 ? 'increasing' : 
    recentTrend < -0.1 ? 'decreasing' : 
    'stable';

  // Calculate confidence based on data quality
  const variance = values.reduce((sum, v, i) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return sum + Math.pow(v - mean, 2);
  }, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
  
  const confidence: 'high' | 'medium' | 'low' = 
    values.length >= 8 && coefficientOfVariation < 0.2 ? 'high' :
    values.length >= 4 && coefficientOfVariation < 0.4 ? 'medium' :
    'low';

  // Ensure non-negative values for counts
  if (metric !== 'percentOver20Min') {
    nextWeek = Math.max(0, nextWeek);
    nextTwoWeeks = Math.max(0, nextTwoWeeks);
    nextMonth = Math.max(0, nextMonth);
  }

  return {
    provider,
    metric,
    nextWeek: Math.round(nextWeek * 10) / 10,
    nextTwoWeeks: Math.round(nextTwoWeeks * 10) / 10,
    nextMonth: Math.round(nextMonth * 10) / 10,
    trend,
    confidence,
    method,
  };
}

export function forecastAllProviders(
  data: ProviderWeekData[],
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min' = 'percentOver20Min'
): Forecast[] {
  const providers = Array.from(new Set(data.map(d => d.provider)));
  return providers.map(provider => forecastProvider(provider, data, metric));
}

