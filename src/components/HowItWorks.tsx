import { BarChart3, TrendingUp, Filter, Target, Users, Zap } from 'lucide-react';

export function HowItWorks() {
  const features = [
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics',
      description: 'Visualize provider performance with multiple chart types including line charts, bar charts, scatter plots, and heatmaps.',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Filter,
      title: 'Advanced Filtering',
      description: 'Filter by providers, date ranges, performance tiers, visit volumes, trends, and more to focus on what matters.',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analysis',
      description: 'Track week-over-week trends, identify improving or declining providers, and compare performance over time.',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: Target,
      title: 'Goal Tracking',
      description: 'Monitor progress toward the 20% target with goal progress charts and performance tier classifications.',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      icon: Users,
      title: 'Provider Comparison',
      description: 'Compare multiple providers side-by-side, identify top performers, and benchmark against team averages.',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      icon: Zap,
      title: 'Real-Time Insights',
      description: 'Get instant insights with automated analysis highlighting top performers, most improved, and areas needing attention.',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  const benefits = [
    {
      title: 'Data-Driven Decisions',
      description: 'Make informed decisions based on comprehensive analytics and visual data representations.',
    },
    {
      title: 'Identify Patterns',
      description: 'Quickly spot trends, outliers, and correlations between visit volume and performance metrics.',
    },
    {
      title: 'Performance Management',
      description: 'Easily identify which providers need support and recognize top performers for their achievements.',
    },
    {
      title: 'Time Savings',
      description: 'Automated analysis and visualizations save hours of manual data processing and report generation.',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How This Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            The Provider Analytics Dashboard helps you understand provider performance through comprehensive data visualization and analysis. 
            Upload your Excel file or use the default data to get started.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${feature.color} flex-shrink-0`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Key Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Data</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The dashboard automatically loads your Excel file, or you can upload a new one anytime.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Apply Filters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the filter panel to focus on specific providers, time periods, or performance criteria.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-3">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analyze & Export</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore visualizations, review insights, and export data for reporting or further analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

