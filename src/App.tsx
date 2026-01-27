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
import { PerformanceTierFilter } from './components/Filters/PerformanceTierFilter';
import { VisitVolumeFilter } from './components/Filters/VisitVolumeFilter';
import { TrendFilter } from './components/Filters/TrendFilter';
import { MinimumVisitsFilter } from './components/Filters/MinimumVisitsFilter';
import { SummaryCards } from './components/SummaryCards';
import { LineChart } from './components/Charts/LineChart';
import { BarChart } from './components/Charts/BarChart';
import { ChartControls } from './components/Charts/ChartControls';
import { ScatterChart } from './components/Charts/ScatterChart';
import { AreaChart } from './components/Charts/AreaChart';
import { StackedBarChart } from './components/Charts/StackedBarChart';
import { PieChart } from './components/Charts/PieChart';
import { GoalProgressChart } from './components/Charts/GoalProgressChart';
import { DataTable } from './components/DataTable';
import { ProviderRankingTable } from './components/ProviderRankingTable';
import { HeatmapChart } from './components/Charts/HeatmapChart';
import { ProviderComparisonMatrix } from './components/ProviderComparisonMatrix';
import { PerformanceDistribution } from './components/PerformanceDistribution';
import { InsightsPanel } from './components/InsightsPanel';
import { HowItWorks } from './components/HowItWorks';

function App() {
  const [data, setData] = useState<ProviderWeekData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalVisits');
  const [barChartMetric, setBarChartMetric] = useState<'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'>('totalVisits');
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
    performanceTier,
    setPerformanceTier,
    visitVolume,
    setVisitVolume,
    trend,
    setTrend,
    minimumVisits,
    setMinimumVisits,
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
    const [startWeek] = weekRange;
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

  // Calculate benchmark values for charts
  const benchmarkValues = useMemo(() => {
    if (filteredData.length === 0) return undefined;

    const providerPercents = Array.from(
      new Set(filteredData.map(d => d.provider))
    ).map(provider => {
      const providerData = filteredData.filter(d => d.provider === provider);
      const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
      const visitsOver20 = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
      return totalVisits > 0 ? (visitsOver20 / totalVisits) * 100 : 0;
    });

    const sorted = [...providerPercents].sort((a, b) => a - b);
    const avg = providerPercents.reduce((sum, p) => sum + p, 0) / providerPercents.length;
    const median = sorted[Math.floor(sorted.length / 2)] || 0;
    const topQuartile = sorted[Math.floor(sorted.length * 0.75)] || 0;

    // For other metrics, calculate similarly
    const totalVisitsValues = filteredData.map(d => d.totalVisits);

    return {
      percentOver20Min: {
        average: avg,
        median: median,
        topQuartile: topQuartile,
      },
      totalVisits: {
        average: totalVisitsValues.reduce((sum, v) => sum + v, 0) / totalVisitsValues.length,
        median: [...totalVisitsValues].sort((a, b) => a - b)[Math.floor(totalVisitsValues.length / 2)] || 0,
        topQuartile: [...totalVisitsValues].sort((a, b) => b - a)[Math.floor(totalVisitsValues.length * 0.25)] || 0,
      },
    };
  }, [filteredData]);

  const handleProviderSelect = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      setSelectedProviders([provider]);
    } else {
      setSelectedProviders([provider]);
    }
  };

  // Load default Excel file on mount
  useEffect(() => {
    const loadDefaultData = async () => {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('File loading timeout - taking too long');
        setIsLoading(false);
        alert('Loading timeout. Please try uploading the file manually.');
      }, 30000); // 30 second timeout
      
      try {
        console.log('Attempting to load default Excel file...');
        const parsedData = await loadDefaultExcelFile('/Doxy - Over 20 minutes (9).xlsx');
        clearTimeout(timeoutId);
        
        console.log('Data loaded successfully:', parsedData.length, 'records');
        
        if (parsedData.length === 0) {
          throw new Error('No data found in the Excel file. Please check the file format.');
        }
        
        setData(parsedData);
        setIsLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error loading default file:', error);
        // If default file fails, show upload UI
        setIsLoading(false);
        alert(`Failed to load default data file. Please upload the Excel file manually.\n\nError: ${error instanceof Error ? error.message : String(error)}`);
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

  const hasActiveFilters = selectedProviders.length > 0 || weekRange !== null || thresholdPercent !== null || 
    performanceTier !== null || visitVolume !== null || trend !== null || minimumVisits !== null;

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
          <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading data...</p>
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
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                    <button
                      onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                      className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                  <PerformanceTierFilter
                    data={data}
                    selectedTier={performanceTier}
                    onTierChange={setPerformanceTier}
                  />
                  <VisitVolumeFilter
                    data={data}
                    selectedVolume={visitVolume}
                    onVolumeChange={setVisitVolume}
                  />
                  <TrendFilter
                    data={data}
                    selectedTrend={trend}
                    onTrendChange={setTrend}
                  />
                  <MinimumVisitsFilter
                    minimumVisits={minimumVisits}
                    onMinimumVisitsChange={setMinimumVisits}
                  />
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards stats={summaryStats} />

            {/* Insights Panel */}
            <div className="mb-6">
              <InsightsPanel data={filteredData} />
            </div>

            {/* Provider Ranking Table */}
            <div className="mb-6">
              <ProviderRankingTable 
                data={filteredData} 
                onProviderSelect={handleProviderSelect}
              />
            </div>

            {/* Provider Comparison Matrix */}
            {selectedProviders.length >= 2 && selectedProviders.length <= 4 && (
              <div className="mb-6">
                <ProviderComparisonMatrix 
                  data={filteredData}
                  selectedProviders={selectedProviders}
                />
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Line/Area Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Week-over-Week Trend</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLineChartType('line')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              lineChartType === 'line'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            Line
                          </button>
                          <button
                            onClick={() => setLineChartType('area')}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                              lineChartType === 'area'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            Area
                          </button>
                        </div>
                      </div>
                      <ChartControls
                        selectedMetric={selectedMetric}
                        onMetricChange={setSelectedMetric}
                      />
                    </div>
                    {lineChartType === 'line' ? (
                      <LineChart
                        data={lineChartData}
                        selectedMetric={selectedMetric}
                        selectedProviders={selectedProviders}
                        allProviders={allProviders}
                        showBenchmarks={true}
                        benchmarkValues={benchmarkValues ? {
                          average: benchmarkValues[selectedMetric].average,
                          median: benchmarkValues[selectedMetric].median,
                          topQuartile: benchmarkValues[selectedMetric].topQuartile,
                        } : undefined}
                      />
                    ) : (
                      <AreaChart
                        data={lineChartData}
                        selectedMetric={selectedMetric}
                        selectedProviders={selectedProviders}
                        allProviders={allProviders}
                      />
                    )}
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Provider Comparison</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Metric:</span>
                        <select
                          value={barChartMetric}
                          onChange={(e) => setBarChartMetric(e.target.value as any)}
                          className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                          <option value="totalVisits">Total Visits</option>
                          <option value="visitsOver20Min">Visits Over 20 Min</option>
                          <option value="percentOver20Min">% Over 20 Min</option>
                        </select>
                      </div>
                    </div>
                    <BarChart
                      data={barChartData}
                      selectedMetric={barChartMetric}
                    />
                  </div>
                </div>

                {/* Additional Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Scatter Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Correlation Analysis</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Total Visits vs % Over 20 Min - Identify relationships and outliers
                    </p>
                    <ScatterChart data={filteredData} />
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visit Composition</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Stacked view showing visits under/over 20 minutes
                    </p>
                    <StackedBarChart data={filteredData} />
                  </div>
                </div>

                {/* Goal Progress and Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Goal Progress Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Progress</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Provider performance vs 20% goal target
                    </p>
                    <GoalProgressChart data={filteredData} goalPercent={20} />
                  </div>

                  {/* Pie Chart */}
                  <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Distribution</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Providers categorized by performance tier
                    </p>
                    <PieChart data={filteredData} />
                  </div>
                </div>

            {/* Heatmap and Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Heatmap */}
              <HeatmapChart 
                data={filteredData}
                selectedProviders={selectedProviders}
              />

              {/* Performance Distribution */}
              <PerformanceDistribution data={filteredData} />
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

