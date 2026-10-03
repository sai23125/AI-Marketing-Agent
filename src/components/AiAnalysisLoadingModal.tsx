import React from 'react';
import { Sparkles, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const AiAnalysisLoadingModal: React.FC = () => {
  const { isAnalyzing, analysisStep } = useCampaign();

  if (!isAnalyzing) return null;

  const steps = [
    { title: 'Validating campaign data', detail: 'Schema & non-negativity checks' },
    { title: 'Calculating KPIs', detail: 'CTR, CPA, CPM, CPC & CVR formulas' },
    { title: 'Detecting performance issues', detail: 'Thresholds & funnel leak anomalies' },
    { title: 'Analyzing audience segments', detail: 'Demographic cross-sections & CTR' },
    { title: 'Generating AI diagnosis', detail: 'Hypothesis generation & confidence scoring' },
    { title: 'Preparing recommendations', detail: 'Prioritized playbook & measurement metrics' },
  ];

  const isFinished = analysisStep >= 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-gray-200 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-[#111827]">
            {isFinished ? 'Analysis Complete' : 'Analyzing campaign data...'}
          </h3>
          <p className="text-xs text-gray-500">
            Separating deterministic calculations from agentic AI reasoning.
          </p>
        </div>

        {/* Steps sequence */}
        <div className="space-y-3 py-2">
          {steps.map((step, idx) => {
            const isDone = analysisStep > idx || isFinished;
            const isCurrent = analysisStep === idx && !isFinished;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-indigo-50/80 border border-indigo-200'
                    : isDone
                    ? 'bg-gray-50/50'
                    : 'opacity-40'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-indigo-900'
                        : isDone
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {step.detail}
                  </div>
                </div>

                {isDone && (
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    DONE
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom indicator */}
        <div className="pt-2 text-center text-[11px] text-gray-400 font-mono">
          AI Marketing Agent Pipeline • Active Stage
        </div>
      </div>
    </div>
  );
};
