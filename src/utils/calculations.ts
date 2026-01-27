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
    
    // Determine the year: handle year boundaries
    const currentYear = new Date().getFullYear();
    let year = currentYear;
    
    // If month is Nov-Dec, likely from previous year
    if (month >= 10) {
      year = currentYear - 1;
    }
    
    return new Date(year, month, day);
  }
  return null;
}

function sortWeeks(weeks: string[]): string[] {
  if (weeks.length === 0) return weeks;
  
  // Extract all dates first
  const dates = weeks.map(w => extractDate(w)).filter(d => d !== null) as Date[];
  if (dates.length === 0) return weeks.sort();
  
  // Find the earliest date to establish baseline year
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const earliestYear = earliestDate.getFullYear();
  
  // Check if we have dates spanning year boundary (Nov-Dec and Jan-Mar)
  const hasNovDec = dates.some(d => d.getMonth() >= 10);
  const hasJanMar = dates.some(d => d.getMonth() <= 2);
  
  // Create adjusted dates map
  const weekDateMap = new Map<string, Date>();
  weeks.forEach(week => {
    const date = extractDate(week);
    if (date) {
      let adjustedDate = date;
      if (hasNovDec && hasJanMar) {
        // Adjust dates to handle year boundary
        if (date.getMonth() <= 2) { // Jan-Mar
          adjustedDate = new Date(earliestYear + 1, date.getMonth(), date.getDate());
        } else if (date.getMonth() >= 10) { // Nov-Dec
          adjustedDate = new Date(earliestYear, date.getMonth(), date.getDate());
        }
      }
      weekDateMap.set(week, adjustedDate);
    }
  });
  
  return [...weeks].sort((a, b) => {
    const dateA = weekDateMap.get(a) || extractDate(a);
    const dateB = weekDateMap.get(b) || extractDate(b);
    if (!dateA || !dateB) return a.localeCompare(b);
    return dateA.getTime() - dateB.getTime();
  });
}

