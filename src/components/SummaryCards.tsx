import { SummaryStats } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SummaryCardsProps {
  stats: SummaryStats;
}

export function SummaryCards({ stats }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Providers',
      value: stats.totalProviders,
      icon: null,
      trend: null,
    },
    {
      title: 'Avg % Over 20 Min',
      value: `${stats.avgPercentOver20Min.toFixed(1)}%`,
      icon: stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus,
      trend: stats.trend,
      trendValue: stats.trendValue,
    },
    {
      title: 'Total Visits',
      value: stats.totalVisits.toLocaleString(),
      icon: null,
      trend: null,
    },
    {
      title: 'Trend',
      value: stats.trendValue !== 0 ? `${stats.trendValue > 0 ? '+' : ''}${stats.trendValue.toFixed(1)}%` : 'No change',
      icon: stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus,
      trend: stats.trend,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
            </div>
            {card.icon && (
              <div
                className={`p-3 rounded-full transition-colors ${
                  card.trend === 'up'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : card.trend === 'down'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                <card.icon className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

