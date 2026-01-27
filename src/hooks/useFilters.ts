import { useState, useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { filterData } from '../utils/calculations';

export function useFilters(data: ProviderWeekData[]) {
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [weekRange, setWeekRange] = useState<[string, string] | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['totalVisits', 'percentOver20Min']);
  const [thresholdPercent, setThresholdPercent] = useState<number | null>(null);
  
  const filteredData = useMemo(() => {
    return filterData(data, {
      selectedProviders,
      weekRange,
      thresholdPercent,
    });
  }, [data, selectedProviders, weekRange, thresholdPercent]);
  
  const clearAllFilters = () => {
    setSelectedProviders([]);
    setWeekRange(null);
    setThresholdPercent(null);
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
    clearAllFilters,
  };
}

