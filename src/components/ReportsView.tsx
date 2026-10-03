import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  Building,
  Target,
  Sparkles,
  Award,
  FileDown,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import { generateCampaignDiagnosisPdf } from '../utils/pdfGenerator';

export const ReportsView: React.FC = () => {
  const { selectedCampaign, analyticsData, diagnosis, settings, showToast } = useCampaign();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!selectedCampaign || !analyticsData || !diagnosis) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
        <p className="text-gray-500 text-sm">Please select a campaign to view its diagnosis report.</p>
      </div>
    );
  }

  const { kpis, health, funnel, audiences, platforms } = analyticsData;
  const curr = settings.currency_symbol || '₹';

  // Handle Export PDF Document
  const handleExportPdf = () => {
    try {
      generateCampaignDiagnosisPdf(
        selectedCampaign,
        kpis,
        health,
        funnel,
        audiences,
        platforms,
        diagnosis,
        settings
      );
      showToast('PDF Report generated and downloaded successfully!', 'success');
    } catch (err: any) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF. You can also use Print to Save as PDF.', 'error');
    }
  };

  // Handle Download JSON
  const handleDownloadJson = () => {
    const reportData = {
      campaign: selectedCampaign,
      kpis,
      health,
      funnel,
      audiences,
      platforms,
      diagnosis,
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedCampaign.name.replace(/\s+/g, '_')}_Diagnosis_Report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Diagnosis report exported as JSON', 'success');
  };

  // Handle Print Report
  const handlePrint = () => {
    window.print();
  };

  // Handle Share Report
  const handleShare = () => {
    const summary = `AI Campaign Diagnosis Report: ${selectedCampaign.name}\nHealth Score: ${health.overall_score}/100 (${health.status})\nCTR: ${kpis.ctr}% | CPA: ${curr}${kpis.cpa}\nSummary: ${diagnosis.summary}`;
    navigator.clipboard.writeText(summary);
    showToast('Report summary copied to clipboard!', 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-[#111827]">
            Campaign Diagnosis Report
          </h2>
          <p className="text-xs text-gray-500">
            Audit-ready marketing performance & AI recommendation artifact
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <FileDown className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            <span>Print</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div
        ref={printAreaRef}
        className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E5E7EB] shadow-sm space-y-8 print:border-none print:shadow-none print:p-0"
      >
        {/* Document Header */}
        <div className="border-b border-gray-200 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                Trizen Ventures • Vibe Coding + Agentic AI
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              {selectedCampaign.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Campaign Diagnosis Report • Generated {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-flex flex-col items-end">
              <span className="text-xs text-gray-400 font-bold uppercase">Campaign Health</span>
              <div className="text-3xl font-black text-indigo-700">
                {health.overall_score} <span className="text-sm text-gray-400">/ 100</span>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full mt-1">
                {health.status}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Campaign Overview */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            1. Campaign Overview
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-gray-200 text-xs">
            <div>
              <span className="text-gray-400 block text-[11px]">Primary Objective</span>
              <strong className="text-gray-900">{selectedCampaign.objective}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Channel Scope</span>
              <strong className="text-gray-900">{selectedCampaign.platform}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Date Horizon</span>
              <strong className="text-gray-900">{selectedCampaign.start_date} to {selectedCampaign.end_date}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Diagnostic Provider</span>
              <strong className="text-indigo-700">{diagnosis.ai_provider}</strong>
            </div>
          </div>
        </div>

        {/* Section 2: Executive Performance & KPI Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            2. Verified KPI Matrix
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { l: 'Total Reach', v: kpis.reach.toLocaleString() },
              { l: 'Impressions', v: kpis.impressions.toLocaleString() },
              { l: 'Engagement', v: kpis.engagement.toLocaleString() },
              { l: 'Clicks', v: kpis.clicks.toLocaleString() },
              { l: 'Conversions', v: kpis.conversions.toLocaleString() },
              { l: 'CTR', v: `${kpis.ctr}%` },
              { l: 'CPA', v: `${curr}${kpis.cpa.toFixed(2)}` },
            ].map((k) => (
              <div key={k.l} className="p-3 rounded-xl border border-gray-200 bg-white">
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">{k.l}</span>
                <strong className="text-base font-black text-gray-900">{k.v}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Diagnostic Summary & Funnel Analysis */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            3. AI Diagnostic Analysis
          </h3>
          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <p className="text-sm font-semibold text-indigo-950 leading-relaxed">
              &ldquo;{diagnosis.summary}&rdquo;
            </p>
            <div className="text-xs text-gray-700 pt-2 border-t border-indigo-100 flex items-center justify-between">
              <span>Primary Funnel Bottleneck: <strong className="text-indigo-900">{diagnosis.funnel_analysis.bottleneck_stage}</strong></span>
              <span>Conversion Efficiency: <strong>{funnel.click_to_conversion_rate}% CVR</strong></span>
            </div>
          </div>
        </div>

        {/* Section 4: Key Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            4. Key Diagnostic Findings & Evidence
          </h3>
          <div className="space-y-3">
            {diagnosis.key_findings.map((f, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-[#F8FAFC] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-gray-900 text-sm">{i + 1}. {f.issue}</strong>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white border border-gray-200">
                    Severity: {f.severity} • Confidence: {Math.round(f.confidence * 100)}%
                  </span>
                </div>
                <p className="text-gray-700"><strong>Observed Evidence:</strong> {f.evidence}</p>
                {f.possible_causes.length > 0 && (
                  <p className="text-gray-600">
                    <strong>Hypothesized Cause:</strong> {f.possible_causes.join('; ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Recommendations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            5. Prioritized Action Recommendations
          </h3>
          <div className="space-y-3">
            {diagnosis.recommendations.map((r, i) => (
              <div key={r.id} className="p-4 rounded-xl border border-gray-200 bg-white text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-gray-900 text-sm">Action {i + 1}: {r.title}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {r.priority} Priority • {r.category}
                  </span>
                </div>
                <p className="text-gray-700">{r.description}</p>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 space-y-1 text-[11px]">
                  <div><strong>Plan:</strong> {r.suggested_action}</div>
                  <div><strong>Target Metric:</strong> {r.measurement_metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 6: Data Limitations */}
        <div className="space-y-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
          <h4 className="font-bold text-gray-600 uppercase text-[10px] tracking-wider">
            Data Limitations & Disclaimers
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            {diagnosis.data_limitations.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
