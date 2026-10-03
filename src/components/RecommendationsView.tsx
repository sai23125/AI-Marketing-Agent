import React, { useState } from 'react';
import {
  CheckCircle2,
  Filter,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  X,
  Clock,
  Compass,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { Recommendation } from '../types/campaign';

export const RecommendationsView: React.FC = () => {
  const { recommendations, selectedCampaign, runDiagnosis, isAnalyzing } = useCampaign();
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'HIGH' | 'MEDIUM' | 'LOW'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedRecModal, setSelectedRecModal] = useState<Recommendation | null>(null);

  const categories = [
    'All',
    'Audience',
    'Creative',
    'Budget',
    'Conversion',
    'Platform',
    'Landing Page',
    'Funnel',
  ];

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchPriority = priorityFilter === 'All' || rec.priority === priorityFilter;
    const matchCategory = categoryFilter === 'All' || rec.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchPriority && matchCategory;
  });

  const priorityStyles = {
    HIGH: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      border: 'border-l-4 border-l-rose-500',
    },
    MEDIUM: {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      border: 'border-l-4 border-l-amber-500',
    },
    LOW: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      border: 'border-l-4 border-l-blue-500',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Agentic Optimization Playbook
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            AI Optimization Recommendations
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Prioritized actions based on campaign performance and deterministic evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runDiagnosis()}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate Recommendations</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Priority Tabs */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Priority:
          </span>
          {(['All', 'HIGH', 'MEDIUM', 'LOW'] as const).map((p) => {
            const isSelected = priorityFilter === p;
            return (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-gray-400 mr-1">Category:</span>
          {categories.map((c) => {
            const isSelected = categoryFilter.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRecommendations.map((rec) => {
          const style = priorityStyles[rec.priority] || priorityStyles.MEDIUM;
          return (
            <div
              key={rec.id}
              className={`bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${style.border}`}
            >
              <div>
                {/* Header: Priority & Category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${style.badge}`}
                  >
                    {rec.priority} Priority
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {rec.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#111827] leading-snug mb-2">
                  {rec.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {rec.description}
                </p>

                {/* Evidence / Reason Box */}
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-gray-100 text-xs space-y-2 mb-4">
                  <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Evidence / Reason:</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {rec.reason}
                  </p>

                  <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1 pt-1 border-t border-gray-200">
                    <Compass className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Suggested Action:</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {rec.suggested_action}
                  </p>
                </div>
              </div>

              {/* Footer: Measurement Metric + View Details */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase text-gray-400 block">
                    Measure:
                  </span>
                  <span className="font-semibold text-gray-800 text-[11px] truncate block">
                    {rec.measurement_metric}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedRecModal(rec)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRecommendations.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-sm">
            No recommendations match your current filter selection.
          </p>
          <button
            onClick={() => {
              setPriorityFilter('All');
              setCategoryFilter('All');
            }}
            className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* View Details Interactive Modal */}
      {selectedRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-gray-200 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedRecModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  priorityStyles[selectedRecModal.priority]?.badge
                }`}
              >
                {selectedRecModal.priority} Priority
              </span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {selectedRecModal.category}
              </span>
            </div>

            <h3 className="text-xl font-black text-[#111827] tracking-tight mb-2">
              {selectedRecModal.title}
            </h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
              {selectedRecModal.description}
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">
                  Analytical Evidence & Reason
                </span>
                <p className="text-gray-700 leading-relaxed text-xs">
                  {selectedRecModal.reason}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[10px]">
                  Prescribed Action Plan
                </span>
                <p className="text-indigo-950 leading-relaxed text-xs">
                  {selectedRecModal.suggested_action}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                  Measurement Criteria & Verification
                </span>
                <p className="text-emerald-950 leading-relaxed text-xs">
                  {selectedRecModal.measurement_metric}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedRecModal(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
