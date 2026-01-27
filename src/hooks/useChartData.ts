import { useMemo } from 'react';
import { ProviderWeekData, MetricType } from '../types';
import { sortWeeks } from '../utils/dataTransformer';

export function useChartData(
  data: ProviderWeekData[],
  selectedMetric: MetricType,
  selectedProviders: string[]
) {
  const lineChartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const weeks = sortWeeks(Array.from(new Set(data.map(d => d.week))));
    const providers = selectedProviders.length > 0 
      ? selectedProviders 
      : Array.from(new Set(data.map(d => d.provider)));
    
    return weeks.map(week => {
      const weekData: any = { week };
      
      providers.forEach(provider => {
        const providerWeekData = data.find(
          d => d.provider === provider && d.week === week
        );
        
        if (providerWeekData) {
          weekData[provider] = providerWeekData[selectedMetric];
        } else {
          weekData[provider] = null;
        }
      });
      
      return weekData;
    });
  }, [data, selectedMetric, selectedProviders]);
  
  const barChartData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Get the most recent week
    const weeks = sortWeeks(Array.from(new Set(data.map(d => d.week))));
    const latestWeek = weeks[weeks.length - 1];
    
    const providers = selectedProviders.length > 0 
      ? selectedProviders 
      : Array.from(new Set(data.map(d => d.provider)));
    
    return providers.map(provider => {
      const providerWeekData = data.find(
        d => d.provider === provider && d.week === latestWeek
      );
      
      if (!providerWeekData) {
        return {
          provider,
          totalVisits: 0,
          visitsOver20Min: 0,
          percentOver20Min: 0,
        };
      }
      
      return {
        provider,
        totalVisits: providerWeekData.totalVisits,
        visitsOver20Min: providerWeekData.visitsOver20Min,
        percentOver20Min: providerWeekData.percentOver20Min,
      };
    });
  }, [data, selectedProviders]);
  
  return {
    lineChartData,
    barChartData,
  };
}

