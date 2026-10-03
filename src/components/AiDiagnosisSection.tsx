import React from 'react';
import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { KeyFinding } from '../types/campaign';

export const AiDiagnosisSection: React.FC = () => {
  const { diagnosis, isAnalyzing, setActiveView } = useCampaign();

  if (!diagnosis) return null;

  const severityStyles = {
    high: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'High Severity',
      indicator: 'bg-rose-500',
    },
    medium: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Medium Severity',
      indicator: 'bg-amber-500',
    },
    low: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Low Severity',
      indicator: 'bg-blue-500',
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E5E7EB] shadow-xs space-y-5">
      {/* Header with Title and AI Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#111827]">
                AI Campaign Diagnosis
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" />
                AI Analysis Complete
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Evaluated via multi-stage agentic workflow: {diagnosis.ai_provider}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('diagnosis')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <span>Deep Diagnostic View</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Diagnostic Summary */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/40 to-transparent border border-indigo-100">
        <p className="text-sm font-semibold text-[#111827] leading-relaxed">
          &ldquo;{diagnosis.summary}&rdquo;
        </p>
      </div>

      {/* Key Findings List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Key Findings ({diagnosis.key_findings.length})
          </h4>
          <span className="text-[11px] text-gray-400">
            Strict separation: Observed Evidence vs Possible Causes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {diagnosis.key_findings.map((finding: KeyFinding, idx: number) => {
            const style = severityStyles[finding.severity] || severityStyles.medium;
            const confidencePct = Math.round((finding.confidence || 0.8) * 100);

            return (
              <div
                key={idx}
                className="rounded-xl border border-gray-200/90 bg-[#F8FAFC] p-4 flex flex-col justify-between hover:border-indigo-300 transition-all hover:shadow-xs"
              >
                <div>
                  {/* Top: Issue name + Severity badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-sm font-bold text-[#111827] leading-snug">
                      {finding.issue}
                    </h5>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Observed Evidence */}
                  <div className="mb-3 space-y-1">
                    <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      <span>Observed Fact:</span>
                    </div>
                    <p className="text-xs text-gray-600 pl-2.5 border-l-2 border-indigo-200">
                      {finding.evidence}
                    </p>
                  </div>

                  {/* Possible Causes (Hypotheses) */}
                  {finding.possible_causes && finding.possible_causes.length > 0 && (
                    <div className="space-y-1 mb-3">
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Possible Cause (Hypothesis):</span>
                      </div>
                      <ul className="text-xs text-gray-600 pl-2.5 border-l-2 border-amber-200 space-y-1">
                        {finding.possible_causes.slice(0, 2).map((cause, cIdx) => (
                          <li key={cIdx} className="leading-snug">
                            • {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom: Confidence score */}
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 font-medium">Confidence Rating</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${confidencePct}%` }}
                      />
                    </div>
                    <span className="font-mono font-bold text-indigo-700">
                      {confidencePct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
