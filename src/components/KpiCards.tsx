import React from 'react';
import {
  Users,
  Eye,
  Heart,
  MousePointerClick,
  CheckCircle,
  Percent,
  Coins,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const KpiCards: React.FC = () => {
  const { analyticsData, settings } = useCampaign();

  if (!analyticsData) return null;

  const { kpis } = analyticsData;
  const curr = settings.currency_symbol || '₹';

  const cards = [
    {
      id: 'reach',
      label: 'Reach',
      value: kpis.reach.toLocaleString(),
      change: `+${kpis.changes.reach_change_pct}%`,
      isPositive: true,
      subtext: 'vs previous period',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bgIcon: 'bg-blue-50 border-blue-100',
    },
    {
      id: 'impressions',
      label: 'Impressions',
      value: kpis.impressions.toLocaleString(),
      change: `+${kpis.changes.impressions_change_pct}%`,
      isPositive: true,
      subtext: 'vs previous period',
      icon: <Eye className="w-5 h-5 text-indigo-600" />,
      bgIcon: 'bg-indigo-50 border-indigo-100',
    },
    {
      id: 'engagement',
      label: 'Engagement',
      value: kpis.engagement.toLocaleString(),
      change: `+${kpis.changes.engagement_change_pct}%`,
      isPositive: true,
      subtext: `${kpis.engagement_rate}% rate`,
      icon: <Heart className="w-5 h-5 text-rose-600" />,
      bgIcon: 'bg-rose-50 border-rose-100',
    },
    {
      id: 'clicks',
      label: 'Clicks',
      value: kpis.clicks.toLocaleString(),
      change: `+${kpis.changes.clicks_change_pct}%`,
      isPositive: true,
      subtext: 'vs previous period',
      icon: <MousePointerClick className="w-5 h-5 text-violet-600" />,
      bgIcon: 'bg-violet-50 border-violet-100',
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: kpis.conversions.toLocaleString(),
      change: `+${kpis.changes.conversions_change_pct}%`,
      isPositive: true,
      subtext: `${kpis.conversion_rate}% CVR`,
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      bgIcon: 'bg-emerald-50 border-emerald-100',
    },
    {
      id: 'ctr',
      label: 'CTR',
      value: `${kpis.ctr}%`,
      change: `↑ ${Math.abs(kpis.changes.ctr_change_pct)}%`,
      isPositive: kpis.changes.ctr_change_pct >= 0,
      subtext: 'vs previous period',
      icon: <Percent className="w-5 h-5 text-amber-600" />,
      bgIcon: 'bg-amber-50 border-amber-100',
    },
    {
      id: 'cpa',
      label: 'CPA',
      value: `${curr}${kpis.cpa.toFixed(2)}`,
      // For CPA, an increase is negative/red, a decrease is positive/green
      change: kpis.changes.cpa_change_pct > 0 ? `↑ ${kpis.changes.cpa_change_pct}%` : `↓ ${Math.abs(kpis.changes.cpa_change_pct)}%`,
      isPositive: kpis.changes.cpa_change_pct <= 0,
      subtext: `Target: ${curr}${settings.cpa_target}`,
      icon: <Coins className="w-5 h-5 text-cyan-600" />,
      bgIcon: 'bg-cyan-50 border-cyan-100',
    },
  ];

  return (
    <section aria-label="Key Performance Indicators">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        {cards.map((card) => {
          const TrendIcon = card.isPositive ? TrendingUp : TrendingDown;
          const badgeClass = card.isPositive
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200';

          return (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
            >
              {/* Top row: Icon + Trend Badge */}
              <div className="flex items-center justify-between gap-1 mb-3">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.bgIcon}`}
                >
                  {card.icon}
                </div>
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
                >
                  <TrendIcon className="w-3 h-3" />
                  <span>{card.change}</span>
                </span>
              </div>

              {/* Metric Label & Large Value */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {card.label}
                </p>
                <h3 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight mt-0.5">
                  {card.value}
                </h3>
              </div>

              {/* Subtext Comparison */}
              <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500 font-medium truncate">
                {card.subtext}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
