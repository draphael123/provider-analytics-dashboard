// Accessibility utilities

export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  actions: {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
  }
) {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      actions.onEnter?.();
      break;
    case 'Escape':
      actions.onEscape?.();
      break;
    case 'ArrowUp':
      event.preventDefault();
      actions.onArrowUp?.();
      break;
    case 'ArrowDown':
      event.preventDefault();
      actions.onArrowDown?.();
      break;
    case 'ArrowLeft':
      event.preventDefault();
      actions.onArrowLeft?.();
      break;
    case 'ArrowRight':
      event.preventDefault();
      actions.onArrowRight?.();
      break;
    case 'Tab':
      actions.onTab?.();
      break;
  }
}

export function getAriaLabel(component: string, action?: string): string {
  const labels: Record<string, string> = {
    'provider-filter': 'Provider filter dropdown',
    'week-range-filter': 'Week range filter',
    'metric-filter': 'Metric selection filter',
    'threshold-filter': 'Threshold percentage filter',
    'export-csv': 'Export data to CSV file',
    'export-pdf': 'Export data to PDF',
    'clear-filters': 'Clear all active filters',
    'toggle-filters': 'Toggle filters panel',
    'provider-detail': 'Provider detail view',
    'close-modal': 'Close modal',
  };

  return action ? `${labels[component] || component} - ${action}` : labels[component] || component;
}

export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

