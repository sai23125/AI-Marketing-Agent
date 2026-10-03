import { jsPDF } from 'jspdf';
import {
  Campaign,
  CalculatedKPIs,
  CampaignHealth,
  MarketingFunnel,
  AudienceSegment,
  PlatformMetric,
  DiagnosisReport,
  AnalysisSettings,
} from '../types/campaign';

// Helper to add clean headers and footers across pages
function addHeaderFooter(doc: jsPDF, title: string, pageNum: number, totalPages: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Top header rule
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(14, 10, pageWidth - 28, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text('TRIZEN VENTURES • AI MARKETING CAMPAIGN DIAGNOSIS AGENT', 14, 8);
  doc.text(title.toUpperCase(), pageWidth - 14, 8, { align: 'right' });

  // Bottom footer rule
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Strict Separation: Deterministic Mathematical Analytics + Agentic AI Reasoning', 14, pageHeight - 7);
  doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
}

export function generateCampaignDiagnosisPdf(
  campaign: Campaign,
  kpis: CalculatedKPIs,
  health: CampaignHealth,
  funnel: MarketingFunnel,
  audiences: AudienceSegment[],
  platforms: PlatformMetric[],
  diagnosis: DiagnosisReport,
  settings: AnalysisSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const curr = settings.currency_symbol || '₹';
  let y = 22;

  // 1. Report Title & Meta
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39); // dark navy #111827
  doc.text(campaign.name, 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Campaign Diagnosis Report • Scope: ${campaign.platform} • Horizon: ${campaign.start_date} to ${campaign.end_date}`,
    14,
    y
  );
  y += 7;

  // 2. Health Score & Status Badge Card
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('Campaign Health Score:', 20, y + 8);

  doc.setFontSize(16);
  doc.setTextColor(99, 102, 241);
  doc.text(`${health.overall_score}`, 70, y + 9);
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('/ 100', 80, y + 9);

  // Status pill
  const isHealthy = health.status === 'Healthy';
  doc.setFillColor(isHealthy ? 220 : 254, isHealthy ? 252 : 243, isHealthy ? 231 : 199);
  doc.setDrawColor(isHealthy ? 187 : 252, isHealthy ? 247 : 211, isHealthy ? 208 : 77);
  doc.roundedRect(95, y + 4, 38, 7, 1.5, 1.5, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isHealthy ? 22 : 180, isHealthy ? 101 : 83, isHealthy ? 52 : 9);
  doc.text(health.status, 114, y + 8.5, { align: 'center' });

  // Breakdown text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Breakdown: CTR (${health.breakdown.ctr_score}%) • Engagement (${health.breakdown.engagement_score}%) • Conversion (${health.breakdown.conversion_score}%) • CPA Efficiency (${health.breakdown.cpa_score}%)`,
    20,
    y + 16
  );
  y += 26;

  // 3. KPI Grid Matrix
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('1. VERIFIED KEY PERFORMANCE INDICATORS', 14, y);
  y += 5;

  const kpiItems = [
    { label: 'Total Reach', val: kpis.reach.toLocaleString() },
    { label: 'Impressions', val: kpis.impressions.toLocaleString() },
    { label: 'Total Clicks', val: kpis.clicks.toLocaleString() },
    { label: 'Conversions', val: kpis.conversions.toLocaleString() },
    { label: 'CTR', val: `${kpis.ctr}%` },
    { label: 'CPA', val: `${curr}${kpis.cpa.toFixed(2)}` },
    { label: 'CVR', val: `${kpis.conversion_rate}%` },
    { label: 'Total Spend', val: `${curr}${kpis.spend.toLocaleString()}` },
  ];

  const colWidth = (pageWidth - 28) / 4;
  const rowHeight = 12;

  kpiItems.forEach((item, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    const boxX = 14 + col * colWidth;
    const boxY = y + row * rowHeight;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.rect(boxX, boxY, colWidth - 2, rowHeight - 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(item.label.toUpperCase(), boxX + 3, boxY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(17, 24, 39);
    doc.text(item.val, boxX + 3, boxY + 8.5);
  });

  y += 2 * rowHeight + 6;

  // 4. Executive AI Diagnosis Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('2. EXECUTIVE DIAGNOSTIC SUMMARY', 14, y);
  y += 4;

  doc.setFillColor(238, 242, 255); // light purple #EEF2FF
  doc.setDrawColor(199, 210, 254);
  const summaryLines = doc.splitTextToSize(`"${diagnosis.summary}"`, pageWidth - 36);
  const summaryBoxH = Math.max(12, summaryLines.length * 4.5 + 6);
  doc.roundedRect(14, y, pageWidth - 28, summaryBoxH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(67, 56, 202); // indigo-700
  doc.text(summaryLines, 18, y + 6);
  y += summaryBoxH + 7;

  // 5. Key Findings Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('3. KEY DIAGNOSTIC FINDINGS & EVIDENCE', 14, y);
  y += 5;

  diagnosis.key_findings.forEach((finding, idx) => {
    // Check page overflow
    if (y > 240) {
      doc.addPage();
      y = 22;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);

    const evidenceLines = doc.splitTextToSize(`Observed Evidence: ${finding.evidence}`, pageWidth - 36);
    const causesText = finding.possible_causes?.length ? `Possible Cause(s): ${finding.possible_causes.join('; ')}` : '';
    const causesLines = causesText ? doc.splitTextToSize(causesText, pageWidth - 36) : [];

    const cardHeight = 10 + evidenceLines.length * 4 + causesLines.length * 4;
    doc.roundedRect(14, y, pageWidth - 28, cardHeight, 1.5, 1.5, 'FD');

    // Finding title & severity badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`${idx + 1}. ${finding.issue}`, 18, y + 5.5);

    const confPct = Math.round((finding.confidence || 0.8) * 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`[Severity: ${finding.severity.toUpperCase()} • Confidence: ${confPct}%]`, pageWidth - 18, y + 5.5, { align: 'right' });

    let lineY = y + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(evidenceLines, 18, lineY);
    lineY += evidenceLines.length * 4;

    if (causesLines.length) {
      doc.setTextColor(146, 64, 14); // amber-800
      doc.text(causesLines, 18, lineY);
    }

    y += cardHeight + 4;
  });

  // Check page overflow for recommendations
  if (y > 210) {
    doc.addPage();
    y = 22;
  } else {
    y += 4;
  }

  // 6. Actionable Optimization Recommendations
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('4. PRIORITIZED OPTIMIZATION PLAYBOOK', 14, y);
  y += 5;

  diagnosis.recommendations.forEach((rec, idx) => {
    if (y > 245) {
      doc.addPage();
      y = 22;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);

    const descLines = doc.splitTextToSize(`Rationale: ${rec.reason || rec.description}`, pageWidth - 36);
    const actionLines = doc.splitTextToSize(`Action: ${rec.suggested_action}`, pageWidth - 36);

    const boxH = 12 + descLines.length * 4 + actionLines.length * 4;
    doc.roundedRect(14, y, pageWidth - 28, boxH, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    doc.text(`Action ${idx + 1}: ${rec.title}`, 18, y + 5.5);

    doc.setFontSize(7.5);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`[${rec.priority} PRIORITY • ${rec.category.toUpperCase()}]`, pageWidth - 18, y + 5.5, { align: 'right' });

    let recLineY = y + 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(descLines, 18, recLineY);
    recLineY += descLines.length * 4;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(actionLines, 18, recLineY);

    y += boxH + 4;
  });

  // Footer & stamp on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, 'Campaign Diagnosis Report', i, totalPages);
  }

  // Trigger download
  const safeFilename = `${campaign.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Diagnosis_Report.pdf`;
  doc.save(safeFilename);
}

export function generateComparisonPdf(
  campaignA: Campaign,
  campaignB: Campaign,
  dataA: { kpis: CalculatedKPIs; health: CampaignHealth },
  dataB: { kpis: CalculatedKPIs; health: CampaignHealth },
  metricRows: Array<{
    label: string;
    description: string;
    valA: number;
    valB: number;
    format: (v: number) => string;
    higherIsBetter: boolean;
  }>,
  aovA: number,
  aovB: number,
  settings: AnalysisSettings
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const curr = settings.currency_symbol || '₹';
  let y = 22;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  doc.text('Campaign Performance Comparison', 14, y);
  y += 5.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Side-by-side audit: ${campaignA.name} vs ${campaignB.name} • Generated ${new Date().toLocaleDateString()}`,
    14,
    y
  );
  y += 7;

  // Dual Campaign Summary Cards
  const halfW = (pageWidth - 32) / 2;

  // Card A
  doc.setFillColor(238, 242, 255); // light indigo
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(14, y, halfW, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text('CAMPAIGN A', 18, y + 5);

  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(doc.splitTextToSize(campaignA.name, halfW - 8)[0], 18, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Platform: ${campaignA.platform} • Health: ${dataA.health.overall_score}/100`, 18, y + 15);
  doc.text(`Spend: ${curr}${dataA.kpis.spend.toLocaleString()} • Conv: ${dataA.kpis.conversions}`, 18, y + 19);

  // Card B
  doc.setFillColor(250, 245, 255); // light purple
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(18 + halfW, y, halfW, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(147, 51, 234);
  doc.text('CAMPAIGN B', 22 + halfW, y + 5);

  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text(doc.splitTextToSize(campaignB.name, halfW - 8)[0], 22 + halfW, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Platform: ${campaignB.platform} • Health: ${dataB.health.overall_score}/100`, 22 + halfW, y + 15);
  doc.text(`Spend: ${curr}${dataB.kpis.spend.toLocaleString()} • Conv: ${dataB.kpis.conversions}`, 22 + halfW, y + 19);

  y += 28;

  // Comparison Matrix Table Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text('SIDE-BY-SIDE KPI MATRIX', 14, y);
  y += 4;

  const tableW = pageWidth - 28;
  const colMetricW = tableW * 0.36;
  const colValAW = tableW * 0.20;
  const colValBW = tableW * 0.20;
  const colDeltaW = tableW * 0.24;

  // Table header bar
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, tableW, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('METRIC', 16, y + 4.2);
  doc.text(campaignA.name.slice(0, 16).toUpperCase(), 14 + colMetricW + 2, y + 4.2);
  doc.text(campaignB.name.slice(0, 16).toUpperCase(), 14 + colMetricW + colValAW + 2, y + 4.2);
  doc.text('VARIANCE / ADVANTAGE', 14 + colMetricW + colValAW + colValBW + 2, y + 4.2);
  y += 6;

  // Table rows
  metricRows.forEach((row, idx) => {
    if (y > 265) {
      doc.addPage();
      y = 22;
    }

    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, tableW, 7, 'FD');

    // Metric Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(row.label, 16, y + 4.6);

    // Val A
    doc.setFont('helvetica', 'normal');
    doc.text(row.format(row.valA), 14 + colMetricW + 2, y + 4.6);

    // Val B
    doc.text(row.format(row.valB), 14 + colMetricW + colValAW + 2, y + 4.6);

    // Delta & Advantage
    const diff = row.valB - row.valA;
    const pct = row.valA !== 0 ? (diff / Math.abs(row.valA)) * 100 : 0;

    let winner = 'Parity';
    if (row.valA !== row.valB) {
      winner = row.higherIsBetter
        ? row.valA > row.valB ? campaignA.name.slice(0, 12) : campaignB.name.slice(0, 12)
        : row.valA < row.valB ? campaignA.name.slice(0, 12) : campaignB.name.slice(0, 12);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(winner.includes(campaignA.name.slice(0, 5)) ? 79 : 147, winner.includes(campaignA.name.slice(0, 5)) ? 70 : 51, winner.includes(campaignA.name.slice(0, 5)) ? 229 : 234);
    doc.text(`${pct > 0 ? '+' : ''}${pct.toFixed(1)}% (${winner})`, 14 + colMetricW + colValAW + colValBW + 2, y + 4.6);

    y += 7;
  });

  y += 6;

  // AI Strategic Takeaway
  if (y > 235) {
    doc.addPage();
    y = 22;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, tableW, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(67, 56, 202);
  doc.text('AI COMPARATIVE STRATEGIC TAKEAWAY', 18, y + 6);

  const verdict = dataA.kpis.cpa < dataB.kpis.cpa
    ? `${campaignA.name} demonstrates a ${((1 - (dataA.kpis.cpa / dataB.kpis.cpa)) * 100).toFixed(1)}% lower cost per acquisition (${curr}${dataA.kpis.cpa.toFixed(2)} vs ${curr}${dataB.kpis.cpa.toFixed(2)}), making it superior for rapid audience scaling. However, ${campaignB.name} shows stronger unit intent with a ${dataB.kpis.conversion_rate}% conversion rate.`
    : `${campaignB.name} generates superior bottom-funnel conversion economics (${dataB.kpis.conversion_rate}% CVR) compared to ${campaignA.name}, yielding higher return per unique visitor.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text(doc.splitTextToSize(verdict, tableW - 8), 18, y + 11);

  // Headers and Footers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, 'Campaign Comparison Report', i, totalPages);
  }

  const safeFilename = `Comparison_${campaignA.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_vs_${campaignB.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
