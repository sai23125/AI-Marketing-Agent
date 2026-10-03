import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertOctagon,
  Download,
  Sparkles,
  HelpCircle,
  FormInput,
  ArrowRight,
  RefreshCw,
  FileText,
  Share2,
  Database,
  Layers,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';
import {
  validateCsvData,
  REQUIRED_CSV_COLUMNS,
  downloadSampleCsvFile,
  generateSampleCsv,
} from '../utils/csvValidator';
import { CsvValidationResult } from '../types/campaign';

export const CsvUploadView: React.FC = () => {
  const { uploadCsvData, createManualCampaign, isAnalyzing, runDiagnosis, settings, setActiveView, selectCampaign, resetToDemo } = useCampaign();
  const [activeTab, setActiveTab] = useState<'csv' | 'manual' | 'demo'>('csv');

  // CSV Drag & Drop State
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: 'Summer Flash Sale',
    objective: 'Conversions',
    platform: 'Instagram',
    start_date: '2026-09-01',
    end_date: '2026-09-30',
    reach: 125000,
    impressions: 230000,
    engagement: 18500,
    clicks: 12400,
    conversions: 830,
    spend: 120000,
    audience_segment: 'Core Shoppers',
    age_group: '25–34',
    gender: 'All',
    location: 'Metro Cities',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selected or dropped
  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File exceeds 10MB limit.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) || '';
      setCsvRawText(text);
      const result = validateCsvData(text);
      setValidationResult(result);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSampleInValidator = () => {
    const sample = generateSampleCsv();
    setFileName('sample_summer_sale.csv');
    setCsvRawText(sample);
    const result = validateCsvData(sample);
    setValidationResult(result);
  };

  const handleAnalyzeCsv = async () => {
    if (!csvRawText || !validationResult || !validationResult.valid) return;
    setIsProcessing(true);
    const ok = await uploadCsvData(csvRawText, {
      campaignName: validationResult.campaign_name_detected,
    });
    setIsProcessing(false);
    if (ok) {
      await runDiagnosis();
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    const ok = await createManualCampaign(manualForm);
    setIsProcessing(false);
    if (ok) {
      await runDiagnosis();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Live API Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600/80 flex items-center justify-center text-white shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">
              Connect Live Advertising Platforms Directly
            </h4>
            <p className="text-[11px] text-indigo-200">
              Import live reporting data directly from Meta, Google Ads, TikTok Ads, and LinkedIn Ads via official OAuth.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('platforms')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-indigo-950 hover:bg-indigo-50 shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <span>Connect Platforms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Data Ingestion Stage
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Ingest Marketing Data
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload CSV records, manually enter campaign figures, or explore with pre-loaded demo benchmarks.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('csv')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'csv'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Upload CSV
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Enter Data Manually
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'demo'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Use Demo Data
          </button>
        </div>
      </div>

      {activeTab === 'csv' ? (
        <div className="space-y-6">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center relative ${
              dragActive
                ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-100'
                : 'border-gray-300 hover:border-indigo-400 bg-gray-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-xs border border-indigo-100">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-[#111827] mb-1">
              Drop your CSV file here
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              or <span className="font-bold text-indigo-600 hover:underline">Browse Files</span> from your computer
            </p>

            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="px-2.5 py-1 rounded-md bg-gray-100 font-mono text-[11px] text-gray-700">
                Accepted: CSV
              </span>
              <span>•</span>
              <span>Max file size: 10 MB</span>
            </div>

            {fileName && (
              <div className="mt-4 px-4 py-2 rounded-xl bg-indigo-100 text-indigo-900 text-xs font-semibold flex items-center gap-2 border border-indigo-200">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Selected: {fileName}</span>
              </div>
            )}
          </div>

          {/* Quick Helper Actions: Download Sample CSV & Format specs */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Required Columns:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {REQUIRED_CSV_COLUMNS.map((col) => (
                  <span
                    key={col}
                    className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-mono text-[11px] border border-gray-200"
                  >
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleLoadSampleInValidator}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                Test With Sample Data
              </button>
              <button
                type="button"
                onClick={downloadSampleCsvFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Data Validation Screen (Requirement #18) */}
          {validationResult && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
                    <span>Data Validation</span>
                    {validationResult.valid ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Status: Ready for Analysis
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Status: Errors Detected
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Evaluated {validationResult.total_rows} records from '{validationResult.campaign_name_detected}'
                  </p>
                </div>

                {validationResult.valid && (
                  <button
                    onClick={handleAnalyzeCsv}
                    disabled={isProcessing || isAnalyzing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Analyze Campaign</span>
                  </button>
                )}
              </div>

              {/* Validation Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  { label: 'File uploaded', passed: true },
                  { label: 'Required columns detected', passed: !validationResult.errors.some((e) => e.column === 'Header') },
                  { label: 'Numeric values validated', passed: !validationResult.errors.some((e) => e.problem.includes('Non-numeric')) },
                  { label: 'No invalid negative values', passed: !validationResult.errors.some((e) => e.problem.includes('Negative')) },
                  { label: 'Campaign structure detected', passed: validationResult.valid },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                      item.passed
                        ? 'bg-emerald-50/60 text-emerald-900 border-emerald-200'
                        : 'bg-rose-50 text-rose-900 border-rose-200'
                    }`}
                  >
                    {item.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* If errors exist, clearly show Row number, Column, Problem, Suggested Fix */}
              {validationResult.errors.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>Errors Requiring Resolution ({validationResult.errors.length})</span>
                  </h4>

                  <div className="overflow-x-auto rounded-xl border border-rose-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-rose-50/80 text-rose-900 font-bold border-b border-rose-200">
                        <tr>
                          <th className="py-2.5 px-3">Row</th>
                          <th className="py-2.5 px-3">Column</th>
                          <th className="py-2.5 px-3">Problem</th>
                          <th className="py-2.5 px-3">Suggested Fix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 bg-white">
                        {validationResult.errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-rose-50/30">
                            <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                              {err.row > 0 ? `#${err.row}` : 'Header'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-gray-800">
                              {err.column}
                            </td>
                            <td className="py-2.5 px-3 text-gray-900 font-medium">
                              {err.problem}
                            </td>
                            <td className="py-2.5 px-3 text-indigo-700 font-medium">
                              {err.suggested_fix}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'manual' ? (
        /* Manual Data Input Form (Requirement #25) */
        <form
          onSubmit={handleManualSubmit}
          className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E7EB] shadow-xs space-y-6"
        >
          <div className="border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-[#111827]">
              Enter Campaign Data Manually
            </h3>
            <p className="text-xs text-gray-500">
              Provide campaign metrics directly to run the deterministic analytics and AI diagnosis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                required
                value={manualForm.name}
                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Campaign Objective
              </label>
              <select
                value={manualForm.objective}
                onChange={(e) => setManualForm({ ...manualForm, objective: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Conversions">Conversions</option>
                <option value="Lead Generation">Lead Generation</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="Traffic">Traffic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={manualForm.platform}
                onChange={(e) => setManualForm({ ...manualForm, platform: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Google Ads">Google Ads</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={manualForm.start_date}
                onChange={(e) => setManualForm({ ...manualForm, start_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={manualForm.end_date}
                onChange={(e) => setManualForm({ ...manualForm, end_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Total Spend ({settings.currency_symbol})
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.spend}
                onChange={(e) => setManualForm({ ...manualForm, spend: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Reach (Unique users)
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.reach}
                onChange={(e) => setManualForm({ ...manualForm, reach: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Impressions
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.impressions}
                onChange={(e) => setManualForm({ ...manualForm, impressions: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Engagement
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.engagement}
                onChange={(e) => setManualForm({ ...manualForm, engagement: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Clicks
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.clicks}
                onChange={(e) => setManualForm({ ...manualForm, clicks: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Conversions
              </label>
              <input
                type="number"
                min="0"
                required
                value={manualForm.conversions}
                onChange={(e) => setManualForm({ ...manualForm, conversions: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Audience Segment
              </label>
              <input
                type="text"
                value={manualForm.audience_segment}
                onChange={(e) => setManualForm({ ...manualForm, audience_segment: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Age Group
              </label>
              <select
                value={manualForm.age_group}
                onChange={(e) => setManualForm({ ...manualForm, age_group: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              >
                <option value="18–24">18–24</option>
                <option value="25–34">25–34</option>
                <option value="35–44">35–44</option>
                <option value="45+">45+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={manualForm.gender}
                onChange={(e) => setManualForm({ ...manualForm, gender: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              >
                <option value="All">All</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={manualForm.location}
                onChange={(e) => setManualForm({ ...manualForm, location: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Analyze Campaign</span>
            </button>
          </div>
        </form>
      ) : (
        /* Demo Data Presets Tab (Requirement #26) */
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 flex items-center gap-3">
            <Database className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong>DEMO DATA MODE:</strong> Pre-validated benchmark datasets for demonstration and offline exploration. Demo data is clearly identified throughout all dashboard views and never labeled as live data.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Summer Sale Campaign */}
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                  DEMO DATA
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Needs Optimization (78/100)
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-900">Summer Sale Campaign</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Multi-channel consumer e-commerce campaign with high CPA bottleneck and audience conversion disparities.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center text-xs">
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">Spend</span>
                  <span className="font-mono font-bold text-gray-900">{settings.currency_symbol}120,000</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">Conversions</span>
                  <span className="font-mono font-bold text-gray-900">830</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">CPA</span>
                  <span className="font-mono font-bold text-rose-600">{settings.currency_symbol}144.58</span>
                </div>
              </div>

              <button
                onClick={resetToDemo}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
              >
                Load Summer Sale Demo
              </button>
            </div>

            {/* B2B Enterprise Lead Gen */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-mono">
                  DEMO DATA
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Healthy (84/100)
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-gray-900">B2B Enterprise Lead Gen</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  High-ticket enterprise software lead generation across LinkedIn and Google Search with 15% conversion efficiency.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 text-center text-xs">
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">Spend</span>
                  <span className="font-mono font-bold text-gray-900">{settings.currency_symbol}144,000</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">Conversions</span>
                  <span className="font-mono font-bold text-gray-900">540</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-gray-400 block uppercase">CVR</span>
                  <span className="font-mono font-bold text-emerald-600">12.5%</span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await selectCampaign('camp_b2b_leadgen_2026');
                  setActiveView('dashboard');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
              >
                Load B2B Lead Gen Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
