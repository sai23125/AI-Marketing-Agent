import React from 'react';
import { HelpCircle, Calculator, Brain, ShieldCheck, X, BookOpen } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useCampaign();
  if (!isOpen) return null;

  const curr = settings.currency_symbol || '₹';

  const formulas = [
    { name: 'CTR (Click-Through Rate)', formula: '(Clicks / Impressions) × 100', note: 'Expressed as a percentage. Measures ad creative resonance.' },
    { name: 'Engagement Rate', formula: '(Engagement / Impressions) × 100', note: 'Social interactions relative to impressions.' },
    { name: 'Conversion Rate (CVR)', formula: '(Conversions / Clicks) × 100', note: 'Percentage of click visitors who complete the designated goal.' },
    { name: 'CPC (Cost Per Click)', formula: 'Spend / Clicks', note: 'Unit cost per visitor driven to destination.' },
    { name: 'CPA (Cost Per Acquisition)', formula: 'Spend / Conversions', note: 'Blended direct acquisition expense per converted customer.' },
    { name: 'CPM (Cost Per Mille)', formula: '(Spend / Impressions) × 1000', note: 'Cost per 1,000 ad exposures in the auction.' },
    { name: 'Campaign Health Score', formula: '0.25(CTR) + 0.20(Eng) + 0.30(CVR) + 0.25(CPA Efficiency)', note: 'Configurable deterministic weighting between 0 and 100.' },
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
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#111827]">
              Help, Documentation & Formulas
            </h3>
            <p className="text-xs text-gray-500">
              Trizen Ventures Student Project • Web Development + Vibe Coding + Agentic AI
            </p>
          </div>
        </div>

        {/* Core architectural rule */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 font-medium my-4">
          <strong className="font-bold text-indigo-900">Zero-Hallucination Design: </strong>
          Deterministic analytics are strictly segregated from AI reasoning. Metrics are calculated by backend/TypeScript logic first, preventing math hallucinations. The AI only interprets pre-computed figures.
        </div>

        {/* Formulas list */}
        <div className="space-y-3 py-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Deterministic Marketing Formulas</span>
          </h4>

          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-[#F8FAFC] overflow-hidden">
            {formulas.map((f) => (
              <div key={f.name} className="p-3 text-xs">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-gray-900">{f.name}</span>
                  <code className="font-mono text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-gray-200">
                    {f.formula}
                  </code>
                </div>
                <p className="text-[11px] text-gray-500">{f.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Layer integration guide */}
        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
          <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Connecting OpenRouter AI</span>
          </h4>
          <p className="text-gray-600 leading-relaxed">
            The platform supports OpenRouter (model: <code className="font-mono bg-white px-1 py-0.5 rounded">openrouter/free</code>). Set the environment variable <code className="font-mono bg-white px-1 py-0.5 rounded">OPENROUTER_API_KEY</code> on your host. If no key is configured or network is offline, the application smoothly engages its <strong>Deterministic Fallback Mode</strong> without interrupting user workflow.
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
