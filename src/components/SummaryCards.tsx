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
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
            {card.icon && (
              <div
                className={`p-3 rounded-full ${
                  card.trend === 'up'
                    ? 'bg-green-100 text-green-600'
                    : card.trend === 'down'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
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

