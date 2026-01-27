import { ProviderWeekData, SummaryStats } from '../types';
import { sortWeeks, normalizeWeekLabel } from './dataTransformer';

export function calculateSummaryStats(
  data: ProviderWeekData[],
  previousPeriodData?: ProviderWeekData[]
): SummaryStats {
  if (data.length === 0) {
    return {
      totalProviders: 0,
      avgPercentOver20Min: 0,
      totalVisits: 0,
      trend: 'neutral',
      trendValue: 0,
    };
  }

  const uniqueProviders = new Set(data.map(d => d.provider));
  const totalProviders = uniqueProviders.size;
  
  const totalVisits = data.reduce((sum, d) => sum + d.totalVisits, 0);
  const avgPercentOver20Min = data.reduce((sum, d) => sum + d.percentOver20Min, 0) / data.length;
  
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let trendValue = 0;
  
  if (previousPeriodData && previousPeriodData.length > 0) {
    const prevAvgPercent = previousPeriodData.reduce((sum, d) => sum + d.percentOver20Min, 0) / previousPeriodData.length;
    trendValue = avgPercentOver20Min - prevAvgPercent;
    trend = trendValue > 0.5 ? 'up' : trendValue < -0.5 ? 'down' : 'neutral';
  }
  
  return {
    totalProviders,
    avgPercentOver20Min: Math.round(avgPercentOver20Min * 10) / 10,
    totalVisits,
    trend,
    trendValue: Math.round(trendValue * 10) / 10,
  };
}

export function filterData(
  data: ProviderWeekData[],
  filters: {
    selectedProviders: string[];
    weekRange: [string, string] | null;
    thresholdPercent: number | null;
  }
): ProviderWeekData[] {
  return data.filter(item => {
    // Provider filter
    if (filters.selectedProviders.length > 0 && !filters.selectedProviders.includes(item.provider)) {
      return false;
    }
    
    // Week range filter
    if (filters.weekRange) {
      const [startWeek, endWeek] = filters.weekRange;
      const itemWeek = normalizeWeekLabel(item.week);
      
      // Use sorted weeks to determine if item is in range
      // This handles year boundaries correctly
      const allWeeks = sortWeeks([startWeek, endWeek, itemWeek]);
      const startIndex = allWeeks.indexOf(startWeek);
      const endIndex = allWeeks.indexOf(endWeek);
      const itemIndex = allWeeks.indexOf(itemWeek);
      
      // Item must be between start and end (inclusive)
      if (itemIndex < startIndex || itemIndex > endIndex) {
        return false;
      }
    }
    
    // Threshold filter
    if (filters.thresholdPercent !== null && item.percentOver20Min < filters.thresholdPercent) {
      return false;
    }
    
    return true;
  });
}


