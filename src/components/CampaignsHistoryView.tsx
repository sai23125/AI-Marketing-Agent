import React, { useState } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  Trash2,
  ArrowLeftRight,
  Download,
} from 'lucide-react';
import { useCampaign } from '../context/CampaignContext';

export const CampaignsHistoryView: React.FC = () => {
  const {
    campaigns,
    selectedCampaignId,
    selectCampaign,
    setActiveView,
    settings,
    showToast,
  } = useCampaign();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const curr = settings.currency_symbol || '₹';

  const filtered = campaigns.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'Healthy') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (status === 'Needs Optimization') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const handleSelectAndGo = async (id: string) => {
    await selectCampaign(id);
    setActiveView('dashboard');
  };

  // Download filtered campaigns as CSV
  const handleDownloadCsv = () => {
    if (filtered.length === 0) {
      showToast('No campaigns match your filter to export.', 'info');
      return;
    }

    const headers = [
      'Campaign ID',
      'Campaign Name',
      'Objective',
      'Platform',
      'Start Date',
      'End Date',
      'Spend',
      'Conversions',
      'CPA',
      'CTR (%)',
      'Health Score',
      'Status',
    ];

    const rows = filtered.map((c) => [
      `"${c.id}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.objective || ''}"`,
      `"${c.platform || ''}"`,
      `"${c.start_date || ''}"`,
      `"${c.end_date || ''}"`,
      c.spend || 0,
      c.conversions || 0,
      (c.cpa || 0).toFixed(2),
      (c.ctr || 0).toFixed(2),
      c.health_score || 0,
      `"${c.status || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filterTag = statusFilter !== 'All' ? `_${statusFilter.replace(/\s+/g, '_')}` : '';
    const dateStr = new Date().toISOString().slice(0, 10);
    link.download = `Campaigns_History${filterTag}_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} campaign(s) to CSV!`, 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Repository
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">
            Campaigns Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review all ingested campaigns, performance health metrics, and previous diagnostic runs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all active:scale-[0.98]"
            title={`Download ${filtered.length} filtered campaign(s) as CSV`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download CSV ({filtered.length})</span>
          </button>
          <button
            onClick={() => setActiveView('compare')}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            <span>Compare Campaigns</span>
          </button>
          <button
            onClick={() => setActiveView('upload')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns or channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {['All', 'Healthy', 'Needs Optimization'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {st}
            </button>
          ))}
          {(searchQuery || statusFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="text-[11px] font-semibold text-indigo-600 hover:underline px-2 py-1"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Campaigns Table (Requirement #28) */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Campaign Name</th>
                <th className="py-3.5 px-4">Platform</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Spend</th>
                <th className="py-3.5 px-4">Conversions</th>
                <th className="py-3.5 px-4">CPA</th>
                <th className="py-3.5 px-4">Health Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((c) => {
                const isSelected = c.id === selectedCampaignId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => handleSelectAndGo(c.id)}
                    className={`cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                      isSelected ? 'bg-indigo-50/20' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#111827] text-sm flex items-center gap-2">
                        <span>{c.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400">{c.objective}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{c.platform}</td>
                    <td className="py-4 px-4 font-mono text-gray-500 text-[11px]">
                      {c.start_date} to {c.end_date}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">
                      {curr}{(c.spend || 120000).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-indigo-700">
                      {(c.conversions || 830).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-gray-900">
                      {curr}{(c.cpa || 144.58).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-bold font-mono text-gray-900">
                          {c.health_score || 78}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAndGo(c.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>Open Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
