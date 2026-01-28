import { ProviderWeekData } from '../types';

export interface PerformanceScore {
  provider: string;
  score: number; // 0-100
  breakdown: {
    visitCountScore: number; // Lower visits over 20 min = higher score
    percentageScore: number; // Lower percentage = higher score
    trendScore: number; // Improving trend = higher score
    consistencyScore: number; // Consistent performance = higher score
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export function calculatePerformanceScore(
  provider: string,
  data: ProviderWeekData[]
): PerformanceScore {
  const providerData = data.filter(d => d.provider === provider);
  
  if (providerData.length === 0) {
    return {
      provider,
      score: 0,
      breakdown: {
        visitCountScore: 0,
        percentageScore: 0,
        trendScore: 0,
        consistencyScore: 0,
      },
      grade: 'F',
    };
  }

  // Calculate aggregate stats
  const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
  const visitsOver20Min = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
  const percentOver20Min = totalVisits > 0 ? (visitsOver20Min / totalVisits) * 100 : 0;

  // Visit Count Score (0-25 points): Fewer visits over 20 min = better
  // Normalize: 0 visits = 25 points, scale down from there
  const maxVisitsOver20 = Math.max(...data.map(d => d.visitsOver20Min), 1);
  const visitCountScore = Math.max(0, 25 * (1 - visitsOver20Min / maxVisitsOver20));

  // Percentage Score (0-35 points): Lower percentage = better
  // 0% = 35 points, 50%+ = 0 points
  const percentageScore = Math.max(0, 35 * (1 - percentOver20Min / 50));

  // Trend Score (0-25 points): Improving trend = better
  let trendScore = 12.5; // Neutral baseline
  if (providerData.length > 1) {
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

    const recent = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
    const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
    
    const trend = prevPercent - recentPercent; // Positive = improving
    trendScore = 12.5 + (trend * 2.5); // Scale: -5% to +5% trend = 0 to 25 points
    trendScore = Math.max(0, Math.min(25, trendScore));
  }

  // Consistency Score (0-15 points): Lower variance = better
  const percentages = providerData.map(d => d.percentOver20Min);
  const mean = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
  const variance = percentages.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / percentages.length;
  const stdDev = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 15 * (1 - stdDev / 20)); // Lower std dev = higher score

  const totalScore = visitCountScore + percentageScore + trendScore + consistencyScore;
  const score = Math.round(Math.max(0, Math.min(100, totalScore)));

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    provider,
    score,
    breakdown: {
      visitCountScore: Math.round(visitCountScore),
      percentageScore: Math.round(percentageScore),
      trendScore: Math.round(trendScore),
      consistencyScore: Math.round(consistencyScore),
    },
    grade,
  };
}

export function calculateAllProviderScores(data: ProviderWeekData[]): PerformanceScore[] {
  const providers = Array.from(new Set(data.map(d => d.provider)));
  return providers.map(provider => calculatePerformanceScore(provider, data));
}

