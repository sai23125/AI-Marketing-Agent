import React from 'react';
import {
  Layers,
  CheckCircle2,
  FileCheck,
  Calculator,
  AlertTriangle,
  Users,
  Brain,
  Sparkles,
  FileText,
  X,
  ArrowDown,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

interface WorkflowArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowArchitectureModal: React.FC<WorkflowArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const stages = [
    {
      num: 1,
      title: 'Data Validator',
      type: 'Deterministic',
      icon: <FileCheck className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
      description:
        'Enforces schema rules, non-negativity checks, date sequences, and physical constraints (clicks ≤ impressions, conversions ≤ clicks).',
    },
    {
      num: 2,
      title: 'KPI Calculator',
      type: 'Deterministic',
      icon: <Calculator className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-200',
      description:
        'Computes mathematical metrics (CTR, CPA, CPM, CPC, CVR, Engagement Rate) with division-by-zero protection. Never generates NaN or Infinity.',
    },
    {
      num: 3,
      title: 'Rule-Based Diagnosis Engine',
      type: 'Deterministic',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
      description:
        'Checks configurable benchmarks: High CPA, Low Conversion Efficiency, Engagement-to-Conversion Gap, and Audience Disparities.',
    },
    {
      num: 4,
      title: 'Audience Analyzer',
      type: 'Deterministic',
      icon: <Users className="w-5 h-5 text-violet-600" />,
      bg: 'bg-violet-50 border-violet-200',
      description:
        'Evaluates demographic segments along isolated criteria (Highest CVR, Lowest CPA, Highest CTR) rather than arbitrary blended rankings.',
    },
    {
      num: 5,
      title: 'AI Reasoning Agent',
      type: 'Agentic AI',
      icon: <Brain className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50 border-purple-200',
      description:
        'Receives pre-computed mathematical facts. Formulates hypotheses, distinguishes Observed Facts from Possible Causes, and attaches confidence ratings.',
    },
    {
      num: 6,
      title: 'Recommendation Generator',
      type: 'Agentic AI',
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
      description:
        'Generates actionable, prioritized testing steps (Audience, Creative, Budget, Conversion) and designates concrete post-test measurement metrics.',
    },
    {
      num: 7,
      title: 'Report Generator',
      type: 'Presentation',
      icon: <FileText className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50 border-cyan-200',
      description:
        'Compiles an executive-ready diagnostic summary, health score card, funnel analysis, and exportable PDF/JSON artifacts.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#111827]">
              AI Agent Architecture & Pipeline
            </h3>
            <p className="text-xs text-gray-500">
              Strict separation between deterministic computation and AI reasoning.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 font-medium my-4">
          <strong className="font-bold text-indigo-900">Architecture Rule: </strong>
          The AI never calculates basic metrics itself. Metrics are computed in code first, and then provided as structured evidence to the AI reasoning layer.
        </div>

        <div className="space-y-3 py-2">
          {stages.map((st, idx) => (
            <div key={st.num} className="relative">
              {idx > 0 && (
                <div className="flex justify-center -my-1 py-1">
                  <ArrowDown className="w-3.5 h-3.5 text-gray-300" />
                </div>
              )}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3.5 ${st.bg} shadow-2xs`}
              >
                <div className="p-2 rounded-lg bg-white border border-gray-200 shadow-2xs shrink-0">
                  {st.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-xs font-bold text-[#111827]">
                      Stage {st.num}: {st.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-700">
                      {st.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {st.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">Trizen Ventures AI Framework</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
