import { useState, useMemo, useEffect } from 'react';
import { ProviderWeekData } from '../types';
import { Search, X } from 'lucide-react';

interface GlobalSearchProps {
  data: ProviderWeekData[];
  onResultClick?: (result: { type: 'provider' | 'week'; value: string }) => void;
}

export function GlobalSearch({ data, onResultClick }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const results = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];

    const term = searchTerm.toLowerCase();
    const results: Array<{ type: 'provider' | 'week'; value: string; label: string }> = [];

    // Search providers
    const providers = Array.from(new Set(data.map(d => d.provider)));
    providers.forEach(provider => {
      if (provider.toLowerCase().includes(term)) {
        results.push({ type: 'provider', value: provider, label: provider });
      }
    });

    // Search weeks
    const weeks = Array.from(new Set(data.map(d => d.week)));
    weeks.forEach(week => {
      if (week.toLowerCase().includes(term)) {
        results.push({ type: 'week', value: week, label: week });
      }
    });

    return results.slice(0, 10); // Limit to 10 results
  }, [data, searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open search (Ctrl+F)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">Ctrl+F</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search providers, weeks..."
            className="flex-1 text-lg bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
                setSearchTerm('');
              } else if (e.key === 'Enter' && results.length > 0) {
                onResultClick?.(results[0]);
                setIsOpen(false);
                setSearchTerm('');
              }
            }}
          />
          <button
            onClick={() => {
              setIsOpen(false);
              setSearchTerm('');
            }}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {searchTerm.length >= 2 && (
          <div className="max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.value}-${index}`}
                    onClick={() => {
                      onResultClick?.(result);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        result.type === 'provider'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
                      }`}>
                        {result.type === 'provider' ? 'Provider' : 'Week'}
                      </span>
                      <span className="text-gray-900 dark:text-white">{result.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

