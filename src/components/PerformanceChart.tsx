import React, { useState } from 'react';
import { LineChart as ChartIcon, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

type MetricKey = 'reach' | 'impressions' | 'clicks' | 'conversions' | 'spend';

export const PerformanceChart: React.FC = () => {
  const { analyticsData, settings, selectedAppFilter, setSelectedAppFilter } = useCampaign();
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('clicks');
  const [dateFilter, setDateFilter] = useState<'7' | '14' | '30' | 'all'>('30');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!analyticsData || !analyticsData.dailyMetrics) return null;

  const rawData = analyticsData.dailyMetrics;
  const platMetric = selectedAppFilter && analyticsData.platforms
    ? analyticsData.platforms.find((p) => p.platform.toLowerCase() === selectedAppFilter.toLowerCase())
    : null;

  const totalSpend = (analyticsData.platforms || []).reduce((acc, p) => acc + p.spend, analyticsData.kpis.spend || 1);
  const platRatio = platMetric && totalSpend > 0 ? platMetric.spend / totalSpend : 1;
  const platClicksRatio = platMetric && analyticsData.kpis.clicks > 0 ? platMetric.clicks / analyticsData.kpis.clicks : platRatio;
  const platImprRatio = platMetric && analyticsData.kpis.impressions > 0 ? platMetric.impressions / analyticsData.kpis.impressions : platRatio;
  const platConvRatio = platMetric && analyticsData.kpis.conversions > 0 ? platMetric.conversions / analyticsData.kpis.conversions : platRatio;
  const platReachRatio = platMetric && analyticsData.kpis.reach > 0 ? platMetric.reach / analyticsData.kpis.reach : platRatio;

  const sliceData =
    dateFilter === '7'
      ? rawData.slice(-7)
      : dateFilter === '14'
      ? rawData.slice(-14)
      : dateFilter === '30'
      ? rawData.slice(-30)
      : rawData;

  const filteredData = sliceData.map((d) => {
    if (!platMetric) return d;
    return {
      ...d,
      reach: Math.round(d.reach * platReachRatio),
      impressions: Math.round(d.impressions * platImprRatio),
      clicks: Math.round(d.clicks * platClicksRatio),
      conversions: Math.max(0, Math.round(d.conversions * platConvRatio)),
      spend: Math.round(d.spend * platRatio),
    };
  });

  const curr = settings.currency_symbol || '₹';

  const metricConfigs: Record<
    MetricKey,
    { label: string; stroke: string; fill: string; format: (val: number) => string }
  > = {
    reach: {
      label: 'Reach',
      stroke: '#2563EB',
      fill: 'rgba(37, 99, 235, 0.12)',
      format: (v) => v.toLocaleString(),
    },
    impressions: {
      label: 'Impressions',
      stroke: '#6366F1',
      fill: 'rgba(99, 102, 241, 0.12)',
      format: (v) => v.toLocaleString(),
    },
    clicks: {
      label: 'Clicks',
      stroke: '#8B5CF6',
      fill: 'rgba(139, 92, 246, 0.12)',
      format: (v) => v.toLocaleString(),
    },
    conversions: {
      label: 'Conversions',
      stroke: '#10B981',
      fill: 'rgba(16, 185, 129, 0.12)',
      format: (v) => v.toLocaleString(),
    },
    spend: {
      label: 'Spend',
      stroke: '#06B6D4',
      fill: 'rgba(6, 182, 212, 0.12)',
      format: (v) => `${curr}${v.toLocaleString()}`,
    },
  };

  const currentConfig = metricConfigs[selectedMetric];

  // SVG Chart Geometry
  const width = 760;
  const height = 240;
  const paddingX = 40;
  const paddingY = 24;

  const values = filteredData.map((d) => d[selectedMetric] as number);
  const minVal = 0;
  const maxVal = Math.max(...values, 10) * 1.1; // 10% headroom

  const getX = (idx: number) => {
    if (filteredData.length <= 1) return paddingX;
    return paddingX + (idx / (filteredData.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal;
    if (range === 0) return height / 2;
    return height - paddingY - ((val - minVal) / range) * (height - paddingY * 2);
  };

  // Build SVG Path points
  const points = filteredData.map((d, i) => ({
    x: getX(i),
    y: getY(d[selectedMetric] as number),
    val: d[selectedMetric] as number,
    date: d.date,
  }));

  // Create smooth bezier or polyline
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const cur = points[i];
      const cpX1 = prev.x + (cur.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (cur.x - prev.x) / 2;
      const cpY2 = cur.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${cur.x} ${cur.y}`;
    }
  }

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${
          height - paddingY
        } Z`
      : '';

  // Active hover point data
  const activePoint = hoveredIndex !== null && points[hoveredIndex] ? points[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
      {/* Top Controls: Title, Metric switcher, Date range */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              <ChartIcon className="w-4 h-4 text-indigo-600" />
              <span>Campaign Performance</span>
            </h3>
            {selectedAppFilter && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span>{selectedAppFilter} Trajectory</span>
                <button
                  onClick={() => setSelectedAppFilter(null)}
                  className="hover:text-indigo-900 cursor-pointer text-xs leading-none ml-0.5"
                  title="Reset to All Apps"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500">
            {selectedAppFilter
              ? `Daily ${selectedAppFilter} performance metrics and trajectory`
              : 'Daily time series metrics with interactive trajectory'}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-xl border border-gray-200/80">
          {(['reach', 'impressions', 'clicks', 'conversions', 'spend'] as MetricKey[]).map((key) => {
            const isSelected = selectedMetric === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                  isSelected
                    ? 'bg-white text-indigo-700 shadow-xs border border-gray-200'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 text-xs">
          {(['7', '14', '30', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateFilter(range)}
              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                dateFilter === range
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {range === 'all' ? 'All' : `${range}D`}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full pt-4 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = height - paddingY - pct * (height - paddingY * 2);
            const val = minVal + pct * (maxVal - minVal);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-gray-400 font-mono"
                >
                  {currentConfig.format(Math.round(val))}
                </text>
              </g>
            );
          })}

          {/* Area Gradient */}
          <defs>
            <linearGradient id={`grad_${selectedMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.stroke} stopOpacity="0.25" />
              <stop offset="100%" stopColor={currentConfig.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area path */}
          {areaD && <path d={areaD} fill={`url(#grad_${selectedMetric})`} />}

          {/* Line Path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={currentConfig.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair & Points */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              className="cursor-pointer"
            >
              {/* Invisible wide hit area */}
              <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

              {/* Dot indicator */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIndex === idx ? '6' : '3.5'}
                fill="#FFFFFF"
                stroke={currentConfig.stroke}
                strokeWidth={hoveredIndex === idx ? '3' : '2'}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {/* Active Vertical Guideline */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={height - paddingY}
              stroke={currentConfig.stroke}
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.8"
            />
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activePoint && (
          <div
            className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl bg-gray-900 text-white text-xs shadow-lg z-20 transition-all flex flex-col items-center"
            style={{
              left: `${(activePoint.x / width) * 100}%`,
              top: `${(activePoint.y / height) * 100}%`,
              marginTop: '-10px',
            }}
          >
            <div className="font-bold text-white tracking-wide">
              {currentConfig.format(activePoint.val)}
            </div>
            <div className="text-[10px] text-gray-300 font-mono">{activePoint.date}</div>
            <div className="w-2 h-2 bg-gray-900 transform rotate-45 -mb-1 mt-0.5" />
          </div>
        )}
      </div>

      {/* X-axis date labels */}
      <div className="flex items-center justify-between px-6 pt-2 text-[10px] font-mono text-gray-400">
        <span>{filteredData[0]?.date || 'Start'}</span>
        <span>{filteredData[Math.floor(filteredData.length / 2)]?.date || 'Mid'}</span>
        <span>{filteredData[filteredData.length - 1]?.date || 'End'}</span>
      </div>
    </div>
  );
};
