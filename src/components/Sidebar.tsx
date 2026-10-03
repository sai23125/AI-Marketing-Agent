import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  X,
  ArrowLeftRight,
  Share2,
} from 'lucide-react';
import { useCampaign, ActiveView } from '../context/CampaignContext';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  onOpenHelp: () => void;
  onOpenArchitecture: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
  onOpenHelp,
  onOpenArchitecture,
}) => {
  const { activeView, setActiveView, selectedCampaign, resetToDemo } = useCampaign();

  const navItems: Array<{ id: ActiveView; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'campaigns', label: 'Campaigns', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'platforms', label: 'Connect Platforms', icon: <Share2 className="w-5 h-5 text-indigo-500" />, badge: 'APIs' },
    { id: 'compare', label: 'Compare', icon: <ArrowLeftRight className="w-5 h-5" /> },
    { id: 'upload', label: 'Upload Data', icon: <UploadCloud className="w-5 h-5" /> },
    { id: 'diagnosis', label: 'AI Diagnosis', icon: <Sparkles className="w-5 h-5 text-indigo-500" />, badge: 'AI' },
    { id: 'recommendations', label: 'Recommendations', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-5 border-b border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-[#111827] text-base leading-tight tracking-tight">
                  AI Marketing Agent
                </h1>
                <p className="text-[11px] font-medium text-indigo-600 flex items-center gap-1 mt-0.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Powered by Agentic AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100/80 flex items-center justify-between text-xs text-indigo-900 font-medium">
            <span className="truncate">Trizen Ventures Project</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-indigo-700 border border-indigo-200">
              v1.0
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Main Menu
          </div>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#EEF2FF] text-indigo-700 font-semibold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-indigo-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Architecture
          </div>
          <button
            onClick={() => {
              onOpenArchitecture();
              setMobileOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <Layers className="w-5 h-5 text-gray-500" />
            <span>Agent Workflow</span>
          </button>
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] space-y-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onOpenHelp();
                setMobileOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-indigo-600"
            >
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span>Help & Formulas</span>
            </button>
            <button
              onClick={resetToDemo}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              Reload Demo
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] flex items-center gap-3 shadow-xs">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              TV
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#111827] truncate">
                Trizen Ventures Marketer
              </div>
              <div className="text-[10px] text-gray-500 truncate">
                {selectedCampaign ? selectedCampaign.name : 'Summer Sale Campaign'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
