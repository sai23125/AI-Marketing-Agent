import {
  Campaign,
  CalculatedKPIs,
  CampaignHealth,
  MarketingFunnel,
  RuleBasedIssue,
  AudienceSegment,
  PlatformMetric,
  DiagnosisReport,
  Recommendation,
  AnalysisSettings,
  CsvValidationResult,
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

import {
  generateDeterministicDiagnosisFallback,
} from './aiDiagnosisService';

// Client API Helper
export const api = {
  // 1. Health check
  async checkHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) return await res.json();
    } catch {
      // offline / client-only fallback
    }
    return {
      status: 'client_mode',
      appName: 'AI Marketing Campaign Diagnosis Agent',
      aiProviderConfigured: 'Deterministic Fallback Engine',
    };
  },

  // 2. Get Campaigns list
  async getCampaigns(): Promise<Array<Campaign & { spend: number; conversions: number; cpa: number; ctr: number; health_score: number; health_status: string }>> {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Client memory fallback
    return Object.values(INITIAL_DEMO_DATA_PACKAGES).map((pkg) => {
      const kpis = calculateKPIs(pkg.dailyMetrics);
      const health = calculateHealthScore(kpis, DEFAULT_SETTINGS);
      return {
        ...pkg.campaign,
        spend: kpis.spend,
        conversions: kpis.conversions,
        cpa: kpis.cpa,
        ctr: kpis.ctr,
        health_score: health.overall_score,
        health_status: health.status,
      };
    });
  },

  // 3. Get Campaign Analytics
  async getCampaignAnalytics(id: string) {
    try {
      const res = await fetch(`/api/campaigns/${id}/analytics`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const pkg = INITIAL_DEMO_DATA_PACKAGES[id] || INITIAL_DEMO_DATA_PACKAGES['camp_summer_sale_2026'];
    const kpis = calculateKPIs(pkg.dailyMetrics);
    const health = calculateHealthScore(kpis, DEFAULT_SETTINGS);
    const funnel = calculateFunnel(kpis);
    const ruleIssues = runRuleBasedDiagnosis(kpis, pkg.audiences, pkg.platforms, DEFAULT_SETTINGS);

    return {
      campaign: pkg.campaign,
      kpis,
      health,
      funnel,
      ruleIssues,
      audiences: pkg.audiences,
      platforms: pkg.platforms,
      dailyMetrics: pkg.dailyMetrics,
    };
  },

  // 4. Get Diagnosis Report
  async getDiagnosis(id: string): Promise<DiagnosisReport> {
    try {
      const res = await fetch(`/api/campaigns/${id}/diagnosis`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const pkg = INITIAL_DEMO_DATA_PACKAGES[id] || INITIAL_DEMO_DATA_PACKAGES['camp_summer_sale_2026'];
    return pkg.diagnosis;
  },

  // 5. Upload CSV
  async uploadCsv(csvText: string, metadata: { campaignName?: string; objective?: string; platform?: string; currency?: string }): Promise<any> {
    try {
      const res = await fetch('/api/campaigns/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, ...metadata }),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload CSV');
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
    }
    throw new Error('Upload endpoint unavailable.');
  },

  // 6. Manual campaign input
  async createCampaignManual(data: any): Promise<any> {
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
      const err = await res.json();
      throw new Error(err.error || 'Failed to create campaign');
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) throw e;
    }
    throw new Error('Create campaign endpoint unavailable.');
  },

  // 7. Run AI Diagnosis
  async runAiDiagnosis(campaignId: string): Promise<{ diagnosis: DiagnosisReport; ai_mode: string; provider: string }> {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    // Client fallback synthesis
    const pkg = INITIAL_DEMO_DATA_PACKAGES[campaignId] || INITIAL_DEMO_DATA_PACKAGES['camp_summer_sale_2026'];
    const kpis = calculateKPIs(pkg.dailyMetrics);
    const ruleIssues = runRuleBasedDiagnosis(kpis, pkg.audiences, pkg.platforms, DEFAULT_SETTINGS);
    const fallback = generateDeterministicDiagnosisFallback(
      pkg.campaign,
      kpis,
      ruleIssues,
      pkg.audiences,
      pkg.platforms,
      DEFAULT_SETTINGS
    );

    return {
      diagnosis: fallback,
      ai_mode: 'fallback',
      provider: 'Deterministic Rule Engine (Offline Mode)',
    };
  },

  // 8. Settings
  async getSettings(): Promise<AnalysisSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  },

  async updateSettings(settings: Partial<AnalysisSettings>): Promise<AnalysisSettings> {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        return data.settings;
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_SETTINGS, ...settings };
  },

  // 9. Connected Platforms Status (Requirement #9)
  async getIntegrationsStatus() {
    try {
      const res = await fetch('/api/integrations/status');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return { platforms: [], connected_count: 0 };
  },

  // 10. Platform Accounts Discovery
  async getPlatformAccounts(platform: string) {
    try {
      const res = await fetch(`/api/${platform}/accounts`);
      if (res.ok) return await res.json();
    } catch (err: any) {
      console.warn(`Failed to fetch accounts for ${platform}:`, err);
    }
    return [];
  },

  // 11. Platform Campaigns Discovery
  async getPlatformCampaigns(platform: string, accountId: string) {
    try {
      const res = await fetch(`/api/${platform}/campaigns?accountId=${encodeURIComponent(accountId)}&customerId=${encodeURIComponent(accountId)}&advertiserId=${encodeURIComponent(accountId)}`);
      if (res.ok) return await res.json();
    } catch (err: any) {
      console.warn(`Failed to fetch campaigns for ${platform}:`, err);
    }
    return [];
  },

  // 12. Import Connected Campaign (Requirement #10)
  async importConnectedCampaign(payload: {
    platform: string;
    accountId: string;
    accountName: string;
    campaignId: string;
    campaignName: string;
    dateRange?: string;
  }) {
    const res = await fetch('/api/integrations/import-campaign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import campaign');
    }
    return await res.json();
  },

  // 13. Create Manual Campaign (Requirement #25)
  async createManualCampaign(formData: {
    campaignName: string;
    objective: string;
    platform: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    spend: number;
  }) {
    const res = await fetch('/api/campaigns/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit manual campaign');
    }
    return await res.json();
  },

  // 14. Sync Campaign or Platform (Requirement #11)
  async syncPlatform(platform?: string, campaignId?: string) {
    const res = await fetch('/api/integrations/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, campaignId }),
    });
    if (!res.ok) {
      throw new Error('Sync failed. Unable to retrieve reporting data.');
    }
    return await res.json();
  },

  // 15. Disconnect Platform
  async disconnectPlatform(platform: string) {
    const res = await fetch('/api/integrations/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
    return await res.json();
  },

  // 16. Connect Sandbox / Test Account
  async connectPlatformTest(platform: string, accountName?: string) {
    const res = await fetch('/api/integrations/connect-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, accountName }),
    });
    return await res.json();
  },

  // 17. Database Entities Status (Requirement #27)
  async getDatabaseStatus() {
    try {
      const res = await fetch('/api/database/status');
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return null;
  },
};
