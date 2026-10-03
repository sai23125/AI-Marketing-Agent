import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Coins,
  MousePointerClick,
  Users,
  Eye,
  Percent,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Share2,
  Globe,
  Video,
  Linkedin,
  Layers,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Target,
  Zap,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { PerformanceChart } from './PerformanceChart';
import { AudienceAnalyticsSection } from './AudienceAnalyticsSection';
import { PlatformPerformanceSection } from './PlatformPerformanceSection';

export const DetailedAnalyticsView: React.FC = () => {
  const { analyticsData, settings, selectedAppFilter, setSelectedAppFilter } = useCampaign();

  if (!analyticsData) return null;

  const { kpis, health, platforms = [] } = analyticsData;
  const curr = settings.currency_symbol || '₹';

  // Helper for platform icon
  const getAppIcon = (name: string, className = 'w-4 h-4') => {
    const lower = name.toLowerCase();
    if (lower.includes('instagram')) return <Smartphone className={`${className} text-pink-600`} />;
    if (lower.includes('facebook')) return <Share2 className={`${className} text-blue-600`} />;
    if (lower.includes('google')) return <Globe className={`${className} text-amber-600`} />;
    if (lower.includes('youtube')) return <Video className={`${className} text-red-600`} />;
    if (lower.includes('linkedin')) return <Linkedin className={`${className} text-blue-700`} />;
    return <Layers className={`${className} text-indigo-600`} />;
  };

  // Find currently active platform data if an app is selected
  const activePlatform = selectedAppFilter
    ? platforms.find((p) => p.platform.toLowerCase() === selectedAppFilter.toLowerCase())
    : null;

  // Compute metrics depending on whether an individual app or all apps are selected
  const totalCampaignSpend = platforms.reduce((acc, p) => acc + p.spend, kpis.spend || 1);
  const totalCampaignConversions = platforms.reduce((acc, p) => acc + p.conversions, kpis.conversions || 1);

  const displayMetrics = activePlatform
    ? {
        name: activePlatform.platform,
        reach: activePlatform.reach,
        impressions: activePlatform.impressions,
        clicks: activePlatform.clicks,
        conversions: activePlatform.conversions,
        spend: activePlatform.spend,
        engagement: activePlatform.engagement,
        ctr: activePlatform.ctr,
        cvr: activePlatform.cvr,
        cpa: activePlatform.cpa,
        cpc: activePlatform.cpc,
        cpm: activePlatform.impressions > 0 ? (activePlatform.spend / activePlatform.impressions) * 1000 : 0,
        engagement_rate:
          activePlatform.impressions > 0
            ? Number(((activePlatform.engagement / activePlatform.impressions) * 100).toFixed(2))
            : 0,
        cpe: activePlatform.engagement > 0 ? activePlatform.spend / activePlatform.engagement : 0,
        spendShare: totalCampaignSpend > 0 ? ((activePlatform.spend / totalCampaignSpend) * 100).toFixed(1) : '0',
        conversionShare:
          totalCampaignConversions > 0
            ? ((activePlatform.conversions / totalCampaignConversions) * 100).toFixed(1)
            : '0',
      }
    : {
        name: 'All Apps (Combined)',
        reach: kpis.reach,
        impressions: kpis.impressions,
        clicks: kpis.clicks,
        conversions: kpis.conversions,
        spend: kpis.spend,
        engagement: kpis.engagement,
        ctr: kpis.ctr,
        cvr: kpis.conversion_rate,
        cpa: kpis.cpa,
        cpc: kpis.cpc,
        cpm: kpis.cpm,
        engagement_rate: kpis.engagement_rate,
        cpe: kpis.engagement > 0 ? kpis.spend / kpis.engagement : 0,
        spendShare: '100',
        conversionShare: '100',
      };

  const sections = [
    {
      title: activePlatform ? `${displayMetrics.name} Traffic Metrics` : 'Traffic Metrics',
      description: 'Reach, Impressions, and CPM delivery efficiency',
      metrics: [
        {
          label: 'Total Reach',
          value: displayMetrics.reach.toLocaleString(),
          sub: activePlatform ? `${displayMetrics.name} unique users` : 'Unique users across all apps',
          formula: 'Distinct audience IDs',
        },
        {
          label: 'Impressions',
          value: displayMetrics.impressions.toLocaleString(),
          sub: `${(displayMetrics.impressions / (displayMetrics.reach || 1)).toFixed(1)}x frequency`,
          formula: 'Total ad serves',
        },
        {
          label: 'CPM',
          value: `${curr}${displayMetrics.cpm.toFixed(2)}`,
          sub: 'Cost per 1,000 impressions',
          formula: '(Spend / Impressions) × 1000',
        },
      ],
    },
    {
      title: activePlatform ? `${displayMetrics.name} Engagement Metrics` : 'Engagement Metrics',
      description: 'Audience interaction, resonance, and attention depth',
      metrics: [
        {
          label: 'Engagement Events',
          value: displayMetrics.engagement.toLocaleString(),
          sub: 'Likes, shares, saves, comments',
          formula: 'Verified interaction events',
        },
        {
          label: 'Engagement Rate',
          value: `${displayMetrics.engagement_rate}%`,
          sub: `Benchmark: ${settings.engagement_threshold}%`,
          formula: '(Engagement / Impressions) × 100',
        },
        {
          label: 'Cost Per Engagement',
          value: `${curr}${displayMetrics.cpe.toFixed(2)}`,
          sub: 'Average interaction cost',
          formula: 'Spend / Engagement',
        },
      ],
    },
    {
      title: activePlatform ? `${displayMetrics.name} Conversion Metrics` : 'Conversion Metrics',
      description: 'Click-through rates and downstream transactional conversion',
      metrics: [
        {
          label: 'Total Clicks',
          value: displayMetrics.clicks.toLocaleString(),
          sub: 'Landing page sessions',
          formula: 'Direct ad click actions',
        },
        {
          label: 'Click-Through Rate (CTR)',
          value: `${displayMetrics.ctr}%`,
          sub: `Target threshold: >${settings.ctr_warning_threshold}%`,
          formula: '(Clicks / Impressions) × 100',
        },
        {
          label: 'Total Conversions',
          value: displayMetrics.conversions.toLocaleString(),
          sub: `${displayMetrics.cvr}% conversion rate`,
          formula: 'Completed acquisition actions',
        },
        {
          label: 'Conversion Rate (CVR)',
          value: `${displayMetrics.cvr}%`,
          sub: `Target benchmark: >${settings.cvr_warning_threshold}%`,
          formula: '(Conversions / Clicks) × 100',
        },
      ],
    },
    {
      title: activePlatform ? `${displayMetrics.name} Cost & Efficiency` : 'Cost & Efficiency Metrics',
      description: 'Unit economics and return on marketing ad spend',
      metrics: [
        {
          label: 'Platform Spend',
          value: `${curr}${displayMetrics.spend.toLocaleString()}`,
          sub: activePlatform ? `${displayMetrics.spendShare}% of total campaign budget` : 'Direct ad investment',
          formula: 'Channel media charges',
        },
        {
          label: 'Cost Per Click (CPC)',
          value: `${curr}${displayMetrics.cpc.toFixed(2)}`,
          sub: 'Average session cost',
          formula: 'Spend / Clicks',
        },
        {
          label: 'Cost Per Acquisition (CPA)',
          value: `${curr}${displayMetrics.cpa.toFixed(2)}`,
          sub: `Target benchmark: ${curr}${settings.cpa_target}`,
          formula: 'Spend / Conversions',
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header with Health Score */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Deterministic Analytics Engine
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Detailed Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Filter analytics by clicking on any app below or view the cross-channel blended overview.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 font-semibold flex items-center gap-2">
          <span>Overall Health: </span>
          <span className="text-sm font-extrabold text-indigo-700">{health.overall_score}/100</span>
          <span className="text-indigo-400">•</span>
          <span>{health.status}</span>
        </div>
      </div>

      {/* 2. Interactive App Selector Bar (Click any app to view its analytics) */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select App to View Analytics</span>
          </span>
          {activePlatform && (
            <button
              onClick={() => setSelectedAppFilter(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to All Apps</span>
            </button>
          )}
        </div>

        {/* App Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Button: All Apps (Combined) */}
          <button
            onClick={() => setSelectedAppFilter(null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedAppFilter === null
                ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Apps (Combined)</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                selectedAppFilter === null ? 'bg-indigo-700/70 text-indigo-100' : 'bg-gray-200 text-gray-600'
              }`}
            >
              100%
            </span>
          </button>

          {/* Individual Platform/App Buttons */}
          {platforms.map((plat) => {
            const isSelected = selectedAppFilter?.toLowerCase() === plat.platform.toLowerCase();
            const spendShare = totalCampaignSpend > 0 ? Math.round((plat.spend / totalCampaignSpend) * 100) : 0;
            return (
              <button
                key={plat.platform}
                onClick={() => setSelectedAppFilter(plat.platform)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-[1.02]'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 border border-gray-200'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center ${
                    isSelected ? 'bg-white/20' : 'bg-white border border-gray-200'
                  }`}
                >
                  {getAppIcon(plat.platform, 'w-3.5 h-3.5')}
                </div>
                <span>{plat.platform}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isSelected ? 'bg-indigo-700/80 text-white' : 'bg-gray-200/80 text-gray-600'
                  }`}
                >
                  {curr}{Math.round(plat.spend / 1000)}k ({spendShare}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. App Spotlight Card (When an app like Instagram is clicked) */}
      {activePlatform && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/5 rounded-full pointer-events-none blur-2xl" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono">
                  App Isolated Analytics
                </span>
                {activePlatform.cpa <= settings.cpa_target ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ✓ High Efficiency Channel
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    ⚠ Needs Cost Optimization
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  {getAppIcon(activePlatform.platform, 'w-6 h-6 text-white')}
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-white">
                    {activePlatform.platform} Analytics
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Showing dedicated metrics, funnel conversion, and unit economics for {activePlatform.platform}.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick KPI pills for the active app */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] uppercase text-indigo-200 block">App Spend</span>
                <span className="text-base font-black text-white font-mono">
                  {curr}{activePlatform.spend.toLocaleString()}
                </span>
                <span className="text-[10px] text-indigo-300 block mt-0.5">
                  {displayMetrics.spendShare}% of budget
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] uppercase text-indigo-200 block">Conversions</span>
                <span className="text-base font-black text-white font-mono">
                  {activePlatform.conversions}
                </span>
                <span className="text-[10px] text-indigo-300 block mt-0.5">
                  {displayMetrics.conversionShare}% of total
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] uppercase text-indigo-200 block">App CTR</span>
                <span className="text-base font-black text-white font-mono">
                  {activePlatform.ctr}%
                </span>
                <span className="text-[10px] text-indigo-300 block mt-0.5">
                  {activePlatform.clicks.toLocaleString()} clicks
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[10px] uppercase text-indigo-200 block">App CPA</span>
                <span className="text-base font-black text-white font-mono">
                  {curr}{activePlatform.cpa.toFixed(2)}
                </span>
                <span className="text-[10px] text-indigo-300 block mt-0.5">
                  {activePlatform.cpa <= settings.cpa_target ? 'Beats target' : 'Above target'}
                </span>
              </div>
            </div>
          </div>

          {/* App Funnel Visual Progression for selected app */}
          <div className="mt-5 pt-4 border-t border-white/15">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200 block mb-2">
              {activePlatform.platform} Acquisition Funnel Flow
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 block uppercase">1. Impressions</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {activePlatform.impressions.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-indigo-300">Top of Funnel</span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 block uppercase">2. Clicks (CTR)</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {activePlatform.clicks.toLocaleString()} ({activePlatform.ctr}%)
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-mono">
                  {activePlatform.ctr}% through
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 block uppercase">3. Conversions (CVR)</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {activePlatform.conversions} ({activePlatform.cvr}%)
                  </span>
                </div>
                <span className="text-xs text-indigo-200 font-mono">
                  CPA: {curr}{activePlatform.cpa.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Performance Time-series chart */}
      <PerformanceChart />

      {/* 5. Granular Metric Dimension Cards (Traffic, Engagement, Conversion, Cost) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((sec) => (
          <div
            key={sec.title}
            className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-[#111827]">{sec.title}</h3>
              <p className="text-xs text-gray-500">{sec.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sec.metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-3.5 rounded-xl bg-[#F8FAFC] border border-gray-200 flex flex-col justify-between"
                >
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    {m.label}
                  </div>
                  <div className="text-xl font-black text-[#111827] tracking-tight mt-1">
                    {m.value}
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200/80 flex items-center justify-between text-[10px] text-gray-500">
                    <span className="truncate">{m.sub}</span>
                    <span className="font-mono text-gray-400 ml-1 shrink-0" title={m.formula}>
                      {m.formula}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 6. Audience Analytics Sub-Section */}
      <AudienceAnalyticsSection />

      {/* 7. Platform Performance Sub-Section (Clickable Cards & Table) */}
      <PlatformPerformanceSection />
    </div>
  );
};
