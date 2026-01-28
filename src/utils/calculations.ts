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
  
  // Calculate total visits for the most recent week in the data
  let totalVisits = 0;
  if (data.length > 0) {
    // Sort data by week chronologically to find the most recent week
    const sorted = [...data].sort((a, b) => {
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
    
    // Get the most recent week
    const mostRecentWeek = sorted[sorted.length - 1].week;
    
    // Sum total visits for all providers in the most recent week
    totalVisits = data
      .filter(d => d.week === mostRecentWeek)
      .reduce((sum, d) => sum + d.totalVisits, 0);
  }
  
  const avgPercentOver20Min = data.reduce((sum, d) => sum + d.percentOver20Min, 0) / data.length;
  
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let trendValue = 0;
  
  // Calculate week-over-week trend for the team
  if (data.length > 1) {
    // Sort data by week chronologically
    const sorted = [...data].sort((a, b) => {
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
    
    // Group by week and calculate team average for each week
    const weekStats = new Map<string, { totalVisits: number; visitsOver20: number }>();
    sorted.forEach(item => {
      const existing = weekStats.get(item.week);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20 += item.visitsOver20Min;
      } else {
        weekStats.set(item.week, {
          totalVisits: item.totalVisits,
          visitsOver20: item.visitsOver20Min,
        });
      }
    });
    
    const weekAverages = Array.from(weekStats.entries())
      .map(([week, stats]) => ({
        week,
        percent: stats.totalVisits > 0 ? (stats.visitsOver20 / stats.totalVisits) * 100 : 0,
      }))
      .sort((a, b) => {
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
    
    // Compare most recent week vs previous week
    if (weekAverages.length >= 2) {
      const recent = weekAverages[weekAverages.length - 1];
      const previous = weekAverages[weekAverages.length - 2];
      trendValue = recent.percent - previous.percent;
      trend = trendValue > 0.5 ? 'up' : trendValue < -0.5 ? 'down' : 'neutral';
    } else if (previousPeriodData && previousPeriodData.length > 0) {
      // Fallback to previous period comparison if not enough weeks
      const prevAvgPercent = previousPeriodData.reduce((sum, d) => sum + d.percentOver20Min, 0) / previousPeriodData.length;
      trendValue = avgPercentOver20Min - prevAvgPercent;
      trend = trendValue > 0.5 ? 'up' : trendValue < -0.5 ? 'down' : 'neutral';
    }
  } else if (previousPeriodData && previousPeriodData.length > 0) {
    // Fallback to previous period comparison
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
    performanceTier?: string | null;
    visitVolume?: string | null;
    trend?: string | null;
    minimumVisits?: number | null;
  }
): ProviderWeekData[] {
  // First, filter by basic criteria
  let filtered = data.filter(item => {
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

  // Apply advanced filters that require provider-level aggregation
  if (filters.performanceTier || filters.visitVolume || filters.trend || filters.minimumVisits) {
    // Calculate provider-level stats
    const providerStats = new Map<string, {
      totalVisits: number;
      visitsOver20: number;
      percentOver20: number;
      trend: number;
    }>();

    filtered.forEach(item => {
      const existing = providerStats.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20 += item.visitsOver20Min;
      } else {
        providerStats.set(item.provider, {
          totalVisits: item.totalVisits,
          visitsOver20: item.visitsOver20Min,
          percentOver20: 0,
          trend: 0,
        });
      }
    });

    // Calculate percentages and trends
    providerStats.forEach((stat, provider) => {
      stat.percentOver20 = stat.totalVisits > 0 ? (stat.visitsOver20 / stat.totalVisits) * 100 : 0;
      
      // Calculate week-over-week trend (compare most recent week vs previous week)
      const providerData = filtered.filter(d => d.provider === provider);
      if (providerData.length > 1) {
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
        
        // Compare most recent week vs previous week
        const recent = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];
        
        const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
        const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
        
        stat.trend = recentPercent - prevPercent; // Negative is good (decreasing)
      }
    });

    // Calculate thresholds for performance tier and visit volume
    const percentages = Array.from(providerStats.values())
      .map(s => s.percentOver20)
      .filter(p => p > 0)
      .sort((a, b) => a - b);
    
    const visits = Array.from(providerStats.values())
      .map(s => s.totalVisits)
      .sort((a, b) => a - b);

    const medianPercent = percentages[Math.floor(percentages.length / 2)] || 0;
    const topQuartile = percentages[Math.floor(percentages.length * 0.75)] || 0;
    const bottomQuartile = percentages[Math.floor(percentages.length * 0.25)] || 0;
    
    const lowVolumeThreshold = visits[Math.floor(visits.length * 0.33)] || 0;
    const mediumVolumeThreshold = visits[Math.floor(visits.length * 0.67)] || 0;

    // Filter by provider-level criteria
    const validProviders = new Set<string>();
    
    providerStats.forEach((stat, provider) => {
      let isValid = true;

      // Performance tier filter
      if (filters.performanceTier) {
        if (filters.performanceTier === 'top25' && stat.percentOver20 < topQuartile) isValid = false;
        else if (filters.performanceTier === 'aboveAvg' && stat.percentOver20 < medianPercent) isValid = false;
        else if (filters.performanceTier === 'belowAvg' && stat.percentOver20 >= medianPercent) isValid = false;
        else if (filters.performanceTier === 'bottom25' && stat.percentOver20 >= bottomQuartile) isValid = false;
      }

      // Visit volume filter
      if (filters.visitVolume && isValid) {
        if (filters.visitVolume === 'high' && stat.totalVisits < mediumVolumeThreshold) isValid = false;
        else if (filters.visitVolume === 'medium' && (stat.totalVisits < lowVolumeThreshold || stat.totalVisits >= mediumVolumeThreshold)) isValid = false;
        else if (filters.visitVolume === 'low' && stat.totalVisits >= lowVolumeThreshold) isValid = false;
      }

      // Trend filter
      if (filters.trend && isValid) {
        if (filters.trend === 'improving' && stat.trend <= 0) isValid = false;
        else if (filters.trend === 'declining' && stat.trend >= 0) isValid = false;
        else if (filters.trend === 'stable' && Math.abs(stat.trend) > 1) isValid = false;
      }

      // Minimum visits filter
      if (filters.minimumVisits !== null && filters.minimumVisits !== undefined && isValid) {
        if (stat.totalVisits < filters.minimumVisits) isValid = false;
      }

      if (isValid) {
        validProviders.add(provider);
      }
    });

    // Filter data to only include valid providers
    filtered = filtered.filter(item => validProviders.has(item.provider));
  }

  return filtered;
}


