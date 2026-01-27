import { ProviderWeekData, SummaryStats } from '../types';

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
      const weeks = sortWeeks([startWeek, endWeek, itemWeek]);
      if (weeks[0] !== startWeek || weeks[2] !== endWeek) {
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

function normalizeWeekLabel(week: string): string {
  const match = week.match(/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    return `Week of ${month}/${day}`;
  }
  return week;
}

function sortWeeks(weeks: string[]): string[] {
  return [...weeks].sort((a, b) => {
    const dateA = extractDate(a);
    const dateB = extractDate(b);
    if (!dateA || !dateB) return a.localeCompare(b);
    return dateA.getTime() - dateB.getTime();
  });
}

function extractDate(weekStr: string): Date | null {
  const match = weekStr.match(/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1]) - 1;
    const day = parseInt(match[2]);
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }
  return null;
}

