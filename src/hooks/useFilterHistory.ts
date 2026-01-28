import { useState, useCallback } from 'react';

interface FilterState {
  selectedProviders: string[];
  weekRange: [string, string] | null;
  thresholdPercent: number | null;
  performanceTier: string | null;
  visitVolume: string | null;
  trend: string | null;
  minimumVisits: number | null;
}

export function useFilterHistory() {
  const [history, setHistory] = useState<FilterState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveState = useCallback((state: FilterState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(state);
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        setHistoryIndex(newHistory.length - 1);
      }
      return newHistory;
    });
  }, [historyIndex]);

  const undo = useCallback((): FilterState | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): FilterState | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}

