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
      icon: stats.trend === 'down' ? TrendingDown : stats.trend === 'up' ? TrendingUp : Minus,
      trend: stats.trend,
    },
  ];

  const cardColors = [
    { bg: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20', border: 'border-blue-200 dark:border-blue-800', accent: 'text-blue-600 dark:text-blue-400' },
    { bg: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20', border: 'border-emerald-200 dark:border-emerald-800', accent: 'text-emerald-600 dark:text-emerald-400' },
    { bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', border: 'border-purple-200 dark:border-purple-800', accent: 'text-purple-600 dark:text-purple-400' },
    { bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20', border: 'border-amber-200 dark:border-amber-800', accent: 'text-amber-600 dark:text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const colorScheme = cardColors[index % cardColors.length];
        return (
          <div
            key={index}
            className={`${colorScheme.bg} rounded-lg shadow-md border-2 ${colorScheme.border} p-6 transition-all hover:shadow-lg hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${colorScheme.accent}`}>{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{card.value}</p>
              </div>
              {card.icon && (
                <div
                  className={`p-3 rounded-full transition-colors ${
                    card.trend === 'down'
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg'
                      : card.trend === 'up'
                      ? 'bg-gradient-to-br from-red-400 to-rose-500 text-white shadow-lg'
                      : 'bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 text-white'
                  }`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

