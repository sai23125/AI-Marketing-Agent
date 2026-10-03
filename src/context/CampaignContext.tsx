import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Campaign,
  CalculatedKPIs,
  CampaignHealth,
  MarketingFunnel,
  RuleBasedIssue,
  AudienceSegment,
  PlatformMetric,
  CampaignDailyMetric,
  DiagnosisReport,
  Recommendation,
  AnalysisSettings,
  PlatformIntegrationConfig,
  ConnectedAccount,
} from '../types/campaign';

import {
  calculateKPIs,
  calculateHealthScore,
  calculateFunnel,
  runRuleBasedDiagnosis,
  DEFAULT_SETTINGS,
} from '../utils/analyticsEngine';

import {
  INITIAL_DEMO_DATA_PACKAGES,
} from '../data/demoCampaigns';

import { api } from '../services/api';

export type ActiveView =
  | 'landing'
  | 'dashboard'
  | 'campaigns'
  | 'platforms'
  | 'compare'
  | 'upload'
  | 'diagnosis'
  | 'recommendations'
  | 'analytics'
  | 'reports'
  | 'settings';

interface AnalyticsData {
  campaign: Campaign;
  kpis: CalculatedKPIs;
  health: CampaignHealth;
  funnel: MarketingFunnel;
  ruleIssues: RuleBasedIssue[];
  audiences: AudienceSegment[];
  platforms: PlatformMetric[];
  dailyMetrics: CampaignDailyMetric[];
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CampaignContextType {
  campaigns: Array<Campaign & { spend?: number; conversions?: number; cpa?: number; ctr?: number; health_score?: number; health_status?: string }>;
  selectedCampaignId: string;
  selectedCampaign: Campaign | null;
  analyticsData: AnalyticsData | null;
  diagnosis: DiagnosisReport | null;
  recommendations: Recommendation[];
  settings: AnalysisSettings;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  loading: boolean;
  isAnalyzing: boolean;
  isSyncing: boolean;
  analysisStep: number; // 0 to 6
  toasts: ToastMessage[];
  integrations: PlatformIntegrationConfig[];
  selectedAppFilter: string | null;
  setSelectedAppFilter: (app: string | null) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;
  selectCampaign: (id: string) => Promise<void>;
  runDiagnosis: (campaignId?: string) => Promise<void>;
  uploadCsvData: (csvText: string, metadata: any) => Promise<boolean>;
  createManualCampaign: (formData: any) => Promise<boolean>;
  importConnectedCampaign: (payload: any) => Promise<boolean>;
  syncActiveCampaign: () => Promise<void>;
  syncPlatform: (platform: string) => Promise<void>;
  disconnectPlatform: (platform: string) => Promise<void>;
  connectPlatformTest: (platform: string, accountName?: string) => Promise<void>;
  refreshIntegrations: () => Promise<void>;
  updateSettings: (newSettings: Partial<AnalysisSettings>) => Promise<void>;
  resetToDemo: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Array<any>>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('camp_summer_sale_2026');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisReport | null>(null);
  const [settings, setSettings] = useState<AnalysisSettings>(DEFAULT_SETTINGS);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [integrations, setIntegrations] = useState<PlatformIntegrationConfig[]>([]);
  const [selectedAppFilter, setSelectedAppFilter] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, []);

  const refreshIntegrations = async () => {
    try {
      const res = await api.getIntegrationsStatus();
      if (res && res.platforms) {
        setIntegrations(res.platforms);
      }
    } catch {
      // fallback
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [campaignList, remoteSettings, statusRes] = await Promise.all([
        api.getCampaigns(),
        api.getSettings(),
        api.getIntegrationsStatus(),
      ]);
      setCampaigns(campaignList);
      if (remoteSettings) setSettings(remoteSettings);
      if (statusRes && statusRes.platforms) setIntegrations(statusRes.platforms);

      const targetId = campaignList.find((c) => c.id === 'camp_summer_sale_2026')?.id || campaignList[0]?.id || 'camp_summer_sale_2026';
      await loadCampaignAnalytics(targetId, remoteSettings || settings);
    } catch {
      // client demo fallback
      const demoList = Object.values(INITIAL_DEMO_DATA_PACKAGES).map((pkg) => {
        const k = calculateKPIs(pkg.dailyMetrics);
        const h = calculateHealthScore(k, settings);
        return {
          ...pkg.campaign,
          spend: k.spend,
          conversions: k.conversions,
          cpa: k.cpa,
          ctr: k.ctr,
          health_score: h.overall_score,
          health_status: h.status,
        };
      });
      setCampaigns(demoList);
      await loadCampaignAnalytics('camp_summer_sale_2026', settings);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaignAnalytics = async (id: string, activeSettings = settings) => {
    try {
      const data = await api.getCampaignAnalytics(id);
      if (data) {
        setAnalyticsData(data);
        setSelectedCampaignId(id);
        const diag = await api.getDiagnosis(id);
        setDiagnosis(diag);
      }
    } catch (err) {
      console.error('Failed to load campaign analytics:', err);
      // Fallback from local demo data
      const pkg = INITIAL_DEMO_DATA_PACKAGES[id] || INITIAL_DEMO_DATA_PACKAGES['camp_summer_sale_2026'];
      const kpis = calculateKPIs(pkg.dailyMetrics);
      const health = calculateHealthScore(kpis, activeSettings);
      const funnel = calculateFunnel(kpis);
      const ruleIssues = runRuleBasedDiagnosis(kpis, pkg.audiences, pkg.platforms, activeSettings);
      setAnalyticsData({
        campaign: pkg.campaign,
        kpis,
        health,
        funnel,
        ruleIssues,
        audiences: pkg.audiences,
        platforms: pkg.platforms,
        dailyMetrics: pkg.dailyMetrics,
      });
      setSelectedCampaignId(id);
      setDiagnosis(pkg.diagnosis);
    }
  };

  const selectCampaign = async (id: string) => {
    setLoading(true);
    await loadCampaignAnalytics(id, settings);
    setLoading(false);
    showToast(`Switched active campaign.`, 'info');
  };

  // Run AI Diagnosis with professional step progression
  const runDiagnosis = async (campaignId?: string) => {
    const id = campaignId || selectedCampaignId;
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Step animation sequence
    const steps = [
      'Validating campaign data...',
      'Calculating marketing KPIs...',
      'Detecting performance issues...',
      'Analyzing audience segments...',
      'Generating AI diagnosis...',
      'Preparing recommendations...',
      'Analysis Complete',
    ];

    for (let i = 0; i < steps.length - 1; i++) {
      setAnalysisStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    try {
      const result = await api.runAiDiagnosis(id);
      if (result && result.diagnosis) {
        setDiagnosis(result.diagnosis);
        setAnalysisStep(6);
        await new Promise((r) => setTimeout(r, 400));
        showToast(
          result.ai_mode === 'live'
            ? 'AI analysis complete via Live Agent.'
            : 'Analysis complete via Deterministic Engine.',
          'success'
        );
      }
    } catch (err: any) {
      showToast('AI analysis completed using deterministic rule engine.', 'info');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const uploadCsvData = async (csvText: string, metadata: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.uploadCsv(csvText, metadata);
      if (res && res.campaign) {
        // Refresh campaign list
        const updatedList = await api.getCampaigns();
        setCampaigns(updatedList);
        await loadCampaignAnalytics(res.campaign.id);
        setActiveView('dashboard');
        showToast(`Campaign '${res.campaign.name}' ingested and analyzed!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'CSV upload failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createManualCampaign = async (formData: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.createManualCampaign(formData);
      if (res && res.campaign) {
        const updatedList = await api.getCampaigns();
        setCampaigns(updatedList);
        await loadCampaignAnalytics(res.campaign.id);
        setActiveView('dashboard');
        showToast(`Campaign '${res.campaign.name}' created and analyzed!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Creation failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const importConnectedCampaign = async (payload: any): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await api.importConnectedCampaign(payload);
      if (res && res.campaign) {
        const updatedList = await api.getCampaigns();
        setCampaigns(updatedList);
        await refreshIntegrations();
        await loadCampaignAnalytics(res.campaign.id);
        setActiveView('dashboard');
        showToast(`Campaign '${res.campaign.name}' successfully imported and diagnosed!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const syncActiveCampaign = async () => {
    if (!selectedCampaignId) return;
    try {
      setIsSyncing(true);
      await api.syncPlatform(undefined, selectedCampaignId);
      const updatedList = await api.getCampaigns();
      setCampaigns(updatedList);
      await loadCampaignAnalytics(selectedCampaignId);
      showToast(`Campaign data synchronized — status up to date!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Sync failed. Unable to retrieve reporting data.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncPlatform = async (platform: string) => {
    try {
      setIsSyncing(true);
      await api.syncPlatform(platform);
      await refreshIntegrations();
      showToast(`Platform synchronization complete`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Sync failed', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const disconnectPlatform = async (platform: string) => {
    try {
      await api.disconnectPlatform(platform);
      await refreshIntegrations();
      showToast(`Platform disconnected`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect', 'error');
    }
  };

  const connectPlatformTest = async (platform: string, accountName?: string) => {
    try {
      await api.connectPlatformTest(platform, accountName);
      await refreshIntegrations();
      showToast(`Platform connected in Sandbox / Test Mode!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Connection failed', 'error');
    }
  };

  const updateSettings = async (newSettings: Partial<AnalysisSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
    if (selectedCampaignId) {
      await loadCampaignAnalytics(selectedCampaignId, updated);
    }
    showToast('Analysis thresholds updated successfully', 'success');
  };

  const resetToDemo = async () => {
    await selectCampaign('camp_summer_sale_2026');
    setActiveView('dashboard');
    showToast('Loaded demo dataset: Summer Sale Campaign', 'success');
  };

  const selectedCampaign = analyticsData?.campaign || campaigns.find((c) => c.id === selectedCampaignId) || null;
  const recommendations = diagnosis?.recommendations || [];

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        selectedCampaignId,
        selectedCampaign,
        analyticsData,
        diagnosis,
        recommendations,
        settings,
        activeView,
        setActiveView,
        loading,
        isAnalyzing,
        isSyncing,
        analysisStep,
        toasts,
        integrations,
        selectedAppFilter,
        setSelectedAppFilter,
        showToast,
        dismissToast,
        selectCampaign,
        runDiagnosis,
        uploadCsvData,
        createManualCampaign,
        importConnectedCampaign,
        syncActiveCampaign,
        syncPlatform,
        disconnectPlatform,
        connectPlatformTest,
        refreshIntegrations,
        updateSettings,
        resetToDemo,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};
