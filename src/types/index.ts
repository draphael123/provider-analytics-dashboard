export interface ProviderWeekData {
  provider: string;
  week: string; // e.g., "Week of 11/1"
  totalVisits: number;
  visitsOver20Min: number;
  percentOver20Min: number;
  hoursOn20PlusMin?: number;
}

export interface FilterState {
  selectedProviders: string[];
  weekRange: [string, string] | null;
  selectedMetrics: string[];
  thresholdPercent: number | null;
}

export type MetricType = 'totalVisits' | 'percentOver20Min';

export interface SummaryStats {
  totalProviders: number;
  avgPercentOver20Min: number;
  totalVisits: number;
  trend: 'up' | 'down' | 'neutral';
  trendValue: number;
}

