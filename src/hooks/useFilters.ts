import { useState, useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { filterData } from '../utils/calculations';

export function useFilters(data: ProviderWeekData[]) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [weekRange, setWeekRange] = useState<[string, string] | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['totalVisits', 'percentOver20Min']);
  const [thresholdPercent, setThresholdPercent] = useState<number | null>(null);
  const [performanceTier, setPerformanceTier] = useState<string | null>(null);
  const [visitVolume, setVisitVolume] = useState<string | null>(null);
  const [trend, setTrend] = useState<string | null>(null);
  const [minimumVisits, setMinimumVisits] = useState<number | null>(null);
  
  const filteredData = useMemo(() => {
    return filterData(data, {
      selectedProviders,
      weekRange,
      thresholdPercent,
      performanceTier,
      visitVolume,
      trend,
      minimumVisits,
    });
  }, [data, selectedProviders, weekRange, thresholdPercent, performanceTier, visitVolume, trend, minimumVisits]);
  
  const clearAllFilters = () => {
    setSelectedProviders([]);
    setWeekRange(null);
    setThresholdPercent(null);
    setPerformanceTier(null);
    setVisitVolume(null);
    setTrend(null);
    setMinimumVisits(null);
  };
  
  return {
    filteredData,
    selectedProviders,
    setSelectedProviders,
    weekRange,
    setWeekRange,
    selectedMetrics,
    setSelectedMetrics,
    thresholdPercent,
    setThresholdPercent,
    performanceTier,
    setPerformanceTier,
    visitVolume,
    setVisitVolume,
    trend,
    setTrend,
    minimumVisits,
    setMinimumVisits,
    clearAllFilters,
  };
}

