import React from 'react';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Filter,
  Users,
  Share2,
  RefreshCw,
  Download,
  Calendar,
  Database,
  FileSpreadsheet,
  Edit3,
  Globe,
  Radio,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { KpiCards } from './KpiCards';
import { CampaignHealthCard } from './CampaignHealthCard';
import { PerformanceChart } from './PerformanceChart';
import { MarketingFunnelCard } from './MarketingFunnelCard';
import { AiInsightCard } from './AiInsightCard';
import { WeeklyTrendsChart } from './WeeklyTrendsChart';
import { AiDiagnosisSection } from './AiDiagnosisSection';
import { AudienceAnalyticsSection } from './AudienceAnalyticsSection';
import { PlatformPerformanceSection } from './PlatformPerformanceSection';

export const DashboardScreen: React.FC = () => {
  const {
    analyticsData,
    setActiveView,
    selectedCampaign,
    runDiagnosis,
    isAnalyzing,
    syncActiveCampaign,
    isSyncing,
  } = useCampaign();

  if (!analyticsData || !selectedCampaign) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <p className="text-gray-500 text-sm">Loading campaign performance data...</p>
      </div>
    );
  }

  // Determine Source Badge Presentation (Requirement #12, #37)
  const dataSource = selectedCampaign.data_source || 'demo';
  const sourcePlatform = selectedCampaign.source_platform || selectedCampaign.platform;

  return (
    <div className="space-y-6">
      {/* Executive Dashboard Header & Data Source Badge (Requirements #12, #13) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E5E7EB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          {/* Data Source Badge (Requirement #12) */}
          <div className="flex flex-wrap items-center gap-2">
            {dataSource === 'live' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>LIVE DATA</span>
                <span className="text-emerald-400">•</span>
                <span className="font-semibold">{sourcePlatform}</span>
                <span className="text-emerald-400">•</span>
                <span className="font-mono text-[10px] font-normal text-emerald-600">
                  Last synced: {selectedCampaign.last_synced_at ? new Date(selectedCampaign.last_synced_at).toLocaleTimeString() : 'Just now'}
                </span>
              </span>
            )}

            {dataSource === 'csv' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-50 text-sky-800 border border-sky-200 shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" />
                <span>CSV DATA</span>
                <span className="text-sky-300">•</span>
                <span className="font-semibold">Uploaded: {new Date(selectedCampaign.created_at).toLocaleDateString()}</span>
              </span>
            )}

            {dataSource === 'manual' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-800 border border-purple-200 shadow-xs">
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>MANUAL DATA</span>
                <span className="text-purple-300">•</span>
                <span className="font-semibold">User Entered</span>
              </span>
            )}

            {dataSource === 'demo' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
                <Database className="w-3.5 h-3.5 text-amber-600" />
                <span>DEMO DATA</span>
                <span className="text-amber-300">•</span>
                <span className="font-semibold">Demo Mode</span>
              </span>
            )}

            <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
              Horizon: {selectedCampaign.start_date} to {selectedCampaign.end_date}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {selectedCampaign.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Source: <strong className="text-gray-800">{sourcePlatform}</strong> • Objective: <strong className="text-gray-800">{selectedCampaign.objective}</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons (Requirement #13) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Button 1: [ Sync Data ] */}
          <button
            onClick={syncActiveCampaign}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            title="Fetch latest reporting updates from data source"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          {/* Button 2: [ Analyze ] */}
          <button
            onClick={() => runDiagnosis()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-200" />
            )}
            <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
          </button>

          {/* Button 3: [ Export Report ] */}
          <button
            onClick={() => setActiveView('reports')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 1. 7 Dynamic KPI Cards */}
      <KpiCards />

      {/* 2. Top Analytical Row: Campaign Health & Performance Time-series Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CampaignHealthCard />
        </div>
        <div className="lg:col-span-8">
          <PerformanceChart />
        </div>
      </div>

      {/* 3. Middle Row: Marketing Funnel & AI Insight Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MarketingFunnelCard />
        </div>
        <div className="lg:col-span-5 flex flex-col justify-between">
          <AiInsightCard />
          <div className="mt-4 p-4 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-gray-900 block">
                Optimization Playbook Ready
              </span>
              <span className="text-[11px] text-gray-500 block">
                Prioritized audience, creative, and budget action items
              </span>
            </div>
            <button
              onClick={() => setActiveView('recommendations')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 flex items-center gap-1 shrink-0"
            >
              <span>View Actions</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Weekly Performance Fluctuations (Recharts Dual-Axis CPA vs CTR) */}
      <WeeklyTrendsChart />

      {/* 5. AI Diagnosis Section (Key Findings & Evidence) */}
      <AiDiagnosisSection />

      {/* 5. Audience Analytics Section */}
      <AudienceAnalyticsSection />

      {/* 6. Platform Performance Section */}
      <PlatformPerformanceSection />
    </div>
  );
};
