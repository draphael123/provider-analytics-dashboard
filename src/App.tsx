import { useState, useMemo, useEffect, useRef } from 'react';
import { ProviderWeekData, MetricType } from './types';
import { parseExcelFile } from './utils/dataParser';
import { loadDefaultExcelFile } from './utils/fileLoader';
import { calculateSummaryStats, filterData } from './utils/calculations';
import { getUniqueProviders } from './utils/dataTransformer';
import { useFilters } from './hooks/useFilters';
import { useChartData } from './hooks/useChartData';
import { useToast } from './hooks/useToast';
import { useURLState } from './hooks/useURLState';
import { useFilterHistory } from './hooks/useFilterHistory';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ProviderFilter } from './components/Filters/ProviderFilter';
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
import { PerformanceDistribution } from './components/PerformanceDistribution';
import { InsightsPanel } from './components/InsightsPanel';
import { HowItWorks } from './components/HowItWorks';
import { ProviderDetailView } from './components/ProviderDetailView';
import { FilterPresets } from './components/FilterPresets';
import { CustomDateRangePicker } from './components/Filters/CustomDateRangePicker';
import { ComparisonTools } from './components/ComparisonTools';
import { ActionItems } from './components/ActionItems';
import { ProviderCommunication } from './components/ProviderCommunication';
import { AlertsPanel } from './components/AlertsPanel';
import { AdvancedAnalytics } from './components/AdvancedAnalytics';
import { ForecastingPanel } from './components/ForecastingPanel';
import { AnomalyDetectionPanel } from './components/AnomalyDetectionPanel';
import { exportToCSV, exportToPDF, generateReportHTML } from './utils/exportHelpers';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalSearch } from './components/GlobalSearch';
import { DataRefresh } from './components/DataRefresh';
import { ShareButton } from './components/ShareButton';
import { PeriodComparison } from './components/PeriodComparison';
import { PrintView } from './components/PrintView';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { exportChartAsPNG } from './utils/chartExport';

function App() {
  const [data, setData] = useState<ProviderWeekData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('totalVisits');
  const [barChartMetric, setBarChartMetric] = useState<'totalVisits' | 'visitsOver20Min' | 'percentOver20Min'>('totalVisits');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [lineChartType, setLineChartType] = useState<'line' | 'area'>('line');
  const [selectedProviderDetail, setSelectedProviderDetail] = useState<string | null>(null);
  const [showCommunication, setShowCommunication] = useState<string | null>(null);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [showPrintView, setShowPrintView] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  
  const { toasts, success, error, removeToast } = useToast();
  const { updateURL, getShareableLink, initialFilters } = useURLState();
  const { saveState, undo, redo, canUndo, canRedo } = useFilterHistory();

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

  // Apply URL filters on mount
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      if (initialFilters.selectedProviders) {
        setSelectedProviders(initialFilters.selectedProviders);
      }
      if (initialFilters.weekRange) {
        setWeekRange(initialFilters.weekRange);
      }
      if (initialFilters.thresholdPercent !== undefined) {
        setThresholdPercent(initialFilters.thresholdPercent);
      }
      if (initialFilters.performanceTier) {
        setPerformanceTier(initialFilters.performanceTier as any);
      }
      if (initialFilters.visitVolume) {
        setVisitVolume(initialFilters.visitVolume as any);
      }
      if (initialFilters.trend) {
        setTrend(initialFilters.trend as any);
      }
      if (initialFilters.minimumVisits !== undefined) {
        setMinimumVisits(initialFilters.minimumVisits);
      }
    }
  }, []); // Only run on mount

  // Update URL when filters change
  useEffect(() => {
    updateURL({
      selectedProviders,
      weekRange,
      thresholdPercent,
      performanceTier,
      visitVolume,
      trend,
      minimumVisits,
    });
    
    // Save to history
    saveState({
      selectedProviders,
      weekRange,
      thresholdPercent,
      performanceTier,
      visitVolume,
      trend,
      minimumVisits,
    });
  }, [selectedProviders, weekRange, thresholdPercent, performanceTier, visitVolume, trend, minimumVisits]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const parsedData = await loadDefaultExcelFile('/Doxy - Over 20 minutes (9).xlsx');
      setData(parsedData);
      setLastUpdated(new Date());
      success('Data refreshed successfully');
    } catch (err) {
      error('Failed to refresh data. Please try uploading manually.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onExport: () => {
      exportToCSV(filteredData, `provider-data-${new Date().toISOString().split('T')[0]}.csv`);
      success('Data exported to CSV');
    },
    onRefresh: handleRefresh,
    onSearch: () => setShowSearch(true),
    onClearFilters: clearAllFilters,
    onCloseModal: () => {
      if (selectedProviderDetail) setSelectedProviderDetail(null);
      if (showCommunication) setShowCommunication(null);
    },
  });

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
    setSelectedProviderDetail(provider);
  };

  // Load default Excel file on mount
  useEffect(() => {
    const loadDefaultData = async () => {
      setIsLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('File loading timeout - taking too long');
        setIsLoading(false);
        error('Loading timeout. Please try uploading the file manually.');
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
        setLastUpdated(new Date());
        setIsLoading(false);
        success('Data loaded successfully');
      } catch (err) {
        clearTimeout(timeoutId);
        console.error('Error loading default file:', err);
        // If default file fails, show upload UI
        setIsLoading(false);
        error(`Failed to load default data file. Please upload the Excel file manually.\n\nError: ${err instanceof Error ? err.message : String(err)}`);
      }
    };
    
    loadDefaultData();
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      setLastUpdated(new Date());
      success('File uploaded and parsed successfully');
    } catch (err) {
      console.error('Error parsing file:', err);
      error('Error parsing Excel file. Please ensure the file format is correct.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChart = async (chartRef: React.RefObject<HTMLDivElement>, filename: string) => {
    if (chartRef.current) {
      try {
        await exportChartAsPNG(chartRef.current, filename);
        success('Chart exported successfully');
      } catch (err) {
        error('Failed to export chart');
      }
    }
  };


  const hasActiveFilters = selectedProviders.length > 0 || weekRange !== null || thresholdPercent !== null || 
    performanceTier !== null || visitVolume !== null || trend !== null || minimumVisits !== null;

      return (
        <ErrorBoundary>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <a href="#main-content" className="skip-to-main">Skip to main content</a>
            <Header />
        
        <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" role="main">
          {showSearch && (
            <GlobalSearch
              data={data}
              onResultClick={(result) => {
                if (result.type === 'provider') {
                  setSelectedProviders([result.value]);
                }
                setShowSearch(false);
              }}
            />
          )}
        {/* How It Works Section - Always visible */}
        <HowItWorks />
        
        <div className="py-8">
          {isLoading ? (
            <div className="space-y-6">
              <LoadingSkeleton />
              <LoadingSkeleton />
              <LoadingSkeleton />
            </div>
          ) : data.length === 0 ? (
          <div className="max-w-2xl mx-auto mt-8">
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <>
            {/* Filters Section */}
            <div className="mb-6">
              <div className="bg-gradient-to-br from-white to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/50 rounded-lg shadow-lg border-2 border-indigo-200 dark:border-indigo-800 p-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">Filters</h2>
                  <div className="flex items-center gap-2">
                    <GlobalSearch
                      data={data}
                      onResultClick={(result) => {
                        if (result.type === 'provider') {
                          setSelectedProviders([result.value]);
                        }
                      }}
                    />
                    <ShareButton shareableLink={getShareableLink()} />
                    <DataRefresh
                      onRefresh={handleRefresh}
                      lastUpdated={lastUpdated}
                      autoRefreshInterval={15} // 15 minutes
                    />
                    {(canUndo || canRedo) && (
                      <div className="flex gap-1">
                        <button
                          onClick={undo}
                          disabled={!canUndo}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
                          title="Undo (Ctrl+Z)"
                        >
                          ↶
                        </button>
                        <button
                          onClick={redo}
                          disabled={!canRedo}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded disabled:opacity-50"
                          title="Redo (Ctrl+Y)"
                        >
                          ↷
                        </button>
                      </div>
                    )}
                    <FilterPresets
                      currentFilters={{
                        selectedProviders,
                        weekRange,
                        thresholdPercent,
                        performanceTier: performanceTier || null,
                        visitVolume: visitVolume || null,
                        trend: trend || null,
                        minimumVisits,
                      }}
                      onLoadPreset={(preset) => {
                        setSelectedProviders(preset.filters.selectedProviders);
                        setWeekRange(preset.filters.weekRange);
                        setThresholdPercent(preset.filters.thresholdPercent);
                        setPerformanceTier(preset.filters.performanceTier);
                        setVisitVolume(preset.filters.visitVolume);
                        setTrend(preset.filters.trend);
                        setMinimumVisits(preset.filters.minimumVisits);
                      }}
                    />
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                        aria-label="Clear all filters"
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
                  <CustomDateRangePicker
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

            {/* Action Items */}
            <div className="mb-6">
              <ActionItems data={filteredData} />
            </div>

            {/* Comparison Tools */}
            {selectedProviders.length > 0 && (
              <div className="mb-6">
                <ComparisonTools 
                  data={filteredData}
                  selectedProviders={selectedProviders}
                />
              </div>
            )}

            {/* Provider Ranking Table */}
            <div className="mb-6">
              <ProviderRankingTable 
                data={filteredData} 
                onProviderSelect={handleProviderSelect}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Line/Area Chart */}
                  <div ref={lineChartRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Week-over-Week Trend</h3>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportChart(lineChartRef, 'line-chart.png')}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                            title="Export as PNG"
                          >
                            📥
                          </button>
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
                  <div ref={barChartRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Provider Comparison</h3>
                        <button
                          onClick={() => handleExportChart(barChartRef, 'bar-chart.png')}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title="Export as PNG"
                        >
                          📥
                        </button>
                      </div>
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

            {/* Performance Distribution */}
            <div className="mb-6">
              <PerformanceDistribution data={filteredData} />
            </div>

            {/* Data Table */}
            <DataTable data={filteredData} thresholdPercent={thresholdPercent || 20} />

            {/* Advanced Analytics */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Advanced Analytics</h2>
                <button
                  onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg transition-all"
                  aria-label={showAdvancedAnalytics ? 'Hide advanced analytics' : 'Show advanced analytics'}
                >
                  {showAdvancedAnalytics ? 'Hide' : 'Show'} Analytics
                </button>
              </div>
              {showAdvancedAnalytics && (
                <div className="space-y-6">
                  <AdvancedAnalytics 
                    data={filteredData}
                    selectedProvider={selectedProviderDetail}
                  />
                  <ForecastingPanel data={filteredData} />
                  <AnomalyDetectionPanel data={filteredData} />
                </div>
              )}
            </div>

            {/* Period Comparison */}
            <div className="mb-6">
              <PeriodComparison data={filteredData} />
            </div>

            {/* Export Section */}
            <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export & Reporting</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    exportToCSV(filteredData, `provider-data-${new Date().toISOString().split('T')[0]}.csv`);
                    success('Data exported to CSV');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all"
                  aria-label="Export data to CSV"
                >
                  Export to CSV
                </button>
                <button
                  onClick={() => {
                    exportToPDF(filteredData, summaryStats);
                    success('PDF report generated');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 rounded-lg transition-all"
                  aria-label="Export data to PDF"
                >
                  Export to PDF
                </button>
                <button
                  onClick={() => {
                    const html = generateReportHTML(filteredData, summaryStats, []);
                    const blob = new Blob([html], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    success('HTML report generated');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all"
                  aria-label="Generate HTML report"
                >
                  Generate HTML Report
                </button>
                <button
                  onClick={() => setShowPrintView(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-lg transition-all"
                  aria-label="Print view"
                >
                  Print View
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
    
    {/* Alerts Panel */}
    <AlertsPanel data={filteredData} thresholdPercent={thresholdPercent || 20} />
    
    {/* Provider Detail View Modal */}
    {selectedProviderDetail && (
      <ProviderDetailView
        provider={selectedProviderDetail}
        data={filteredData}
        allProviders={allProviders}
        onClose={() => setSelectedProviderDetail(null)}
        onSendMessage={(provider) => {
          setShowCommunication(provider);
          setSelectedProviderDetail(null);
        }}
      />
    )}

    {/* Provider Communication Modal */}
    {showCommunication && (
      <ProviderCommunication
        provider={showCommunication}
        onClose={() => setShowCommunication(null)}
      />
    )}

    {/* Print View */}
    {showPrintView && (
      <PrintView
        data={filteredData}
        stats={summaryStats}
        onClose={() => setShowPrintView(false)}
      />
    )}

    {/* Toast Notifications */}
    <ToastContainer toasts={toasts} onClose={removeToast} />
  </div>
  </ErrorBoundary>
  );
}

export default App;

