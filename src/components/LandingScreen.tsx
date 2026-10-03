import React from 'react';
import {
  Sparkles,
  UploadCloud,
  ArrowRight,
  BarChart3,
  Brain,
  Users,
  CheckCircle2,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const LandingScreen: React.FC = () => {
  const { setActiveView, runDiagnosis, isAnalyzing, settings } = useCampaign();
  const curr = settings.currency_symbol || '₹';

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-2">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-14 shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Trizen Ventures • Vibe Coding + Agentic AI</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              AI Marketing Campaign Diagnosis Agent
            </h1>
            <p className="text-lg sm:text-xl font-medium text-indigo-200">
              &ldquo;Turn campaign data into clear, actionable decisions.&rdquo;
            </p>
          </div>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Analyze campaign performance, discover bottlenecks, understand audience behavior, and generate evidence-based optimization recommendations with AI.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => runDiagnosis()}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze Campaign</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('upload')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload CSV</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-indigo-200 hover:text-white transition-colors"
            >
              Explore Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Campaign Analytics',
            desc: 'Deterministic computation of CTR, CPA, CPM, CPC, and CVR without hallucination.',
            icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
            bg: 'bg-indigo-50 border-indigo-100',
            view: 'analytics' as const,
          },
          {
            title: 'AI Diagnosis',
            desc: 'Synthesizes pre-calculated evidence into hypotheses with confidence ratings.',
            icon: <Brain className="w-5 h-5 text-purple-600" />,
            bg: 'bg-purple-50 border-purple-100',
            view: 'diagnosis' as const,
          },
          {
            title: 'Audience Insights',
            desc: 'Objective demographic rankings by isolated criteria (Highest CVR, Lowest CPA).',
            icon: <Users className="w-5 h-5 text-emerald-600" />,
            bg: 'bg-emerald-50 border-emerald-100',
            view: 'dashboard' as const,
          },
          {
            title: 'Optimization Recommendations',
            desc: 'Actionable playbook categorized by Audience, Creative, Budget, and Conversion.',
            icon: <CheckCircle2 className="w-5 h-5 text-cyan-600" />,
            bg: 'bg-cyan-50 border-cyan-100',
            view: 'recommendations' as const,
          },
        ].map((f) => (
          <div
            key={f.title}
            onClick={() => setActiveView(f.view)}
            className="p-5 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${f.bg}`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-sm text-[#111827] mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
            <div className="mt-4 pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>View Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </section>

      {/* Workflow Visualization (Requirement #4) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Agentic Architecture Workflow</span>
          </h3>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Strict Separation of Logic
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
          {[
            { step: '01', title: 'Campaign Data', sub: 'CSV or manual metrics' },
            { step: '02', title: 'Analytics Engine', sub: 'Deterministic math' },
            { step: '03', title: 'AI Diagnosis', sub: 'Reasoning & hypotheses' },
            { step: '04', title: 'Recommendations', sub: 'Actionable playbook' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div className="w-full md:w-auto flex-1 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-center">
                <span className="font-mono text-[10px] font-bold text-indigo-600 block mb-0.5">
                  STEP {item.step}
                </span>
                <strong className="text-xs font-bold text-[#111827] block">
                  {item.title}
                </strong>
                <span className="text-[11px] text-gray-400 block mt-0.5">{item.sub}</span>
              </div>
              {idx < 3 && (
                <div className="text-gray-300 font-bold hidden md:block">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Sample Campaign Preview Card (Requirement #4) */}
      <section className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Pre-loaded Benchmark Preview
          </span>
          <h3 className="text-xl font-black text-[#111827]">
            Summer Sale Campaign Preview
          </h3>
          <p className="text-xs text-gray-500 max-w-xl">
            125,000 Reach • 230,000 Impressions • 12,400 Clicks • 830 Conversions • {curr}120,000 Spend. Demonstrates conversion bottleneck diagnosis.
          </p>
          <div className="flex flex-wrap gap-4 pt-1 text-xs font-mono">
            <span className="text-gray-700">CTR: <strong className="text-indigo-600">5.39%</strong></span>
            <span className="text-gray-700">CPA: <strong className="text-indigo-600">{curr}144.58</strong></span>
            <span className="text-gray-700">Health: <strong className="text-amber-600">78/100</strong> (Needs Optimization)</span>
          </div>
        </div>

        <button
          onClick={() => setActiveView('dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shrink-0"
        >
          <span>Open Campaign Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
};
