import { ProviderWeekData } from '../types';

export interface StatisticalSummary {
  provider?: string;
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min';
  mean: number;
  median: number;
  mode: number | null;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  q1: number; // First quartile
  q3: number; // Third quartile
  iqr: number; // Interquartile range
  outliers: number[];
  skewness: number;
  kurtosis: number;
}

export interface Correlation {
  metric1: string;
  metric2: string;
  coefficient: number; // -1 to 1
  strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  interpretation: string;
}

export function calculateStatistics(
  data: ProviderWeekData[],
  metric: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min',
  provider?: string
): StatisticalSummary {
  const filteredData = provider 
    ? data.filter(d => d.provider === provider)
    : data;
  
  const values = filteredData.map(d => d[metric]).sort((a, b) => a - b);
  
  if (values.length === 0) {
    return {
      provider,
      metric,
      mean: 0,
      median: 0,
      mode: null,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      outliers: [],
      skewness: 0,
      kurtosis: 0,
    };
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const median = values.length % 2 === 0
    ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
    : values[Math.floor(values.length / 2)];
  
  // Mode (most frequent value, rounded to nearest integer for counts)
  const roundedValues = values.map(v => Math.round(v));
  const frequency = new Map<number, number>();
  roundedValues.forEach(v => {
    frequency.set(v, (frequency.get(v) || 0) + 1);
  });
  let mode: number | null = null;
  let maxFreq = 0;
  frequency.forEach((freq, value) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = value;
    }
  });
  if (maxFreq === 1) mode = null; // No mode if all values are unique

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const min = values[0];
  const max = values[values.length - 1];
  
  const q1Index = Math.floor(values.length * 0.25);
  const q3Index = Math.floor(values.length * 0.75);
  const q1 = values[q1Index];
  const q3 = values[q3Index];
  const iqr = q3 - q1;

  // Outliers (beyond 1.5 * IQR from Q1 or Q3)
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = values.filter(v => v < lowerBound || v > upperBound);

  // Skewness
  const skewness = values.reduce((sum, v) => {
    return sum + Math.pow((v - mean) / stdDev, 3);
  }, 0) / values.length;

  // Kurtosis
  const kurtosis = values.reduce((sum, v) => {
    return sum + Math.pow((v - mean) / stdDev, 4);
  }, 0) / values.length - 3; // Excess kurtosis

  return {
    provider,
    metric,
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    mode,
    stdDev: Math.round(stdDev * 100) / 100,
    variance: Math.round(variance * 100) / 100,
    min,
    max,
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    iqr: Math.round(iqr * 100) / 100,
    outliers,
    skewness: Math.round(skewness * 100) / 100,
    kurtosis: Math.round(kurtosis * 100) / 100,
  };
}

export function calculateCorrelation(
  data: ProviderWeekData[],
  metric1: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min',
  metric2: 'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'
): Correlation {
  if (data.length < 2) {
    return {
      metric1,
      metric2,
      coefficient: 0,
      strength: 'very_weak',
      interpretation: 'Insufficient data for correlation analysis',
    };
  }

  const values1 = data.map(d => d[metric1]);
  const values2 = data.map(d => d[metric2]);

  const mean1 = values1.reduce((sum, v) => sum + v, 0) / values1.length;
  const mean2 = values2.reduce((sum, v) => sum + v, 0) / values2.length;

  let numerator = 0;
  let sumSq1 = 0;
  let sumSq2 = 0;

  for (let i = 0; i < data.length; i++) {
    const diff1 = values1[i] - mean1;
    const diff2 = values2[i] - mean2;
    numerator += diff1 * diff2;
    sumSq1 += diff1 * diff1;
    sumSq2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(sumSq1 * sumSq2);
  const coefficient = denominator > 0 ? numerator / denominator : 0;

  const absCoeff = Math.abs(coefficient);
  let strength: 'very_strong' | 'strong' | 'moderate' | 'weak' | 'very_weak';
  let interpretation: string;

  if (absCoeff >= 0.9) {
    strength = 'very_strong';
    interpretation = 'Very strong correlation';
  } else if (absCoeff >= 0.7) {
    strength = 'strong';
    interpretation = 'Strong correlation';
  } else if (absCoeff >= 0.5) {
    strength = 'moderate';
    interpretation = 'Moderate correlation';
  } else if (absCoeff >= 0.3) {
    strength = 'weak';
    interpretation = 'Weak correlation';
  } else {
    strength = 'very_weak';
    interpretation = 'Very weak or no correlation';
  }

  if (coefficient > 0) {
    interpretation += ' (positive relationship)';
  } else if (coefficient < 0) {
    interpretation += ' (negative relationship)';
  } else {
    interpretation += ' (no linear relationship)';
  }

  return {
    metric1,
    metric2,
    coefficient: Math.round(coefficient * 1000) / 1000,
    strength,
    interpretation,
  };
}

export function calculateAllCorrelations(data: ProviderWeekData[]): Correlation[] {
  const metrics: Array<'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'> = [
    'totalVisits',
    'visitsOver20Min',
    'percentOver20Min',
  ];

  const correlations: Correlation[] = [];
  
  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      correlations.push(calculateCorrelation(data, metrics[i], metrics[j]));
    }
  }

  return correlations;
}

