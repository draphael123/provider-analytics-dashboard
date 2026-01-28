import { useEffect } from 'react';

interface KeyboardShortcuts {
  onExport?: () => void;
  onRefresh?: () => void;
  onSearch?: () => void;
  onClearFilters?: () => void;
  onCloseModal?: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + E - Export
      if (ctrlKey && e.key === 'e') {
        e.preventDefault();
        shortcuts.onExport?.();
      }

      // Ctrl/Cmd + R - Refresh (only if not in input)
      if (ctrlKey && e.key === 'r' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        shortcuts.onRefresh?.();
      }

      // Ctrl/Cmd + F - Search
      if (ctrlKey && e.key === 'f' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        shortcuts.onSearch?.();
      }

      // Ctrl/Cmd + K - Clear filters
      if (ctrlKey && e.key === 'k') {
        e.preventDefault();
        shortcuts.onClearFilters?.();
      }

      // Esc - Close modal
      if (e.key === 'Escape') {
        shortcuts.onCloseModal?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

