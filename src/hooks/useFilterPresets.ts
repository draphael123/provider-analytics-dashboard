import { useState, useEffect } from 'react';

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    selectedProviders: string[];
    weekRange: [string, string] | null;
    thresholdPercent: number | null;
    performanceTier: string | null;
    visitVolume: string | null;
    trend: string | null;
    minimumVisits: number | null;
  };
  createdAt: string;
}

const PRESETS_STORAGE_KEY = 'provider-analytics-filter-presets';

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(PRESETS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
      } catch (error) {
        console.error('Failed to save presets:', error);
      }
    }
  }, [presets]);

  const savePreset = (name: string, filters: FilterPreset['filters']) => {
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date().toISOString(),
    };
    setPresets(prev => [...prev, newPreset]);
    return newPreset.id;
  };

  const deletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  const updatePreset = (id: string, updates: Partial<FilterPreset>) => {
    setPresets(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  return {
    presets,
    savePreset,
    deletePreset,
    updatePreset,
  };
}

