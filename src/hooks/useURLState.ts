import { useCallback, useEffect, useState } from 'react';

interface FilterState {
  selectedProviders: string[];
  weekRange: [string, string] | null;
  thresholdPercent: number | null;
  performanceTier: string | null;
  visitVolume: string | null;
  trend: string | null;
  minimumVisits: number | null;
}

export function useURLState() {
  const [urlFilters, setUrlFilters] = useState<Partial<FilterState>>({});

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filters: Partial<FilterState> = {};
    
    const providers = params.get('providers');
    if (providers) {
      filters.selectedProviders = providers.split(',').filter(Boolean);
    }
    
    const startWeek = params.get('startWeek');
    const endWeek = params.get('endWeek');
    if (startWeek && endWeek) {
      filters.weekRange = [startWeek, endWeek];
    }
    
    const threshold = params.get('threshold');
    if (threshold) {
      filters.thresholdPercent = parseFloat(threshold);
    }
    
    const tier = params.get('tier');
    if (tier) {
      filters.performanceTier = tier;
    }
    
    const volume = params.get('volume');
    if (volume) {
      filters.visitVolume = volume;
    }
    
    const trend = params.get('trend');
    if (trend) {
      filters.trend = trend;
    }
    
    const minVisits = params.get('minVisits');
    if (minVisits) {
      filters.minimumVisits = parseInt(minVisits, 10);
    }
    
    setUrlFilters(filters);
  }, []);

  const updateURL = useCallback((filters: Partial<FilterState>) => {
    const params = new URLSearchParams();
    
    if (filters.selectedProviders && filters.selectedProviders.length > 0) {
      params.set('providers', filters.selectedProviders.join(','));
    }
    
    if (filters.weekRange) {
      params.set('startWeek', filters.weekRange[0]);
      params.set('endWeek', filters.weekRange[1]);
    }
    
    if (filters.thresholdPercent !== null && filters.thresholdPercent !== undefined) {
      params.set('threshold', filters.thresholdPercent.toString());
    }
    
    if (filters.performanceTier) {
      params.set('tier', filters.performanceTier);
    }
    
    if (filters.visitVolume) {
      params.set('volume', filters.visitVolume);
    }
    
    if (filters.trend) {
      params.set('trend', filters.trend);
    }
    
    if (filters.minimumVisits !== null && filters.minimumVisits !== undefined) {
      params.set('minVisits', filters.minimumVisits.toString());
    }
    
    const newURL = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname;
    
    window.history.pushState({}, '', newURL);
  }, []);

  const getURLFilters = useCallback((): Partial<FilterState> => {
    return urlFilters;
  }, [urlFilters]);

  const getShareableLink = useCallback(() => {
    return window.location.href;
  }, []);

  return {
    updateURL,
    getURLFilters,
    getShareableLink,
    initialFilters: urlFilters,
  };
}

