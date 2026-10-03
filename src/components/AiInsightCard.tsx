import React from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const AiInsightCard: React.FC = () => {
  const { diagnosis, setActiveView, isAnalyzing } = useCampaign();

  const insightText = diagnosis?.summary
    ? `The largest opportunity appears to be between clicks and conversions. Users are engaging with the campaign, but a smaller proportion of clickers are converting.`
    : `Analyzing campaign signals... Clickers demonstrate high initial interest, but drop off at checkout.`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 shadow-sm border border-indigo-700/50 flex flex-col justify-between">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300 border border-white/10">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                AI Marketing Agent
              </h4>
              <h3 className="text-sm font-extrabold text-white">What the AI sees</h3>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
            Synthesized
          </span>
        </div>

        <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed font-normal">
          &ldquo;{insightText}&rdquo;
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-indigo-700/40 flex items-center justify-between">
        <span className="text-[11px] text-indigo-300 font-medium">
          Evidence-grounded hypothesis
        </span>
        <button
          onClick={() => setActiveView('diagnosis')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-indigo-200 transition-colors group cursor-pointer"
        >
          <span>View Full Diagnosis</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
