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

      // Calculate trend
      if (providerData.length > 1) {
        const sorted = [...providerData].sort((a, b) => a.week.localeCompare(b.week));
        const mid = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, mid);
        const secondHalf = sorted.slice(mid);
        
        const firstAvg = firstHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, d) => sum + d.percentOver20Min, 0) / secondHalf.length;
        stat.trend = secondAvg - firstAvg;
      }

      return stat;
    });

    const avgPercent = stats.reduce((sum, s) => sum + s.percentOver20Min, 0) / stats.length;
    const topPerformers = [...stats]
      .filter(s => s.percentOver20Min >= 20)
      .sort((a, b) => b.percentOver20Min - a.percentOver20Min)
      .slice(0, 3);
    
    const mostImproved = [...stats]
      .filter(s => s.trend > 0)
      .sort((a, b) => b.trend - a.trend)
      .slice(0, 3);

    const needsAttention = [...stats]
      .filter(s => s.visitsOver20Min > 0 && s.totalVisits > 10)
      .sort((a, b) => a.visitsOver20Min - b.visitsOver20Min)
      .slice(0, 3);

    const insightsList: Array<{ type: string; icon: any; title: string; description: string; color: string }> = [];

    if (topPerformers.length > 0) {
      insightsList.push({
        type: 'top',
        icon: Award,
        title: 'Top Performers',
        description: `${topPerformers.map(p => p.provider).join(', ')} ${topPerformers.length === 1 ? 'has' : 'have'} ${topPerformers[0].percentOver20Min.toFixed(1)}%+ visits over 20 minutes`,
        color: 'text-green-600 bg-green-50 border-green-200',
      });
    }

    if (mostImproved.length > 0) {
      insightsList.push({
        type: 'improved',
        icon: TrendingUp,
        title: 'Most Improved',
        description: `${mostImproved[0].provider} improved by ${mostImproved[0].trend.toFixed(1)}% compared to earlier period`,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
      });
    }

    if (needsAttention.length > 0) {
      const totalVisitsOver20 = needsAttention.reduce((sum, p) => sum + p.visitsOver20Min, 0);
      insightsList.push({
        type: 'attention',
        icon: AlertCircle,
        title: 'Needs Attention',
        description: `${needsAttention.map(p => p.provider).join(', ')} ${needsAttention.length === 1 ? 'has' : 'have'} ${totalVisitsOver20} visit${totalVisitsOver20 === 1 ? '' : 's'} over 20 minutes (lowest counts)`,
        color: 'text-red-600 bg-red-50 border-red-200',
      });
    }

    if (avgPercent < 10) {
      insightsList.push({
        type: 'overall',
        icon: AlertCircle,
        title: 'Overall Performance',
        description: `Team average is ${avgPercent.toFixed(1)}%, below the 20% target. Consider additional training or support.`,
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      });
    }

    return insightsList;
  }, [data]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${insight.color}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

