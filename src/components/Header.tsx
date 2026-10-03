import React from 'react';
import {
  Menu,
  Sparkles,
  UploadCloud,
  Play,
  Calendar,
  ChevronDown,
  User,
  ShieldCheck,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const {
    campaigns,
    selectedCampaignId,
    selectCampaign,
    selectedCampaign,
    runDiagnosis,
    isAnalyzing,
    setActiveView,
    resetToDemo,
  } = useCampaign();

  // Dynamic time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex flex-col gap-3">
        {/* Top Row: Greeting & Action Buttons */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                <span>{getGreeting()}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 font-normal">Student Project</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] tracking-tight">
                AI Marketing Campaign Diagnosis Agent
              </h2>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveView('upload')}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-xs transition-all"
            >
              <UploadCloud className="w-4 h-4 text-gray-500" />
              <span>Upload Campaign</span>
            </button>

            <button
              onClick={() => runDiagnosis()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-200" />
              )}
              <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Campaign'}</span>
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Subtitle & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium hidden sm:inline">
              Diagnose campaigns. Understand performance. Optimize decisions.
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              Powered by Agentic AI
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              Trizen Ventures
            </span>
          </div>

          {/* Campaign Selector Dropdown & Date Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Campaign dropdown */}
            <div className="relative inline-flex items-center">
              <FolderOpen className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              <select
                value={selectedCampaignId}
                onChange={(e) => selectCampaign(e.target.value)}
                aria-label="Select campaign to diagnose"
                className="pl-8 pr-7 py-1.5 text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer appearance-none shadow-xs"
              >
                {campaigns.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    {camp.name} ({camp.status})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
            </div>

            {/* Date range selector */}
            <div className="relative inline-flex items-center">
              <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 pointer-events-none" />
              <select
                aria-label="Select date range"
                className="pl-8 pr-7 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none shadow-xs"
                defaultValue="last30"
              >
                <option value="last30">Last 30 days</option>
                <option value="last14">Last 14 days</option>
                <option value="last7">Last 7 days</option>
                <option value="all">Full Campaign Duration</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
