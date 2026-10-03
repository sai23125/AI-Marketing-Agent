import React, { useState, useEffect } from 'react';
import {
  Share2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Edit3,
  Sparkles,
  Database,
  Unplug,
  Key,
  Globe,
  Sliders,
  FolderOpen,
  Calendar,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { api } from '../services/api';
import { PlatformIntegrationConfig } from '../types/campaign';

export const ConnectedPlatformsView: React.FC = () => {
  const {
    integrations,
    refreshIntegrations,
    syncPlatform,
    disconnectPlatform,
    connectPlatformTest,
    importConnectedCampaign,
    setActiveView,
    resetToDemo,
    showToast,
    isSyncing,
  } = useCampaign();

  // Campaign selector state
  const [selectedPlatform, setSelectedPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('last_30d');

  // Discovered accounts & campaigns
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string }>>([]);
  const [campaignList, setCampaignList] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Developer sandbox credential modal
  const [sandboxModalOpen, setSandboxModalOpen] = useState<boolean>(false);
  const [sandboxPlatform, setSandboxPlatform] = useState<'meta' | 'google' | 'tiktok' | 'linkedin'>('meta');
  const [sandboxAccountName, setSandboxAccountName] = useState<string>('Trizen Performance Enterprise');

  // Load platform accounts when platform changes
  useEffect(() => {
    loadAccountsForPlatform(selectedPlatform);
  }, [selectedPlatform]);

  // Load campaigns when account changes
  useEffect(() => {
    if (selectedAccount) {
      loadCampaignsForAccount(selectedPlatform, selectedAccount);
    }
  }, [selectedAccount, selectedPlatform]);

  const loadAccountsForPlatform = async (plat: string) => {
    setLoadingDiscovery(true);
    try {
      const accs = await api.getPlatformAccounts(plat);
      if (Array.isArray(accs) && accs.length > 0) {
        const formatted = accs.map((a: any) => ({
          id: a.id || a.account_id || a.advertiser_id || a.resourceName,
          name: a.name || a.descriptiveName || a.advertiser_name || `Account ${a.id}`,
        }));
        setAccounts(formatted);
        setSelectedAccount(formatted[0].id);
      } else {
        setAccounts([]);
        setSelectedAccount('');
        setCampaignList([]);
      }
    } catch {
      setAccounts([]);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  const loadCampaignsForAccount = async (plat: string, accId: string) => {
    setLoadingDiscovery(true);
    try {
      const camps = await api.getPlatformCampaigns(plat, accId);
      if (Array.isArray(camps) && camps.length > 0) {
        const formatted = camps.map((c: any) => ({
          id: c.id || c.campaign_id,
          name: c.name || c.campaign_name || 'Campaign',
        }));
        setCampaignList(formatted);
        setSelectedCampaignId(formatted[0].id);
        setSelectedCampaignName(formatted[0].name);
      } else {
        setCampaignList([]);
        setSelectedCampaignId('');
        setSelectedCampaignName('');
      }
    } catch {
      setCampaignList([]);
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // Trigger Official OAuth or Sandbox Modal
  const handleConnectClick = (platConfig: PlatformIntegrationConfig) => {
    if (platConfig.configured && platConfig.auth_url) {
      window.location.href = platConfig.auth_url;
    } else {
      // Open developer testing & credential guidance modal
      setSandboxPlatform(platConfig.platform);
      setSandboxAccountName(`Trizen ${platConfig.name.split(' ')[0]} Production`);
      setSandboxModalOpen(true);
    }
  };

  // Analyze Campaign from connected platform
  const handleAnalyzeCampaign = async () => {
    if (!selectedCampaignName) {
      showToast('Please select a campaign from your account to analyze.', 'error');
      return;
    }

    setIsImporting(true);
    try {
      const accObj = accounts.find((a) => a.id === selectedAccount);
      await importConnectedCampaign({
        platform: selectedPlatform,
        accountId: selectedAccount,
        accountName: accObj?.name || `${selectedPlatform} Account`,
        campaignId: selectedCampaignId,
        campaignName: selectedCampaignName,
        dateRange,
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Find integration config by platform
  const getConfig = (plat: 'meta' | 'google' | 'tiktok' | 'linkedin') => {
    return (
      integrations.find((i) => i.platform === plat) || {
        platform: plat,
        name: plat.toUpperCase(),
        configured: false,
        status_message: 'Not configured',
        connected_account: null,
      }
    );
  };

  const metaConfig = getConfig('meta');
  const googleConfig = getConfig('google');
  const tiktokConfig = getConfig('tiktok');
  const linkedinConfig = getConfig('linkedin');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Page Header (Requirement #2) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Live Advertising APIs & Data Ingestion
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Connect Your Marketing Data
          </h2>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Connect your advertising platforms or upload campaign data to automatically analyze performance with deterministic KPI calculation and AI diagnosis.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => refreshIntegrations()}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* 2. Four Platform Cards (Requirements #2, #4, #5, #6, #7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* OPTION 1: Meta */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E5E7EB] hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  f
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Meta</h3>
                  <span className="text-xs font-medium text-gray-500">Facebook + Instagram Ads</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  metaConfig.connected_account?.is_connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {metaConfig.connected_account?.is_connected ? '✓ Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect a Meta advertising account to import campaign performance data.
            </p>

            {metaConfig.connected_account?.is_connected ? (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-semibold font-mono text-gray-900">{metaConfig.connected_account.account_name}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="text-gray-600">{metaConfig.connected_account.last_synced_at ? new Date(metaConfig.connected_account.last_synced_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {metaConfig.status_message}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            {metaConfig.connected_account?.is_connected ? (
              <>
                <button
                  onClick={() => syncPlatform('meta')}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => disconnectPlatform('meta')}
                  className="py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnectClick(metaConfig)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Connect Meta</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* OPTION 2: Google Ads */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E5E7EB] hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  G
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">Google Ads</h3>
                  <span className="text-xs font-medium text-gray-500">Search, Display & Performance Max</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  googleConfig.connected_account?.is_connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {googleConfig.connected_account?.is_connected ? '✓ Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect Google Ads to import campaign and performance metrics.
            </p>

            {googleConfig.connected_account?.is_connected ? (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-semibold font-mono text-gray-900">{googleConfig.connected_account.account_name}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="text-gray-600">{googleConfig.connected_account.last_synced_at ? new Date(googleConfig.connected_account.last_synced_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {googleConfig.status_message}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            {googleConfig.connected_account?.is_connected ? (
              <>
                <button
                  onClick={() => syncPlatform('google')}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => disconnectPlatform('google')}
                  className="py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnectClick(googleConfig)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#EA4335] hover:bg-rose-600 text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Connect Google Ads</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* OPTION 3: TikTok Ads */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E5E7EB] hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  ♪
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">TikTok Ads</h3>
                  <span className="text-xs font-medium text-gray-500">TikTok Business Marketing</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  tiktokConfig.connected_account?.is_connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {tiktokConfig.connected_account?.is_connected ? '✓ Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect TikTok Ads to retrieve advertising performance data.
            </p>

            {tiktokConfig.connected_account?.is_connected ? (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-semibold font-mono text-gray-900">{tiktokConfig.connected_account.account_name}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="text-gray-600">{tiktokConfig.connected_account.last_synced_at ? new Date(tiktokConfig.connected_account.last_synced_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {tiktokConfig.status_message}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            {tiktokConfig.connected_account?.is_connected ? (
              <>
                <button
                  onClick={() => syncPlatform('tiktok')}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => disconnectPlatform('tiktok')}
                  className="py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnectClick(tiktokConfig)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gray-900 hover:bg-black text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Connect TikTok Ads</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* OPTION 4: LinkedIn Ads */}
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E5E7EB] hover:border-indigo-200 transition-all shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0A66C2] text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  in
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900">LinkedIn Ads</h3>
                  <span className="text-xs font-medium text-gray-500">Sponsored Content & InMail</span>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  linkedinConfig.connected_account?.is_connected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {linkedinConfig.connected_account?.is_connected ? '✓ Connected' : 'Not Connected'}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Connect LinkedIn Ads to retrieve campaign reporting data.
            </p>

            {linkedinConfig.connected_account?.is_connected ? (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Account:</span>
                  <span className="font-semibold font-mono text-gray-900">{linkedinConfig.connected_account.account_name}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="text-gray-500">Last Sync:</span>
                  <span className="text-gray-600">{linkedinConfig.connected_account.last_synced_at ? new Date(linkedinConfig.connected_account.last_synced_at).toLocaleTimeString() : 'Just now'}</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {linkedinConfig.status_message}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
            {linkedinConfig.connected_account?.is_connected ? (
              <>
                <button
                  onClick={() => syncPlatform('linkedin')}
                  disabled={isSyncing}
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  onClick={() => disconnectPlatform('linkedin')}
                  className="py-2 px-3 rounded-xl text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnectClick(linkedinConfig)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#0A66C2] hover:bg-[#004182] text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Connect LinkedIn Ads</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Campaign Selector Panel (Requirement #10) */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Select Connected Campaign to Ingest
            </h3>
            <p className="text-xs text-gray-500">
              Choose an ad account and campaign to pull fresh reporting data into the diagnosis pipeline.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            Official Platform API
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Platform */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="meta">Meta Ads</option>
              <option value="google">Google Ads</option>
              <option value="tiktok">TikTok Ads</option>
              <option value="linkedin">LinkedIn Ads</option>
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Ad Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              disabled={accounts.length === 0}
              className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
              {accounts.length === 0 && <option value="">No accounts found</option>}
            </select>
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Campaign
            </label>
            <select
              value={selectedCampaignId}
              onChange={(e) => {
                setSelectedCampaignId(e.target.value);
                const found = campaignList.find((c) => c.id === e.target.value);
                if (found) setSelectedCampaignName(found.name);
              }}
              disabled={campaignList.length === 0}
              className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            >
              {campaignList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              {campaignList.length === 0 && <option value="">No campaigns available</option>}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="last_7d">Last 7 Days</option>
              <option value="last_14d">Last 14 Days</option>
              <option value="last_30d">Last 30 Days</option>
              <option value="last_90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Ingests real campaign metrics into Common Normalized Campaign Data model.
          </span>
          <button
            onClick={handleAnalyzeCampaign}
            disabled={isImporting || !selectedCampaignName}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Analyze Campaign</span>
          </button>
        </div>
      </div>

      {/* 4. Alternative Fallback Ingestion Routes (Requirement #2) */}
      <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Alternative Data Sources
          </span>
          <span className="text-xs font-mono text-gray-400">
            Offline / Manual Support
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Option A: Upload CSV */}
          <button
            onClick={() => setActiveView('upload')}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <FileSpreadsheet className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold text-gray-900 mb-0.5">Upload CSV</h4>
            <p className="text-[11px] text-gray-500">
              Import exported CSV records from any advertising platform or BI warehouse.
            </p>
          </button>

          {/* Option B: Enter Data Manually */}
          <button
            onClick={() => setActiveView('upload')}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <Edit3 className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold text-gray-900 mb-0.5">Enter Data Manually</h4>
            <p className="text-[11px] text-gray-500">
              Type in high-level campaign reach, impressions, clicks, conversions, and spend.
            </p>
          </button>

          {/* Option C: Use Demo Data */}
          <button
            onClick={resetToDemo}
            className="p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-xs text-left transition-all group cursor-pointer"
          >
            <Database className="w-6 h-6 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold text-gray-900 mb-0.5">Use Demo Data</h4>
            <p className="text-[11px] text-gray-500">
              Instant access to Summer Sale Campaign with pre-calculated benchmarks.
            </p>
          </button>
        </div>
      </div>

      {/* Developer Testing / Sandbox Connection Modal */}
      {sandboxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-gray-900 text-sm">
                  {sandboxPlatform.toUpperCase()} Integration Setup
                </h3>
              </div>
              <button
                onClick={() => setSandboxModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Production API Approval Required</span>
              </div>
              <p className="leading-relaxed">
                Official {sandboxPlatform.toUpperCase()} OAuth requires approved client credentials in your developer app console. You can connect a Sandbox / Test account now to verify all reporting workflows.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={sandboxAccountName}
                  onChange={(e) => setSandboxAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                  Target Platform
                </label>
                <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 capitalize">
                  {sandboxPlatform} Ads
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSandboxModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await connectPlatformTest(sandboxPlatform, sandboxAccountName);
                  setSandboxModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Connect Sandbox Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
