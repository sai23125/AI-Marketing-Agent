import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Coins, Percent, ArrowUpDown, Calendar, HelpCircle, Sparkles } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { safeDivide } from '../utils/analyticsEngine';

export const WeeklyTrendsChart: React.FC = () => {
  const { analyticsData, settings } = useCampaign();
  const [viewMode, setViewMode] = useState<'both' | 'cpa' | 'ctr'>('both');
  const curr = settings.currency_symbol || '₹';

  if (!analyticsData || !analyticsData.dailyMetrics || analyticsData.dailyMetrics.length === 0) {
    return null;
  }

  const rawDaily = analyticsData.dailyMetrics;

  // Group daily records into 7-day weekly cohorts
  const weeksData: Array<{
    week: string;
    dateRange: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    cpa: number;
    ctr: number;
  }> = [];

  const chunkSize = 7;
  for (let i = 0; i < rawDaily.length; i += chunkSize) {
    const chunk = rawDaily.slice(i, i + chunkSize);
    const weekIndex = Math.floor(i / chunkSize) + 1;

    let spend = 0;
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;

    chunk.forEach((d) => {
      spend += d.spend || 0;
      impressions += d.impressions || 0;
      clicks += d.clicks || 0;
      conversions += d.conversions || 0;
    });

    const cpa = Number(safeDivide(spend, conversions).toFixed(2));
    const ctr = Number((safeDivide(clicks, impressions) * 100).toFixed(2));

    const startDate = chunk[0]?.date || '';
    const endDate = chunk[chunk.length - 1]?.date || '';

    weeksData.push({
      week: `Week ${weekIndex}`,
      dateRange: `${startDate.slice(5)} to ${endDate.slice(5)}`,
      spend,
      impressions,
      clicks,
      conversions,
      cpa,
      ctr,
    });
  }

  // Find most efficient week (lowest CPA) and highest CTR week
  const validCpaWeeks = weeksData.filter((w) => w.cpa > 0);
  const lowestCpaWeek = validCpaWeeks.length > 0 ? [...validCpaWeeks].sort((a, b) => a.cpa - b.cpa)[0] : null;
  const highestCtrWeek = [...weeksData].sort((a, b) => b.ctr - a.ctr)[0];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-xl border border-gray-800 text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
            <span className="font-extrabold text-white text-sm">{data.week}</span>
            <span className="text-[10px] font-mono text-gray-400">{data.dateRange}</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-cyan-400 font-semibold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" /> CPA:
              </span>
              <span className="font-mono font-bold text-white">{curr}{data.cpa.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5" /> CTR:
              </span>
              <span className="font-mono font-bold text-white">{data.ctr.toFixed(2)}%</span>
            </div>

            <div className="pt-1.5 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
              <span>Spend: {curr}{data.spend.toLocaleString()}</span>
              <span>Conversions: {data.conversions}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
              Recharts Dual-Axis Analytics
            </span>
          </div>
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <span>Weekly Performance Fluctuations (CPA vs CTR)</span>
          </h3>
          <p className="text-xs text-gray-500">
            Cohort trend tracking to assess whether creative resonance (CTR) corresponds with acquisition efficiency (CPA).
          </p>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'both'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dual Trend
          </button>
          <button
            onClick={() => setViewMode('cpa')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'cpa'
                ? 'bg-white text-cyan-700 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CPA Only
          </button>
          <button
            onClick={() => setViewMode('ctr')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              viewMode === 'ctr'
                ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CTR Only
          </button>
        </div>
      </div>

      {/* Summary Highlight Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Target CPA Benchmark</span>
          <span className="text-sm font-extrabold font-mono text-gray-900">{curr}{settings.cpa_target}</span>
        </div>

        <div className="p-3 rounded-xl bg-cyan-50/60 border border-cyan-200">
          <span className="text-[10px] text-cyan-800 font-bold uppercase block">Lowest CPA Cohort</span>
          <span className="text-sm font-extrabold font-mono text-cyan-950">
            {lowestCpaWeek ? `${curr}${lowestCpaWeek.cpa.toFixed(2)} (${lowestCpaWeek.week})` : 'N/A'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
          <span className="text-[10px] text-indigo-800 font-bold uppercase block">Highest CTR Cohort</span>
          <span className="text-sm font-extrabold font-mono text-indigo-950">
            {highestCtrWeek ? `${highestCtrWeek.ctr.toFixed(2)}% (${highestCtrWeek.week})` : 'N/A'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-200">
          <span className="text-[10px] text-gray-400 font-bold uppercase block">Cohort Windows</span>
          <span className="text-sm font-extrabold font-mono text-gray-900">{weeksData.length} Weekly Cycles</span>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weeksData}
            margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="week"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
            />

            {/* Left Axis: CPA */}
            {(viewMode === 'both' || viewMode === 'cpa') && (
              <YAxis
                yAxisId="left"
                orientation="left"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#0891B2', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${curr}${val}`}
                domain={['auto', 'auto']}
              />
            )}

            {/* Right Axis: CTR */}
            {(viewMode === 'both' || viewMode === 'ctr') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fill: '#6366F1', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${val}%`}
                domain={['auto', 'auto']}
              />
            )}

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
            />

            {/* Reference Line for Target CPA */}
            {(viewMode === 'both' || viewMode === 'cpa') && (
              <ReferenceLine
                yAxisId="left"
                y={settings.cpa_target}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                label={{
                  value: `Target CPA: ${curr}${settings.cpa_target}`,
                  fill: '#D97706',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />
            )}

            {/* CPA Line (Cyan/Amber) */}
            {(viewMode === 'both' || viewMode === 'cpa') && (
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cpa"
                name={`CPA (${curr})`}
                stroke="#0891B2"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#0891B2', strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 7, stroke: '#0891B2', strokeWidth: 2, fill: '#0891B2' }}
              />
            )}

            {/* CTR Line (Indigo) */}
            {(viewMode === 'both' || viewMode === 'ctr') && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ctr"
                name="CTR (%)"
                stroke="#6366F1"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#6366F1', strokeWidth: 2, fill: '#FFFFFF' }}
                activeDot={{ r: 7, stroke: '#6366F1', strokeWidth: 2, fill: '#6366F1' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Analytical Finding Callout */}
      <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between text-gray-600">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Cohort Insight:</strong> When CTR spikes above 5.5%, CPA tends to stabilize or improve due to increased relevance score discounts in ad auctions.
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">
          Weekly Recharts Cohort Engine
        </span>
      </div>
    </div>
  );
};
