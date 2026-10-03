import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Download,
  FolderOpen,
  DollarSign,
  Coins,
  Percent,
  Sliders,
  ChevronRight,
  Info,
  FileDown,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { api } from '../services/api';
import { Campaign, CalculatedKPIs, CampaignHealth } from '../types/campaign';
import { calculateKPIs, calculateHealthScore, safeDivide } from '../utils/analyticsEngine';
import { INITIAL_DEMO_DATA_PACKAGES } from '../data/demoCampaigns';
import { generateComparisonPdf } from '../utils/pdfGenerator';

export const CompareCampaignsView: React.FC = () => {
  const { campaigns, settings, showToast, setActiveView, selectCampaign } = useCampaign();
  const curr = settings.currency_symbol || '₹';

  // Selected campaigns state
  const [campaignAId, setCampaignAId] = useState<string>('camp_summer_sale_2026');
  const [campaignBId, setCampaignBId] = useState<string>('camp_b2b_leadgen_2026');

  // Loaded analytics data
  const [dataA, setDataA] = useState<{ campaign: Campaign; kpis: CalculatedKPIs; health: CampaignHealth } | null>(null);
  const [dataB, setDataB] = useState<{ campaign: Campaign; kpis: CalculatedKPIs; health: CampaignHealth } | null>(null);
  const [loadingA, setLoadingA] = useState<boolean>(true);
  const [loadingB, setLoadingB] = useState<boolean>(true);

  // Revenue & ROI custom value simulation
  const [aovA, setAovA] = useState<number>(850); // Average Order/Conversion Value for Campaign A
  const [aovB, setAovB] = useState<number>(3500); // Average Order/Conversion Value for Campaign B

  // Load campaign A data
  useEffect(() => {
    loadCampaignData(campaignAId, (result) => {
      setDataA(result);
      setLoadingA(false);
    });
  }, [campaignAId, settings]);

  // Load campaign B data
  useEffect(() => {
    loadCampaignData(campaignBId, (result) => {
      setDataB(result);
      setLoadingB(false);
    });
  }, [campaignBId, settings]);

  // Ensure default campaign selection
  useEffect(() => {
    if (campaigns.length > 1 && campaignAId === campaignBId) {
      const other = campaigns.find((c) => c.id !== campaignAId);
      if (other) setCampaignBId(other.id);
    }
  }, [campaigns, campaignAId, campaignBId]);

  const loadCampaignData = async (
    id: string,
    callback: (res: { campaign: Campaign; kpis: CalculatedKPIs; health: CampaignHealth }) => void
  ) => {
    try {
      const res = await api.getCampaignAnalytics(id);
      if (res && res.kpis) {
        callback({
          campaign: res.campaign,
          kpis: res.kpis,
          health: res.health,
        });
        return;
      }
    } catch {
      // Local fallback
    }

    const pkg = INITIAL_DEMO_DATA_PACKAGES[id] || INITIAL_DEMO_DATA_PACKAGES['camp_summer_sale_2026'];
    const kpis = calculateKPIs(pkg.dailyMetrics);
    const health = calculateHealthScore(kpis, settings);
    callback({
      campaign: pkg.campaign,
      kpis,
      health,
    });
  };

  // Swap campaign A and B
  const handleSwap = () => {
    const tempId = campaignAId;
    const tempAov = aovA;
    setCampaignAId(campaignBId);
    setCampaignBId(tempId);
    setAovA(aovB);
    setAovB(tempAov);
    showToast('Swapped campaign comparison order', 'info');
  };

  if (!dataA || !dataB) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <p className="text-gray-500 text-sm">Loading campaign comparison data...</p>
      </div>
    );
  }

  // Calculate simulated revenue & ROI
  const revA = dataA.kpis.conversions * aovA;
  const roiA = dataA.kpis.spend > 0 ? Number((((revA - dataA.kpis.spend) / dataA.kpis.spend) * 100).toFixed(1)) : 0;
  const roasA = dataA.kpis.spend > 0 ? Number((revA / dataA.kpis.spend).toFixed(2)) : 0;

  const revB = dataB.kpis.conversions * aovB;
  const roiB = dataB.kpis.spend > 0 ? Number((((revB - dataB.kpis.spend) / dataB.kpis.spend) * 100).toFixed(1)) : 0;
  const roasB = dataB.kpis.spend > 0 ? Number((revB / dataB.kpis.spend).toFixed(2)) : 0;

  // Comparison metrics rows definition
  interface MetricRow {
    key: string;
    label: string;
    description: string;
    valA: number;
    valB: number;
    format: (v: number) => string;
    higherIsBetter: boolean;
    isCurrency?: boolean;
    isPercentage?: boolean;
  }

  const metricRows: MetricRow[] = [
    {
      key: 'cpa',
      label: 'CPA (Cost Per Acquisition)',
      description: 'Spend / Conversions — Average cost per converted outcome',
      valA: dataA.kpis.cpa,
      valB: dataB.kpis.cpa,
      format: (v) => `${curr}${v.toFixed(2)}`,
      higherIsBetter: false, // lower is better
      isCurrency: true,
    },
    {
      key: 'ctr',
      label: 'CTR (Click-Through Rate)',
      description: '(Clicks / Impressions) × 100 — Creative click resonance',
      valA: dataA.kpis.ctr,
      valB: dataB.kpis.ctr,
      format: (v) => `${v.toFixed(2)}%`,
      higherIsBetter: true,
      isPercentage: true,
    },
    {
      key: 'cvr',
      label: 'CVR (Conversion Rate)',
      description: '(Conversions / Clicks) × 100 — Destination page conversion efficiency',
      valA: dataA.kpis.conversion_rate,
      valB: dataB.kpis.conversion_rate,
      format: (v) => `${v.toFixed(2)}%`,
      higherIsBetter: true,
      isPercentage: true,
    },
    {
      key: 'roi',
      label: 'ROI (Return on Investment)',
      description: '((Estimated Revenue - Spend) / Spend) × 100',
      valA: roiA,
      valB: roiB,
      format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`,
      higherIsBetter: true,
      isPercentage: true,
    },
    {
      key: 'roas',
      label: 'ROAS (Return on Ad Spend)',
      description: 'Estimated Revenue / Spend',
      valA: roasA,
      valB: roasB,
      format: (v) => `${v.toFixed(2)}x`,
      higherIsBetter: true,
    },
    {
      key: 'health',
      label: 'Campaign Health Score',
      description: '0.25(CTR) + 0.20(Eng) + 0.30(CVR) + 0.25(CPA Efficiency)',
      valA: dataA.health.overall_score,
      valB: dataB.health.overall_score,
      format: (v) => `${v}/100`,
      higherIsBetter: true,
    },
    {
      key: 'cpc',
      label: 'CPC (Cost Per Click)',
      description: 'Spend / Clicks — Unit traffic cost',
      valA: dataA.kpis.cpc,
      valB: dataB.kpis.cpc,
      format: (v) => `${curr}${v.toFixed(2)}`,
      higherIsBetter: false, // lower is better
      isCurrency: true,
    },
    {
      key: 'cpm',
      label: 'CPM (Cost Per Mille)',
      description: '(Spend / Impressions) × 1000 — Auction pricing per 1,000 views',
      valA: dataA.kpis.cpm,
      valB: dataB.kpis.cpm,
      format: (v) => `${curr}${v.toFixed(2)}`,
      higherIsBetter: false, // lower is better
      isCurrency: true,
    },
    {
      key: 'engagement_rate',
      label: 'Engagement Rate',
      description: '(Engagement / Impressions) × 100',
      valA: dataA.kpis.engagement_rate,
      valB: dataB.kpis.engagement_rate,
      format: (v) => `${v.toFixed(2)}%`,
      higherIsBetter: true,
      isPercentage: true,
    },
    {
      key: 'spend',
      label: 'Total Spend',
      description: 'Cumulative advertising investment',
      valA: dataA.kpis.spend,
      valB: dataB.kpis.spend,
      format: (v) => `${curr}${v.toLocaleString()}`,
      higherIsBetter: false,
      isCurrency: true,
    },
    {
      key: 'conversions',
      label: 'Total Conversions',
      description: 'Total completed transactions or leads',
      valA: dataA.kpis.conversions,
      valB: dataB.kpis.conversions,
      format: (v) => v.toLocaleString(),
      higherIsBetter: true,
    },
    {
      key: 'clicks',
      label: 'Total Clicks',
      description: 'Gross ad click traffic',
      valA: dataA.kpis.clicks,
      valB: dataB.kpis.clicks,
      format: (v) => v.toLocaleString(),
      higherIsBetter: true,
    },
    {
      key: 'reach',
      label: 'Unique Reach',
      description: 'Distinct individuals exposed to ads',
      valA: dataA.kpis.reach,
      valB: dataB.kpis.reach,
      format: (v) => v.toLocaleString(),
      higherIsBetter: true,
    },
  ];

  // Export comparison as CSV
  const handleExportCsv = () => {
    const headers = ['Metric', `${dataA.campaign.name}`, `${dataB.campaign.name}`, 'Delta', 'Superior Performer'];
    const rows = metricRows.map((r) => {
      const diff = r.valB - r.valA;
      const pct = r.valA !== 0 ? safeDivide(diff, Math.abs(r.valA)) * 100 : 0;
      let winner = 'Parity';
      if (r.higherIsBetter) {
        winner = r.valA > r.valB ? dataA.campaign.name : r.valB > r.valA ? dataB.campaign.name : 'Parity';
      } else {
        winner = r.valA < r.valB ? dataA.campaign.name : r.valB < r.valA ? dataB.campaign.name : 'Parity';
      }
      return [
        `"${r.label}"`,
        `"${r.format(r.valA)}"`,
        `"${r.format(r.valB)}"`,
        `"${pct > 0 ? '+' : ''}${pct.toFixed(1)}%"`,
        `"${winner}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Campaign_Comparison_${dataA.campaign.name}_vs_${dataB.campaign.name}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Comparison exported as CSV', 'success');
  };

  // Export comparison as PDF
  const handleExportPdf = () => {
    try {
      generateComparisonPdf(
        dataA.campaign,
        dataB.campaign,
        dataA,
        dataB,
        metricRows,
        aovA,
        aovB,
        settings
      );
      showToast('Comparison PDF generated and downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF. You can also print the page.', 'error');
    }
  };

  // Determine overall winner for core KPI (ROI / CVR / CPA efficiency)
  const scoreA = (dataA.health.overall_score * 0.4) + (roasA * 20);
  const scoreB = (dataB.health.overall_score * 0.4) + (roasB * 20);
  const overallWinner = scoreA >= scoreB ? dataA : dataB;
  const runnerUp = scoreA >= scoreB ? dataB : dataA;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* View Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Comparative Intelligence
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Campaign Performance Comparison
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Side-by-side analysis of marketing KPIs, unit costs (CPA, CTR, CPC), and simulated ROI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSwap}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all active:scale-[0.98]"
            title="Swap columns A and B"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-gray-500" />
            <span>Swap Order</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export Comparison PDF</span>
          </button>
        </div>
      </div>

      {/* Campaign Selector Header Cards with VS Divider */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
        {/* Campaign A Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-5 border-2 border-indigo-200/90 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-mono">
              Campaign A
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                dataA.health.status === 'Healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {dataA.health.status} ({dataA.health.overall_score}/100)
            </span>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Select Campaign
            </label>
            <div className="relative">
              <FolderOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={campaignAId}
                onChange={(e) => setCampaignAId(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Objective: <strong className="text-gray-900">{dataA.campaign.objective}</strong></span>
            <span>Channel: <strong className="text-indigo-700">{dataA.campaign.platform}</strong></span>
          </div>
        </div>

        {/* Central VS Divider */}
        <div className="md:col-span-1 flex justify-center">
          <button
            onClick={handleSwap}
            className="w-12 h-12 rounded-full bg-indigo-600 text-white font-black text-xs flex flex-col items-center justify-center shadow-md shadow-indigo-200 hover:scale-110 transition-all cursor-pointer group"
            title="Click to Swap"
          >
            <span>VS</span>
            <ArrowLeftRight className="w-3 h-3 group-hover:rotate-180 transition-transform" />
          </button>
        </div>

        {/* Campaign B Card */}
        <div className="md:col-span-5 bg-white rounded-2xl p-5 border-2 border-purple-200/90 shadow-xs space-y-3 relative">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 font-mono">
              Campaign B
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                dataB.health.status === 'Healthy'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {dataB.health.status} ({dataB.health.overall_score}/100)
            </span>
          </div>

          <div className="relative">
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Select Campaign
            </label>
            <div className="relative">
              <FolderOpen className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={campaignBId}
                onChange={(e) => setCampaignBId(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.platform})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Objective: <strong className="text-gray-900">{dataB.campaign.objective}</strong></span>
            <span>Channel: <strong className="text-purple-700">{dataB.campaign.platform}</strong></span>
          </div>
        </div>
      </div>

      {/* AI Comparison Synthesis Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Comparative Verdict</span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            {overallWinner.campaign.name} demonstrates superior blended capital efficiency
          </h3>
          <p className="text-xs text-indigo-200/90 leading-relaxed max-w-3xl">
            {dataA.kpis.cpa < dataB.kpis.cpa
              ? `${dataA.campaign.name} achieves a significantly lower acquisition cost (${curr}${dataA.kpis.cpa.toFixed(2)} vs ${curr}${dataB.kpis.cpa.toFixed(2)}), making it preferable for high-volume consumer acquisition.`
              : `${dataB.campaign.name} delivers higher downstream conversion efficiency (${dataB.kpis.conversion_rate}% CVR), driving higher value return per individual click.`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              selectCampaign(overallWinner.campaign.id);
              setActiveView('dashboard');
            }}
            className="px-4 py-2 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 shadow-sm flex items-center gap-1.5"
          >
            <span>Open Winner Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Revenue & ROI Simulation Panel */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                ROI & Revenue Return Simulation
              </h3>
              <p className="text-[11px] text-gray-500">
                Simulate custom Average Order Value (AOV) / Deal Value per conversion to benchmark true financial ROI & ROAS.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">
            Interactive Financial Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Campaign A Simulation */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">{dataA.campaign.name}</span>
              <span className="text-xs font-mono font-bold text-gray-700">
                {dataA.kpis.conversions.toLocaleString()} conversions
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Average Conversion Value:</span>
                <span className="font-mono font-bold text-gray-900">{curr}{aovA.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="50"
                value={aovA}
                onChange={(e) => setAovA(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Est. Revenue</span>
                <span className="text-xs font-bold font-mono text-gray-900">{curr}{revA.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">ROAS</span>
                <span className="text-xs font-bold font-mono text-indigo-700">{roasA}x</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Net ROI</span>
                <span className={`text-xs font-bold font-mono ${roiA >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {roiA > 0 ? '+' : ''}{roiA}%
                </span>
              </div>
            </div>
          </div>

          {/* Campaign B Simulation */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">{dataB.campaign.name}</span>
              <span className="text-xs font-mono font-bold text-gray-700">
                {dataB.kpis.conversions.toLocaleString()} conversions
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium">Average Conversion Value:</span>
                <span className="font-mono font-bold text-gray-900">{curr}{aovB.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="100"
                value={aovB}
                onChange={(e) => setAovB(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-center">
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Est. Revenue</span>
                <span className="text-xs font-bold font-mono text-gray-900">{curr}{revB.toLocaleString()}</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">ROAS</span>
                <span className="text-xs font-bold font-mono text-purple-700">{roasB}x</span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <span className="text-[10px] text-gray-400 block uppercase">Net ROI</span>
                <span className={`text-xs font-bold font-mono ${roiB >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {roiB > 0 ? '+' : ''}{roiB}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparative Table Matrix */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Side-by-Side Performance Matrix
            </h3>
            <p className="text-xs text-gray-500">
              Granular comparison of efficiency, volume, and unit economics
            </p>
          </div>
          <span className="text-xs font-mono text-gray-400">
            {metricRows.length} Deterministic Metrics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 w-2/5">Metric & Definition</th>
                <th className="py-3.5 px-4 w-1/5 text-indigo-950 font-bold">
                  {dataA.campaign.name}
                </th>
                <th className="py-3.5 px-4 w-1/5 text-purple-950 font-bold">
                  {dataB.campaign.name}
                </th>
                <th className="py-3.5 px-4 w-1/5">Variance (B vs A)</th>
                <th className="py-3.5 px-4 text-right">Advantage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {metricRows.map((row) => {
                const diff = row.valB - row.valA;
                const pct = row.valA !== 0 ? safeDivide(diff, Math.abs(row.valA)) * 100 : 0;

                // Determine which is better
                let winner: 'A' | 'B' | 'parity' = 'parity';
                if (row.valA !== row.valB) {
                  if (row.higherIsBetter) {
                    winner = row.valA > row.valB ? 'A' : 'B';
                  } else {
                    winner = row.valA < row.valB ? 'A' : 'B';
                  }
                }

                const isBBetter = winner === 'B';
                const isABetter = winner === 'A';

                return (
                  <tr
                    key={row.key}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Metric name & description */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#111827] text-xs">
                        {row.label}
                      </div>
                      <div className="text-[10px] text-gray-400 line-clamp-1">
                        {row.description}
                      </div>
                    </td>

                    {/* Campaign A Value */}
                    <td className={`py-3.5 px-4 font-mono font-bold ${isABetter ? 'text-indigo-700 bg-indigo-50/30' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{row.format(row.valA)}</span>
                        {isABetter && (
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded">
                            WIN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Campaign B Value */}
                    <td className={`py-3.5 px-4 font-mono font-bold ${isBBetter ? 'text-purple-700 bg-purple-50/30' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-1.5">
                        <span>{row.format(row.valB)}</span>
                        {isBBetter && (
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-1.5 py-0.2 rounded">
                            WIN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Variance (B vs A) */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-1">
                        {pct > 0 ? (
                          <TrendingUp className={`w-3.5 h-3.5 ${row.higherIsBetter ? 'text-emerald-500' : 'text-amber-500'}`} />
                        ) : pct < 0 ? (
                          <TrendingDown className={`w-3.5 h-3.5 ${row.higherIsBetter ? 'text-rose-500' : 'text-emerald-500'}`} />
                        ) : null}
                        <span
                          className={`font-bold ${
                            (row.higherIsBetter && pct > 0) || (!row.higherIsBetter && pct < 0)
                              ? 'text-emerald-600'
                              : pct === 0
                              ? 'text-gray-400'
                              : 'text-amber-600'
                          }`}
                        >
                          {pct > 0 ? `+${pct.toFixed(1)}%` : `${pct.toFixed(1)}%`}
                        </span>
                      </div>
                    </td>

                    {/* Advantage Winner Badge */}
                    <td className="py-3.5 px-4 text-right">
                      {isABetter ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {dataA.campaign.name}
                        </span>
                      ) : isBBetter ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          {dataB.campaign.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-400">
                          Parity
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Bar Comparison for Core Decision Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: CPA Visual Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">CPA Comparison ({curr})</span>
            <span className="text-[10px] font-semibold text-emerald-600">Lower is better</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataA.campaign.name}</span>
                <span className="font-mono font-bold text-indigo-700">{curr}{dataA.kpis.cpa.toFixed(2)}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((dataA.kpis.cpa / Math.max(dataA.kpis.cpa, dataB.kpis.cpa)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataB.campaign.name}</span>
                <span className="font-mono font-bold text-purple-700">{curr}{dataB.kpis.cpa.toFixed(2)}</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((dataB.kpis.cpa / Math.max(dataA.kpis.cpa, dataB.kpis.cpa)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 2: CTR Visual Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">CTR Comparison (%)</span>
            <span className="text-[10px] font-semibold text-indigo-600">Higher is better</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataA.campaign.name}</span>
                <span className="font-mono font-bold text-indigo-700">{dataA.kpis.ctr}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((dataA.kpis.ctr / Math.max(dataA.kpis.ctr, dataB.kpis.ctr, 0.1)) * 100))}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataB.campaign.name}</span>
                <span className="font-mono font-bold text-purple-700">{dataB.kpis.ctr}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((dataB.kpis.ctr / Math.max(dataA.kpis.ctr, dataB.kpis.ctr, 0.1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric 3: ROI Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">Simulated ROI (%)</span>
            <span className="text-[10px] font-semibold text-emerald-600">Higher is better</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataA.campaign.name}</span>
                <span className="font-mono font-bold text-indigo-700">{roiA}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(10, Math.round((Math.max(0, roiA) / Math.max(1, roiA, roiB)) * 100)))}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 truncate max-w-[180px]">{dataB.campaign.name}</span>
                <span className="font-mono font-bold text-purple-700">{roiB}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(10, Math.round((Math.max(0, roiB) / Math.max(1, roiA, roiB)) * 100)))}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
