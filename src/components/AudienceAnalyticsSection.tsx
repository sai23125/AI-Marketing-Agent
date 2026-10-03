import React from 'react';
import { Users, Trophy, AlertTriangle, ArrowUpDown, TrendingUp } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { AudienceSegment } from '../types/campaign';

export const AudienceAnalyticsSection: React.FC = () => {
  const { analyticsData, settings } = useCampaign();

  if (!analyticsData || !analyticsData.audiences || analyticsData.audiences.length === 0) {
    return null;
  }

  const audiences = analyticsData.audiences;
  const curr = settings.currency_symbol || '₹';

  // Specific objective criteria calculations (Do NOT use arbitrary "best")
  const sortedByCvr = [...audiences].sort((a, b) => b.cvr - a.cvr);
  const highestCvrId = sortedByCvr[0]?.id;

  const sortedByCpa = [...audiences].filter((a) => a.conversions > 0).sort((a, b) => a.cpa - b.cpa);
  const lowestCpaId = sortedByCpa[0]?.id;

  const sortedByCtr = [...audiences].sort((a, b) => b.ctr - a.ctr);
  const highestCtrId = sortedByCtr[0]?.id;

  // Segment needing attention (highest CPA with modest CVR)
  const highestCpaId = sortedByCpa[sortedByCpa.length - 1]?.id;

  // Max values for responsive SVG bar charts
  const maxCvr = Math.max(...audiences.map((a) => a.cvr), 1) * 1.15;
  const maxCpa = Math.max(...audiences.map((a) => a.cpa), 1) * 1.15;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#111827]">
              Audience Analytics
            </h3>
            <p className="text-xs text-gray-500">
              Demographic performance evaluated across isolated objective metrics
            </p>
          </div>
        </div>

        {/* Objective Highlight Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Trophy className="w-3 h-3 text-emerald-600" />
            Highest CVR: {sortedByCvr[0]?.age_group} ({sortedByCvr[0]?.cvr}%)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            Lowest CPA: {sortedByCpa[0]?.age_group} ({curr}{sortedByCpa[0]?.cpa})
          </span>
        </div>
      </div>

      {/* Audience Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-3">Audience Segment</th>
              <th className="py-3 px-3">Reach</th>
              <th className="py-3 px-3">Clicks</th>
              <th className="py-3 px-3">Conversions</th>
              <th className="py-3 px-3">CTR</th>
              <th className="py-3 px-3">CVR</th>
              <th className="py-3 px-3">CPA</th>
              <th className="py-3 px-3">Objective Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {audiences.map((aud) => {
              const isHighestCvr = aud.id === highestCvrId;
              const isLowestCpa = aud.id === lowestCpaId;
              const isHighestCtr = aud.id === highestCtrId;
              const isNeedsAttention = aud.id === highestCpaId;

              return (
                <tr
                  key={aud.id}
                  className="hover:bg-gray-50/80 transition-colors group"
                >
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#111827] text-sm">{aud.segment_name}</div>
                    <div className="text-[11px] text-gray-400">Age: {aud.age_group} • {aud.location}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-gray-700">{aud.reach.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-mono text-gray-700">{aud.clicks.toLocaleString()}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">{aud.conversions.toLocaleString()}</td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-semibold text-gray-800">{aud.ctr}%</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-indigo-700">{aud.cvr}%</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-gray-900">
                    {curr}{aud.cpa.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isHighestCvr && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Highest CVR
                        </span>
                      )}
                      {isLowestCpa && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          Lowest CPA
                        </span>
                      )}
                      {isHighestCtr && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Highest CTR
                        </span>
                      )}
                      {isNeedsAttention && !isLowestCpa && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          Needs Attention
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Comparative Bar Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Chart 1: Conversion Rate by Audience */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-900">
              Conversion Rate by Audience (%)
            </h4>
            <span className="text-[10px] font-semibold text-indigo-600">Higher is better</span>
          </div>

          <div className="space-y-3 pt-2">
            {audiences.map((aud) => {
              const widthPct = Math.round((aud.cvr / maxCvr) * 100);
              return (
                <div key={aud.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-700 font-semibold">{aud.age_group}</span>
                    <span className="font-mono font-bold text-[#111827]">{aud.cvr}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: CPA by Audience */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-gray-900">
              CPA by Audience ({curr})
            </h4>
            <span className="text-[10px] font-semibold text-emerald-600">Lower is better</span>
          </div>

          <div className="space-y-3 pt-2">
            {audiences.map((aud) => {
              const widthPct = Math.round((aud.cpa / maxCpa) * 100);
              const isEfficient = aud.cpa <= settings.cpa_target;
              return (
                <div key={aud.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-gray-700 font-semibold">{aud.age_group}</span>
                    <span className="font-mono font-bold text-[#111827]">
                      {curr}{aud.cpa.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isEfficient ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
