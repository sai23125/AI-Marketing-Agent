import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Sliders,
  Database,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { DEFAULT_SETTINGS } from '../utils/analyticsEngine';
import { api } from '../services/api';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, showToast, integrations, setActiveView } = useCampaign();
  const [form, setForm] = useState({ ...settings });
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    loadDbStatus();
  }, []);

  const loadDbStatus = async () => {
    const res = await api.getDatabaseStatus();
    if (res) setDbStatus(res);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
  };

  const handleReset = async () => {
    setForm({ ...DEFAULT_SETTINGS });
    await updateSettings(DEFAULT_SETTINGS);
    showToast('Settings reset to default baseline', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              System Configuration
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Platform Settings & Architecture
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure analytical thresholds, API integrations, agent parameters, and database entities.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Integration Settings (Requirement #35) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-base font-bold text-[#111827]">
                1. Integration Settings (Official Platform APIs)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('platforms')}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Manage Connections →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">Meta Marketing API</strong>
                <span className="text-[10px] font-mono text-gray-500">META_CLIENT_ID</span>
              </div>
              <p className="text-[11px] text-gray-500">Facebook & Instagram Ads Graph API v19.0. OAuth 2.0 with read_insights.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">Google Ads API</strong>
                <span className="text-[10px] font-mono text-gray-500">GOOGLE_CLIENT_ID</span>
              </div>
              <p className="text-[11px] text-gray-500">Search, Display, and Performance Max reporting via official Google Ads v16.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">TikTok Business API</strong>
                <span className="text-[10px] font-mono text-gray-500">TIKTOK_CLIENT_KEY</span>
              </div>
              <p className="text-[11px] text-gray-500">Advertiser reporting endpoints with daily campaign stat dimensions.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-gray-900">LinkedIn Marketing API</strong>
                <span className="text-[10px] font-mono text-gray-500">LINKEDIN_CLIENT_ID</span>
              </div>
              <p className="text-[11px] text-gray-500">B2B sponsored content analytics via RestLi protocol.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Configurable Diagnostic Thresholds (Requirement #35) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-[#111827]">
              2. Analysis Settings (Diagnostic Rule Thresholds)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                CTR Warning Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                value={form.ctr_warning_threshold}
                onChange={(e) => setForm({ ...form, ctr_warning_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Flags creative underperformance when overall or audience CTR drops below this value.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Conversion Rate (CVR) Warning Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="25"
                value={form.cvr_warning_threshold}
                onChange={(e) => setForm({ ...form, cvr_warning_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Flags landing page or checkout friction when CVR drops below threshold.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Target CPA Benchmark ({form.currency_symbol})
              </label>
              <input
                type="number"
                min="1"
                value={form.cpa_target}
                onChange={(e) => setForm({ ...form, cpa_target: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Campaigns exceeding target CPA are categorized as "Needs Optimization" or "Critical".
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Engagement Rate Threshold (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="30"
                value={form.engagement_threshold}
                onChange={(e) => setForm({ ...form, engagement_threshold: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Detects engagement-to-conversion gaps when interactions are healthy but conversions lag.
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: AI Diagnosis Settings (Requirement #35) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Cpu className="w-4 h-4 text-purple-600" />
            <h3 className="text-base font-bold text-[#111827]">
              3. AI Diagnosis Settings & Reasoning Guardrails
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                AI Reasoning Model
              </label>
              <select
                value={form.ai_model}
                onChange={(e) => setForm({ ...form, ai_model: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono"
              >
                <option value="openrouter/free">OpenRouter (google/gemini-2.0-flash-exp:free)</option>
                <option value="gemini-2.0-flash">Google Gemini 2.0 Flash</option>
                <option value="deterministic-only">Deterministic Rule Engine (Offline Only)</option>
              </select>
              <span className="text-[10px] text-gray-400 mt-1 block">
                The agent reasons exclusively over pre-validated deterministic metrics and never hallucinates numbers.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Temperature ({form.temperature})
              </label>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Lower values (0.2–0.4) enforce analytical precision and adhere strictly to provided evidence.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Data Settings & Database Entities (Requirement #27, #35) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Database className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-bold text-[#111827]">
              4. Data Settings & Database Entities (Requirement #27)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Currency Symbol
              </label>
              <select
                value={form.currency_symbol}
                onChange={(e) => setForm({ ...form, currency_symbol: e.target.value })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Max Allowed CSV Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={form.max_csv_size_mb}
                onChange={(e) => setForm({ ...form, max_csv_size_mb: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-xl font-mono"
              />
            </div>
          </div>

          {/* Database Entities Status (Requirement #27) */}
          {dbStatus && dbStatus.database_entities && (
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Active Database Schema Entities (Requirement #27)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block">Campaigns</span>
                  <span className="font-bold font-mono text-gray-900">{dbStatus.database_entities.campaigns}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block">Daily Metrics</span>
                  <span className="font-bold font-mono text-gray-900">{dbStatus.database_entities.campaign_metrics}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block">Connected Accounts</span>
                  <span className="font-bold font-mono text-indigo-600">{dbStatus.database_entities.connected_accounts_active} active</span>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-[10px] text-gray-500 uppercase block">Diagnoses</span>
                  <span className="font-bold font-mono text-gray-900">{dbStatus.database_entities.diagnoses}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
