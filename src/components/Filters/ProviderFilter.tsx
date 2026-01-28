import { useState, useMemo } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface ProviderFilterProps {
  providers: string[];
  selectedProviders: string[];
  onSelectionChange: (providers: string[]) => void;
}

export function ProviderFilter({ providers, selectedProviders, onSelectionChange }: ProviderFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProviders = useMemo(() => {
    if (!searchTerm) return providers;
    return providers.filter(p => 
      p.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [providers, searchTerm]);

  const handleToggle = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      onSelectionChange(selectedProviders.filter(p => p !== provider));
    } else {
      onSelectionChange([...selectedProviders, provider]);
    }
  };

  const handleSelectAll = () => {
    onSelectionChange([...providers]);
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const handleRemove = (provider: string) => {
    onSelectionChange(selectedProviders.filter(p => p !== provider));
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Providers
      </label>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center justify-between transition-colors"
          aria-label="Select providers"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectedProviders.length === 0
              ? 'All providers'
              : `${selectedProviders.length} selected`}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-hidden transition-colors">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search providers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  aria-label="Search providers"
                  role="searchbox"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredProviders.map((provider) => (
                <label
                  key={provider}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(provider)}
                    onChange={() => handleToggle(provider)}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{provider}</span>
                </label>
              ))}
              {filteredProviders.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No providers found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedProviders.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedProviders.map((provider, index) => {
            const badgeColors = [
              'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
              'bg-gradient-to-r from-emerald-500 to-teal-500 text-white',
              'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
              'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
              'bg-gradient-to-r from-cyan-500 to-blue-500 text-white',
              'bg-gradient-to-r from-pink-500 to-rose-500 text-white',
            ];
            return (
              <span
                key={provider}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badgeColors[index % badgeColors.length]} shadow-md hover:shadow-lg transition-all`}
              >
                {provider}
                <button
                  onClick={() => handleRemove(provider)}
                  className="ml-2 hover:opacity-80 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

