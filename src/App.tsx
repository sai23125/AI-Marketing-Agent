import React, { useState } from 'react';
import { CampaignProvider, useCampaign } from './context/CampaignContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardScreen } from './components/DashboardScreen';
import { LandingScreen } from './components/LandingScreen';
import { CampaignsHistoryView } from './components/CampaignsHistoryView';
import { CsvUploadView } from './components/CsvUploadView';
import { DiagnosisView } from './components/DiagnosisView';
import { RecommendationsView } from './components/RecommendationsView';
import { DetailedAnalyticsView } from './components/DetailedAnalyticsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { CompareCampaignsView } from './components/CompareCampaignsView';
import { ConnectedPlatformsView } from './components/ConnectedPlatformsView';
import { AiAnalysisLoadingModal } from './components/AiAnalysisLoadingModal';
import { WorkflowArchitectureModal } from './components/WorkflowArchitectureModal';
import { HelpModal } from './components/HelpModal';
import { ToastContainer } from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useCampaign();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [architectureModalOpen, setArchitectureModalOpen] = useState<boolean>(false);
  const [helpModalOpen, setHelpModalOpen] = useState<boolean>(false);

  // Render view based on activeView state
  const renderActiveView = () => {
    switch (activeView) {
      case 'landing':
        return <LandingScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'campaigns':
        return <CampaignsHistoryView />;
      case 'platforms':
        return <ConnectedPlatformsView />;
      case 'compare':
        return <CompareCampaignsView />;
      case 'upload':
        return <CsvUploadView />;
      case 'diagnosis':
        return <DiagnosisView />;
      case 'recommendations':
        return <RecommendationsView />;
      case 'analytics':
        return <DetailedAnalyticsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Responsive Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenArchitecture={() => setArchitectureModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 transition-all">
        {/* Sticky Header */}
        <Header onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* View Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#E5E7EB] bg-white px-6 py-4 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">
              AI Marketing Campaign Diagnosis Agent
            </span>
            <span className="text-gray-300">•</span>
            <span>Trizen Ventures Student Project</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>Web Development + Vibe Coding + Agentic AI</span>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Formulas & Docs
            </button>
          </div>
        </footer>
      </div>

      {/* Modals & Overlays */}
      <AiAnalysisLoadingModal />
      <WorkflowArchitectureModal
        isOpen={architectureModalOpen}
        onClose={() => setArchitectureModalOpen(false)}
      />
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <CampaignProvider>
      <AppContent />
    </CampaignProvider>
  );
}
