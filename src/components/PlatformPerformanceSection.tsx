import React from 'react';
import {
  Share2,
  Smartphone,
  Globe,
  Video,
  Linkedin,
  Layers,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { PlatformMetric } from '../types/campaign';

export const PlatformPerformanceSection: React.FC = () => {
  const {
    analyticsData,
    settings,
    selectedAppFilter,
    setSelectedAppFilter,
    setActiveView,
  } = useCampaign();

  if (!analyticsData || !analyticsData.platforms || analyticsData.platforms.length === 0) {
    return null;
  }

  const platforms = analyticsData.platforms;
  const curr = settings.currency_symbol || '₹';

  const getPlatformIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('instagram')) return <Smartphone className="w-4 h-4 text-pink-600" />;
    if (lower.includes('facebook')) return <Share2 className="w-4 h-4 text-blue-600" />;
    if (lower.includes('google')) return <Globe className="w-4 h-4 text-amber-600" />;
    if (lower.includes('youtube')) return <Video className="w-4 h-4 text-red-600" />;
    if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4 text-blue-700" />;
    return <Layers className="w-4 h-4 text-gray-600" />;
  };

  const totalSpend = platforms.reduce((acc, p) => acc + p.spend, 0);

  const handleCardClick = (platformName: string) => {
    if (selectedAppFilter?.toLowerCase() === platformName.toLowerCase()) {
      setSelectedAppFilter(null);
    } else {
      setSelectedAppFilter(platformName);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                Platform & App Performance
              </h3>
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Click any app to isolate
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Cross-channel comparison — click on Instagram or any other app to view its dedicated analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {selectedAppFilter ? (
            <div className="flex items-center gap-2 bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-xl border border-indigo-200">
              <span className="font-semibold">Filtered by: <strong>{selectedAppFilter}</strong></span>
              <button
                onClick={() => setSelectedAppFilter(null)}
                className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline cursor-pointer ml-1"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="text-gray-500 font-medium">
              Total Spend: <span className="font-bold text-gray-900">{curr}{totalSpend.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Platform Cards Grid (Clickable) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {platforms.map((plat) => {
          const isSelected = selectedAppFilter?.toLowerCase() === plat.platform.toLowerCase();
          const spendShare = totalSpend > 0 ? Math.round((plat.spend / totalSpend) * 100) : 0;
          return (
            <div
              key={plat.platform}
              onClick={() => handleCardClick(plat.platform)}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group relative ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-400 bg-indigo-50/50 shadow-sm scale-[1.02]'
                  : 'border-gray-200/90 bg-[#F8FAFC] hover:border-indigo-300 hover:bg-white'
              }`}
              title={`Click to view ${plat.platform} analytics`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-2xs ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'
                    }`}
                  >
                    {getPlatformIcon(plat.platform)}
                  </div>
                  <span className="font-bold text-xs text-[#111827] truncate">
                    {plat.platform}
                  </span>
                </div>
                {isSelected ? (
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-gray-400 font-semibold">
                    {spendShare}%
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Spend:</span>
                  <span className="font-bold font-mono text-gray-900">{curr}{plat.spend.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Clicks:</span>
                  <span className="font-mono text-gray-800">{plat.clicks.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Conversions:</span>
                  <span className="font-bold font-mono text-indigo-700">{plat.conversions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CTR:</span>
                  <span className="font-mono text-gray-800">{plat.ctr}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-gray-600 font-bold">CPA:</span>
                  <span className={`font-mono font-bold ${plat.cpa <= settings.cpa_target ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {curr}{plat.cpa.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-200/80 text-[10px] font-bold text-indigo-600 group-hover:underline flex items-center justify-between">
                <span>{isSelected ? 'Viewing Analytics' : 'Click to analyze'}</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-channel comparative table with clickable rows */}
      <div className="overflow-x-auto pt-2">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">App / Platform</th>
              <th className="py-2.5 px-3">Spend</th>
              <th className="py-2.5 px-3">Impressions</th>
              <th className="py-2.5 px-3">Clicks</th>
              <th className="py-2.5 px-3">Conversions</th>
              <th className="py-2.5 px-3">CTR</th>
              <th className="py-2.5 px-3">CVR</th>
              <th className="py-2.5 px-3">CPA</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {platforms.map((plat) => {
              const isSelected = selectedAppFilter?.toLowerCase() === plat.platform.toLowerCase();
              return (
                <tr
                  key={plat.platform}
                  onClick={() => handleCardClick(plat.platform)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/70 font-semibold' : 'hover:bg-indigo-50/30'
                  }`}
                >
                  <td className="py-3 px-3 font-bold text-gray-900 flex items-center gap-2">
                    {getPlatformIcon(plat.platform)}
                    <span>{plat.platform}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">
                        Selected
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono">{curr}{plat.spend.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{plat.impressions.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-gray-600">{plat.clicks.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700">{plat.conversions}</td>
                  <td className="py-3 px-3 font-mono">{plat.ctr}%</td>
                  <td className="py-3 px-3 font-mono font-semibold">{plat.cvr}%</td>
                  <td className={`py-3 px-3 font-mono font-bold ${plat.cpa <= settings.cpa_target ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {curr}{plat.cpa.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-[11px] font-bold text-indigo-600 hover:underline">
                      {isSelected ? 'Reset' : 'View App Analytics'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
