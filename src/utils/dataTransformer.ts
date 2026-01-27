import { ProviderWeekData } from '../types';

export function normalizeWeekLabel(week: string): string {
  // Normalize week labels to a consistent format
  const match = week.match(/(\d{1,2})\/(\d{1,2})/);
  if (match) {
    const month = parseInt(match[1]);
    const day = parseInt(match[2]);
    return `Week of ${month}/${day}`;
  }
  return week;
}

export function sortWeeks(weeks: string[]): string[] {
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
    const month = parseInt(match[1]) - 1; // JS months are 0-indexed
    const day = parseInt(match[2]);
    
    // Determine the year: if month is 1-3 (Jan-Mar), it's likely the next year
    // if month is 11-12 (Nov-Dec), it's likely the previous year
    // This handles data spanning year boundaries (e.g., Nov 2024 - Jan 2025)
    const currentYear = new Date().getFullYear();
    let year = currentYear;
    
    // If we see dates in Jan-Mar, assume they're in the next year if we also see Nov-Dec dates
    // This is a heuristic - we'll use the most recent year that makes sense
    if (month >= 0 && month <= 2) { // Jan-Mar
      // Check if this is likely part of a dataset that spans years
      // For now, use current year, but we'll adjust in sortWeeks
      year = currentYear;
    } else if (month >= 10) { // Nov-Dec
      year = currentYear - 1; // Likely from previous year
    }
    
    return new Date(year, month, day);
  }
  return null;
}

export function sortWeeks(weeks: string[]): string[] {
  if (weeks.length === 0) return weeks;
  
  // Extract all dates first to determine year boundaries
  const dates = weeks.map(w => extractDate(w)).filter(d => d !== null) as Date[];
  if (dates.length === 0) return weeks.sort();
  
  // Find the earliest date
  const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const earliestYear = earliestDate.getFullYear();
  
  // If we have dates in Jan-Mar that are after Nov-Dec dates chronologically,
  // they're likely in the next year
  const hasNovDec = dates.some(d => d.getMonth() >= 10);
  const hasJanMar = dates.some(d => d.getMonth() <= 2);
  
  // Adjust dates if we detect a year boundary
  const adjustedDates = dates.map(d => {
    if (hasNovDec && hasJanMar) {
      // We have dates spanning year boundary
      if (d.getMonth() <= 2) { // Jan-Mar
        return new Date(earliestYear + 1, d.getMonth(), d.getDate());
      } else if (d.getMonth() >= 10) { // Nov-Dec
        return new Date(earliestYear, d.getMonth(), d.getDate());
      }
    }
    return d;
  });
  
  // Create a map of week string to adjusted date
  const weekDateMap = new Map<string, Date>();
  weeks.forEach((week, idx) => {
    const date = extractDate(week);
    if (date) {
      const adjustedDate = adjustedDates[dates.indexOf(date)];
      weekDateMap.set(week, adjustedDate || date);
    }
  });
  
  return [...weeks].sort((a, b) => {
    const dateA = weekDateMap.get(a) || extractDate(a);
    const dateB = weekDateMap.get(b) || extractDate(b);
    if (!dateA || !dateB) return a.localeCompare(b);
    return dateA.getTime() - dateB.getTime();
  });
}

export function getUniqueProviders(data: ProviderWeekData[]): string[] {
  return Array.from(new Set(data.map(d => d.provider))).sort();
}

export function getUniqueWeeks(data: ProviderWeekData[]): string[] {
  return sortWeeks(Array.from(new Set(data.map(d => normalizeWeekLabel(d.week)))));
}

