import React from 'react';
import { Filter, ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const MarketingFunnelCard: React.FC = () => {
  const { analyticsData } = useCampaign();

  if (!analyticsData) return null;

  const { funnel, kpis } = analyticsData;

  const stages = [
    {
      name: 'Reach',
      count: funnel.reach,
      unit: 'Unique users',
      barColor: 'bg-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      widthPct: 100,
    },
    {
      name: 'Impressions',
      count: funnel.impressions,
      unit: 'Ad exposures',
      barColor: 'bg-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-900',
      widthPct: 88,
      transitionRate: `${((funnel.impressions / (funnel.reach || 1))).toFixed(1)}x frequency`,
      transitionLabel: 'Ad Exposure Frequency',
    },
    {
      name: 'Clicks',
      count: funnel.clicks,
      unit: 'Site visits',
      barColor: 'bg-violet-600',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-900',
      widthPct: 62,
      transitionRate: `${funnel.impression_to_click_rate}%`,
      transitionLabel: 'Impression → Click (CTR)',
    },
    {
      name: 'Conversions',
      count: funnel.conversions,
      unit: 'Completed outcomes',
      barColor: 'bg-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-900',
      widthPct: 40,
      transitionRate: `${funnel.click_to_conversion_rate}%`,
      transitionLabel: 'Click → Conversion (CVR)',
      isBottleneck: funnel.click_to_conversion_rate < 8.0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Marketing Funnel</h3>
            <p className="text-[11px] text-gray-500">Stage progression & leak detection</p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          Reach to Conv: {funnel.reach_to_conversion_rate}%
        </span>
      </div>

      {/* Funnel Stages */}
      <div className="py-4 space-y-3">
        {stages.map((stage, idx) => (
          <div key={stage.name} className="space-y-1">
            {/* Step transition pill if not first */}
            {idx > 0 && (
              <div className="flex items-center justify-center -my-1 py-1">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    stage.isBottleneck
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-gray-100 text-gray-700 border-gray-200'
                  }`}
                >
                  <ArrowDown className="w-3 h-3 text-gray-400" />
                  <span>{stage.transitionLabel}:</span>
                  <span className="text-indigo-600 font-extrabold">{stage.transitionRate}</span>
                </div>
              </div>
            )}

            {/* Stage Bar */}
            <div
              className={`rounded-xl p-3 border border-gray-200/80 shadow-2xs transition-all hover:border-indigo-300 ${stage.bgColor}`}
              style={{
                width: `${stage.widthPct}%`,
                margin: '0 auto',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-[#111827]">{stage.name}</div>
                  <div className="text-[10px] text-gray-500">{stage.unit}</div>
                </div>
                <div className="text-right">
                  <div className="text-base sm:text-lg font-black text-[#111827] tracking-tight">
                    {stage.count.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Funnel Bottleneck Insight Footer */}
      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200 text-xs flex items-start gap-2.5 mt-2">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] text-gray-600 leading-snug">
          <strong className="text-gray-900 font-bold">Identified Bottleneck: </strong>
          The largest conversion drop-off is between <span className="font-semibold text-indigo-700">Clicks ({kpis.clicks.toLocaleString()})</span> and{' '}
          <span className="font-semibold text-indigo-700">Conversions ({kpis.conversions.toLocaleString()})</span> at {funnel.click_to_conversion_rate}%.
        </div>
      </div>
    </div>
  );
};
