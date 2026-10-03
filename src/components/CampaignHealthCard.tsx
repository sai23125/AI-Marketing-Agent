import React from 'react';
import { Activity, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const CampaignHealthCard: React.FC = () => {
  const { analyticsData } = useCampaign();

  if (!analyticsData) return null;

  const { health } = analyticsData;
  const score = health.overall_score;

  // Status styling
  const statusStyles = {
    Healthy: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      stroke: '#16A34A',
      text: 'text-emerald-700',
    },
    'Needs Optimization': {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      stroke: '#F59E0B',
      text: 'text-amber-700',
    },
    'Critical Attention': {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      stroke: '#DC2626',
      text: 'text-rose-700',
    },
  }[health.status];

  // SVG Circular Gauge calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const breakdownItems = [
    {
      label: 'CTR',
      score: health.breakdown.ctr_score,
      weight: `${Math.round(health.weights.ctr * 100)}% weight`,
      barColor: 'bg-indigo-500',
    },
    {
      label: 'Engagement',
      score: health.breakdown.engagement_score,
      weight: `${Math.round(health.weights.engagement * 100)}% weight`,
      barColor: 'bg-rose-500',
    },
    {
      label: 'Conversion',
      score: health.breakdown.conversion_score,
      weight: `${Math.round(health.weights.conversion * 100)}% weight`,
      barColor: 'bg-amber-500',
    },
    {
      label: 'CPA Efficiency',
      score: health.breakdown.cpa_score,
      weight: `${Math.round(health.weights.cpa * 100)}% weight`,
      barColor: 'bg-cyan-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between h-full">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827]">Campaign Health</h3>
            <p className="text-[11px] text-gray-500">Deterministic scoring model</p>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyles.badge}`}
        >
          {health.status}
        </span>
      </div>

      {/* Main Gauge Visualization */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-4">
        {/* Circular Progress Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
            {/* Background track */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke="#F1F5F9"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated progress stroke */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              stroke={statusStyles.stroke}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold text-[#111827] tracking-tight leading-none">
              {score}
            </span>
            <span className="text-[11px] font-bold text-gray-400 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Health status summary text */}
        <div className="text-center sm:text-left space-y-1 max-w-[200px]">
          <p className="text-xs font-semibold text-gray-700">
            {health.status === 'Healthy'
              ? 'Campaign performing strongly across core funnel dimensions.'
              : health.status === 'Needs Optimization'
              ? 'Conversion bottleneck detected despite healthy reach and click-through.'
              : 'Critical efficiency breakdown across acquisition cost metrics.'}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight">
            Formula: 25% CTR + 20% Eng + 30% CVR + 25% CPA Efficiency
          </p>
        </div>
      </div>

      {/* Sub-breakdown Bars */}
      <div className="space-y-2.5 pt-3 border-t border-gray-100">
        {breakdownItems.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                {item.label}
                <span className="text-[10px] font-normal text-gray-400">({item.weight})</span>
              </span>
              <span className="font-bold text-[#111827]">{item.score}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${item.barColor}`}
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
