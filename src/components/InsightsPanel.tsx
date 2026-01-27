import { useMemo } from 'react';
import { ProviderWeekData } from '../types';
import { TrendingUp, Award, AlertCircle } from 'lucide-react';

interface InsightsPanelProps {
  data: ProviderWeekData[];
}

export function InsightsPanel({ data }: InsightsPanelProps) {
  const insights = useMemo(() => {
    if (data.length === 0) return [];

    const providerStats = new Map<string, {
      provider: string;
      totalVisits: number;
      visitsOver20Min: number;
      percentOver20Min: number;
      trend: number;
      weeks: number;
    }>();

    // Calculate stats per provider
    data.forEach(item => {
      const existing = providerStats.get(item.provider);
      if (existing) {
        existing.totalVisits += item.totalVisits;
        existing.visitsOver20Min += item.visitsOver20Min;
        existing.weeks += 1;
      } else {
        providerStats.set(item.provider, {
          provider: item.provider,
          totalVisits: item.totalVisits,
          visitsOver20Min: item.visitsOver20Min,
          percentOver20Min: item.percentOver20Min,
          trend: 0,
          weeks: 1,
        });
      }
    });

    // Calculate trends and final percentages
    const stats = Array.from(providerStats.values()).map(stat => {
      const providerData = data.filter(d => d.provider === stat.provider);
      const totalVisits = providerData.reduce((sum, d) => sum + d.totalVisits, 0);
      const visitsOver20 = providerData.reduce((sum, d) => sum + d.visitsOver20Min, 0);
      stat.visitsOver20Min = visitsOver20;
      stat.percentOver20Min = totalVisits > 0 ? (visitsOver20 / totalVisits) * 100 : 0;

      // Calculate week-over-week trend (compare most recent week vs previous week)
      if (providerData.length > 1) {
        // Sort by week chronologically
        const sorted = [...providerData].sort((a, b) => {
          const weekA = a.week.match(/(\d{1,2})\/(\d{1,2})/);
          const weekB = b.week.match(/(\d{1,2})\/(\d{1,2})/);
          if (!weekA || !weekB) return a.week.localeCompare(b.week);
          
          const monthA = parseInt(weekA[1]);
          const dayA = parseInt(weekA[2]);
          const monthB = parseInt(weekB[1]);
          const dayB = parseInt(weekB[2]);
          
          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        });
        
        // Compare most recent week vs previous week
        const recent = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];
        
        const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
        const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
        
        stat.trend = recentPercent - prevPercent; // Negative is good (decreasing)
      }

      return stat;
    });

    const avgPercent = stats.reduce((sum, s) => sum + s.percentOver20Min, 0) / stats.length;
    
    // Top Performers: Providers with FEWEST visits over 20 minutes (count, not percentage)
    const topPerformers = [...stats]
      .filter(s => s.totalVisits > 10)
      .sort((a, b) => a.visitsOver20Min - b.visitsOver20Min)
      .slice(0, 3);
    
    // Most Improved: Providers with NEGATIVE trend (decreasing % over 20 minutes is good)
    // Calculate week-over-week trend more accurately
    const mostImproved = [...stats]
      .filter(s => {
        const providerData = data.filter(d => d.provider === s.provider);
        if (providerData.length < 2) return false;
        
        // Sort by week chronologically
        const sorted = [...providerData].sort((a, b) => {
          const weekA = a.week.match(/(\d{1,2})\/(\d{1,2})/);
          const weekB = b.week.match(/(\d{1,2})\/(\d{1,2})/);
          if (!weekA || !weekB) return a.week.localeCompare(b.week);
          
          const monthA = parseInt(weekA[1]);
          const dayA = parseInt(weekA[2]);
          const monthB = parseInt(weekB[1]);
          const dayB = parseInt(weekB[2]);
          
          if (monthA !== monthB) return monthA - monthB;
          return dayA - dayB;
        });
        
        // Compare most recent week vs previous week
        const recent = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];
        
        const recentPercent = recent.totalVisits > 0 ? (recent.visitsOver20Min / recent.totalVisits) * 100 : 0;
        const prevPercent = previous.totalVisits > 0 ? (previous.visitsOver20Min / previous.totalVisits) * 100 : 0;
        
        s.trend = recentPercent - prevPercent;
        return s.trend < 0 && s.totalVisits > 10;
      })
      .sort((a, b) => a.trend - b.trend) // Most negative (best improvement)
      .slice(0, 3);

    // Needs Attention: Providers with HIGHEST % over 20 minutes (worst performers)
    const needsAttention = [...stats]
      .filter(s => s.totalVisits > 10)
      .sort((a, b) => b.percentOver20Min - a.percentOver20Min)
      .slice(0, 3);

    const insightsList: Array<{ type: string; icon: any; title: string; description: string; color: string }> = [];

    if (topPerformers.length > 0) {
      insightsList.push({
        type: 'top',
        icon: Award,
        title: 'Top Performers',
        description: `${topPerformers.map(p => p.provider).join(', ')} ${topPerformers.length === 1 ? 'has' : 'have'} the fewest visits over 20 minutes (${topPerformers[0].visitsOver20Min} visit${topPerformers[0].visitsOver20Min === 1 ? '' : 's'})`,
        color: 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700',
      });
    }

    if (mostImproved.length > 0) {
      insightsList.push({
        type: 'improved',
        icon: TrendingUp,
        title: 'Most Improved',
        description: `${mostImproved[0].provider} reduced visits over 20 minutes by ${Math.abs(mostImproved[0].trend).toFixed(1)}% compared to earlier period`,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
      });
    }

    if (needsAttention.length > 0 && needsAttention[0].percentOver20Min > 10) {
      insightsList.push({
        type: 'attention',
        icon: AlertCircle,
        title: 'Needs Attention',
        description: `${needsAttention.map(p => p.provider).join(', ')} ${needsAttention.length === 1 ? 'has' : 'have'} the highest percentage of visits over 20 minutes (${needsAttention[0].percentOver20Min.toFixed(1)}%). Consider additional support or training.`,
        color: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700',
      });
    }

    if (avgPercent > 15) {
      insightsList.push({
        type: 'overall',
        icon: AlertCircle,
        title: 'Overall Performance',
        description: `Team average is ${avgPercent.toFixed(1)}% visits over 20 minutes, which is above the target. Focus on reducing visit duration through training and process improvements.`,
        color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700',
      });
    }

    return insightsList;
  }, [data]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 transition-colors">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Key Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          const gradientColors = [
            'from-green-400 to-emerald-500',
            'from-blue-400 to-indigo-500',
            'from-red-400 to-rose-500',
            'from-amber-400 to-orange-500',
          ];
          const gradient = gradientColors[index % gradientColors.length];
          
          // Improved text colors for better contrast
          const textColors = {
            top: 'text-gray-900 dark:text-gray-100',
            improved: 'text-gray-900 dark:text-gray-100',
            attention: 'text-gray-900 dark:text-gray-100',
            overall: 'text-gray-900 dark:text-gray-100',
          };
          
          return (
            <div
              key={index}
              className={`p-5 rounded-lg border-2 shadow-md hover:shadow-lg transition-all bg-white dark:bg-gray-800 ${insight.color.replace('text-', 'border-')}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient} text-white shadow-lg flex-shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-base mb-2 ${textColors[insight.type as keyof typeof textColors] || 'text-gray-900 dark:text-gray-100'}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-base leading-relaxed ${textColors[insight.type as keyof typeof textColors] || 'text-gray-700 dark:text-gray-300'}`}>
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

