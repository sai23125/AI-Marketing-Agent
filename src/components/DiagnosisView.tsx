import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck,
  Filter,
  Users,
  AlertOctagon,
  FileText,
  RefreshCw,
  FileDown,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { KeyFinding } from '../types/campaign';
import { generateCampaignDiagnosisPdf } from '../utils/pdfGenerator';

export const DiagnosisView: React.FC = () => {
  const { diagnosis, selectedCampaign, analyticsData, settings, showToast, runDiagnosis, isAnalyzing, setActiveView } = useCampaign();

  if (!diagnosis) return null;

  const handleExportPdf = () => {
    if (!selectedCampaign || !analyticsData) return;
    try {
      generateCampaignDiagnosisPdf(
        selectedCampaign,
        analyticsData.kpis,
        analyticsData.health,
        analyticsData.funnel,
        analyticsData.audiences,
        analyticsData.platforms,
        diagnosis,
        settings
      );
      showToast('Diagnosis PDF exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export PDF.', 'error');
    }
  };

  const severityStyles = {
    high: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High Severity',
    },
    medium: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Medium Severity',
    },
    low: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Low Severity',
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Agentic Diagnosis
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            AI Campaign Diagnosis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Synthesized reasoning grounded in pre-calculated deterministic KPIs and audience cohorts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span>{diagnosis.ai_provider}</span>
          </span>

          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => runDiagnosis()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            {isAnalyzing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Re-run Diagnosis</span>
          </button>
        </div>
      </div>

      {/* 7-Stage Agent Workflow Pipeline Visualizer (Requirement #21) */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Agent Workflow Execution Stages</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {diagnosis.agent_workflow_stages.map((stage) => (
            <div
              key={stage.stage_number}
              className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold text-indigo-600">
                  0{stage.stage_number}
                </span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xs font-bold text-gray-900 leading-tight">
                {stage.name}
              </div>
              <div className="text-[10px] text-gray-400 mt-1 line-clamp-2">
                {stage.details}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Diagnostic Summary */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-indigo-300" />
          <span>Executive Diagnostic Summary</span>
        </div>
        <p className="text-base sm:text-lg font-medium text-white/95 leading-relaxed">
          &ldquo;{diagnosis.summary}&rdquo;
        </p>
      </div>

      {/* Key Findings Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-[#111827]">
              Key Diagnostic Findings
            </h3>
            <p className="text-xs text-gray-500">
              Rigid distinction between verified observations and explanatory hypotheses
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-400">
            {diagnosis.key_findings.length} Findings Identified
          </span>
        </div>

        <div className="space-y-4">
          {diagnosis.key_findings.map((finding: KeyFinding, idx: number) => {
            const style = severityStyles[finding.severity] || severityStyles.medium;
            const confPct = Math.round((finding.confidence || 0.8) * 100);

            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-gray-200 bg-[#F8FAFC] space-y-3 hover:border-indigo-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-base font-bold text-[#111827]">
                    {idx + 1}. {finding.issue}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-700 font-mono">
                      Confidence: {confPct}%
                    </span>
                  </div>
                </div>

                {/* Observed Evidence */}
                <div className="p-3 rounded-lg bg-white border border-gray-200 text-xs">
                  <span className="font-bold text-gray-900 block mb-1">
                    Observed Analytical Fact:
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    {finding.evidence}
                  </p>
                </div>

                {/* Possible Causes */}
                {finding.possible_causes && finding.possible_causes.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/80 text-xs space-y-1">
                    <span className="font-bold text-amber-900 block">
                      Possible Causes (Requires verification testing):
                    </span>
                    <ul className="space-y-1 text-gray-700 pl-1">
                      {finding.possible_causes.map((c, cIdx) => (
                        <li key={cIdx} className="leading-snug">
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel & Audience Reasoning Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Funnel Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <Filter className="w-4 h-4" />
            <span>Funnel Leakage Analysis</span>
          </div>
          <h4 className="text-base font-bold text-[#111827]">
            Primary Constraint: {diagnosis.funnel_analysis.bottleneck_stage}
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {diagnosis.funnel_analysis.summary}
          </p>
          <div className="space-y-1.5 pt-2">
            {diagnosis.funnel_analysis.dropoff_observations.map((obs, i) => (
              <div key={i} className="text-xs text-gray-700 p-2 rounded-lg bg-gray-50 border border-gray-100">
                • {obs}
              </div>
            ))}
          </div>
        </div>

        {/* Audience Analysis */}
        <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Audience Behavioral Disparities</span>
          </div>
          <h4 className="text-base font-bold text-[#111827]">
            Objective Segment Performance
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <span className="font-bold text-emerald-900">Highest Conversion Rate: </span>
              <span className="text-emerald-950 font-medium">{diagnosis.audience_analysis.highest_conversion_segment}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-200">
              <span className="font-bold text-indigo-900">Lowest Acquisition Cost (CPA): </span>
              <span className="text-indigo-950 font-medium">{diagnosis.audience_analysis.lowest_cpa_segment}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
              <span className="font-bold text-amber-900">Highest Click-Through Rate: </span>
              <span className="text-amber-950 font-medium">{diagnosis.audience_analysis.highest_ctr_segment}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-200">
              <span className="font-bold text-rose-900">Needs Attention: </span>
              <span className="text-rose-950 font-medium">{diagnosis.audience_analysis.underperforming_segment}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 pt-1">
            {diagnosis.audience_analysis.notes}
          </p>
        </div>
      </div>

      {/* Data Limitations (Requirement #24, #26) */}
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4 text-gray-500" />
          <span>Data Limitations & Analytical Boundaries</span>
        </div>
        <ul className="space-y-1 text-xs text-gray-600 pl-4 list-disc">
          {diagnosis.data_limitations.map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setActiveView('dashboard')}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={() => setActiveView('recommendations')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md"
        >
          <span>View Actionable Recommendations</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
