interface ThresholdFilterProps {
  thresholdPercent: number | null;
  onThresholdChange: (threshold: number | null) => void;
}

export function ThresholdFilter({ thresholdPercent, onThresholdChange }: ThresholdFilterProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Minimum % Over 20 Min
      </label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0"
          max="100"
          value={thresholdPercent ?? 0}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            onThresholdChange(value > 0 ? value : null);
          }}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <input
          type="number"
          min="0"
          max="100"
          value={thresholdPercent ?? ''}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            onThresholdChange(isNaN(value) || value === 0 ? null : value);
          }}
          placeholder="Any"
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-500">%</span>
      </div>
      {thresholdPercent !== null && (
        <button
          onClick={() => onThresholdChange(null)}
          className="mt-2 text-xs text-primary-600 hover:text-primary-700"
        >
          Clear threshold
        </button>
      )}
    </div>
  );
}

