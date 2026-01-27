import { useState, useMemo, useEffect } from 'react';
import { ProviderWeekData, MetricType } from './types';
import { parseExcelFile } from './utils/dataParser';
import { loadDefaultExcelFile } from './utils/fileLoader';
import { calculateSummaryStats, filterData } from './utils/calculations';
import { getUniqueProviders } from './utils/dataTransformer';
import { useFilters } from './hooks/useFilters';
import { useChartData } from './hooks/useChartData';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProviderFilter } from './components/Filters/ProviderFilter';
import { WeekRangeFilter } from './components/Filters/WeekRangeFilter';
import { MetricFilter } from './components/Filters/MetricFilter';
import { ThresholdFilter } from './components/Filters/ThresholdFilter';
import { SummaryCards } from './components/SummaryCards';
import { LineChart } from './components/Charts/LineChart';
import { BarChart } from './components/Charts/BarChart';
import { ChartControls } from './components/Charts/ChartControls';
import { DataTable } from './components/DataTable';

function App() {
  const [data, setData] = useState<ProviderWeekData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalVisits');
  const [barChartMetric, setBarChartMetric] = useState<'totalVisits' | 'visitsOver20Min' | 'percentOver20Min' | 'avgDuration'>('totalVisits');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const {
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
  } = useFilters(data);

  const allProviders = useMemo(() => getUniqueProviders(data), [data]);
  
  // Initialize selected providers to all providers when data loads
  useEffect(() => {
    if (data.length > 0 && selectedProviders.length === 0) {
      setSelectedProviders(allProviders);
    }
  }, [data, allProviders, selectedProviders.length, setSelectedProviders]);

  const { lineChartData, barChartData } = useChartData(
    filteredData,
    selectedMetric,
    selectedProviders
  );

  const previousPeriodData = useMemo(() => {
    if (!weekRange || filteredData.length === 0) return undefined;
    const [startWeek, endWeek] = weekRange;
    const weeks = Array.from(new Set(data.map(d => d.week))).sort();
    const startIndex = weeks.indexOf(startWeek);
    if (startIndex < 4) return undefined;
    
    const prevStartIndex = Math.max(0, startIndex - 4);
    const prevEndIndex = startIndex;
    const prevStartWeek = weeks[prevStartIndex];
    const prevEndWeek = weeks[prevEndIndex];
    
    return filterData(data, {
      selectedProviders,
      weekRange: [prevStartWeek, prevEndWeek],
      thresholdPercent: null,
    });
  }, [data, weekRange, selectedProviders, filteredData]);

  const summaryStats = useMemo(() => {
    return calculateSummaryStats(filteredData, previousPeriodData);
  }, [filteredData, previousPeriodData]);

  // Load default Excel file on mount
  useEffect(() => {
    const loadDefaultData = async () => {
      setIsLoading(true);
      try {
        const parsedData = await loadDefaultExcelFile('/Doxy - Over 20 minutes (9).xlsx');
        setData(parsedData);
      } catch (error) {
        console.error('Error loading default file:', error);
        // If default file fails, show upload UI
        setIsLoading(false);
      }
    };
    
    loadDefaultData();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing Excel file. Please ensure the file format is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = selectedProviders.length > 0 || weekRange !== null || thresholdPercent !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-8">
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className="md:hidden text-gray-600 hover:text-gray-700"
                    >
                      {isFiltersOpen ? 'Hide' : 'Show'} Filters
                    </button>
                  </div>
                </div>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${isFiltersOpen ? 'block' : 'hidden md:grid'}`}>
                  <ProviderFilter
                    providers={allProviders}
                    selectedProviders={selectedProviders}
                    onSelectionChange={setSelectedProviders}
                  />
                  <WeekRangeFilter
                    data={data}
                    weekRange={weekRange}
                    onRangeChange={setWeekRange}
                  />
                  <MetricFilter
                    selectedMetrics={selectedMetrics}
                    onMetricsChange={setSelectedMetrics}
                  />
                  <ThresholdFilter
                    thresholdPercent={thresholdPercent}
                    onThresholdChange={setThresholdPercent}
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards stats={summaryStats} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Line Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Week-over-Week Trend</h3>
                  <ChartControls
                    selectedMetric={selectedMetric}
                    onMetricChange={setSelectedMetric}
                  />
                </div>
                <LineChart
                  data={lineChartData}
                  selectedMetric={selectedMetric}
                  selectedProviders={selectedProviders}
                  allProviders={allProviders}
                />
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Comparison</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Metric:</span>
                    <select
                      value={barChartMetric}
                      onChange={(e) => setBarChartMetric(e.target.value as any)}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="totalVisits">Total Visits</option>
                      <option value="visitsOver20Min">Visits Over 20 Min</option>
                      <option value="percentOver20Min">% Over 20 Min</option>
                      <option value="avgDuration">Avg Duration</option>
                    </select>
                  </div>
                </div>
                <BarChart
                  data={barChartData}
                  selectedMetric={barChartMetric}
                />
              </div>
            </div>

            {/* Data Table */}
            <DataTable data={filteredData} thresholdPercent={thresholdPercent || 20} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;

