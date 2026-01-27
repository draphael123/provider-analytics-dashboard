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
    const currentYear = new Date().getFullYear();
    return new Date(currentYear, month, day);
  }
  return null;
}

export function getUniqueProviders(data: ProviderWeekData[]): string[] {
  return Array.from(new Set(data.map(d => d.provider))).sort();
}

export function getUniqueWeeks(data: ProviderWeekData[]): string[] {
  return sortWeeks(Array.from(new Set(data.map(d => normalizeWeekLabel(d.week)))));
}

