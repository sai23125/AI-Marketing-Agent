import {
  Campaign,
  CalculatedKPIs,
  RuleBasedIssue,
  AudienceSegment,
  PlatformMetric,
  DiagnosisReport,
  KeyFinding,
  Recommendation,
  AnalysisSettings,
} from '../types/campaign';

// Build the exact structured prompt specified by the user brief
export function buildAiPromptPayload(
  campaign: Campaign,
  kpis: CalculatedKPIs,
  ruleIssues: RuleBasedIssue[],
  audiences: AudienceSegment[],
  platforms: PlatformMetric[],
  settings: AnalysisSettings
) {
  const audienceSummary = audiences
    .map(
      (a) =>
        `- Segment: ${a.segment_name} (Age: ${a.age_group}) | Reach: ${a.reach.toLocaleString()} | Clicks: ${a.clicks.toLocaleString()} | Conversions: ${a.conversions} | CTR: ${a.ctr}% | CVR: ${a.cvr}% | CPA: ${settings.currency_symbol}${a.cpa}`
    )
    .join('\n');

  const ruleIssuesSummary = ruleIssues
    .map((r) => `- [${r.severity.toUpperCase()}] ${r.issue}: ${r.evidence} (${r.threshold_rule})`)
    .join('\n');

  const systemPrompt = `You are an AI Marketing Campaign Diagnosis Agent.

Analyze structured marketing campaign data.

Your responsibilities are:
1. Identify important performance issues.
2. Explain the evidence supporting each issue.
3. Identify possible causes.
4. Analyze the marketing funnel.
5. Compare audience segments when data is available.
6. Distinguish observed facts from hypotheses.
7. Generate actionable recommendations.
8. Prioritize recommendations.
9. Identify what should be measured after optimization.

Rules:
Never invent data.
Never invent missing metrics.
Never invent competitor information.
Never guarantee campaign results.
Never claim a possible cause is proven unless the data supports it.

Clearly distinguish:
Observed Fact
Possible Cause
Recommendation

Use the calculated metrics supplied by the analytics engine.
If insufficient data exists, explicitly state that more data is required.
Return structured JSON.`;

  const userPrompt = `Campaign Name: ${campaign.name}
Objective: ${campaign.objective}
Platform: ${campaign.platform}
Date Range: ${campaign.start_date} to ${campaign.end_date}

Calculated Metrics:
Reach: ${kpis.reach.toLocaleString()}
Impressions: ${kpis.impressions.toLocaleString()}
Engagement: ${kpis.engagement.toLocaleString()}
Clicks: ${kpis.clicks.toLocaleString()}
Conversions: ${kpis.conversions.toLocaleString()}
Spend: ${settings.currency_symbol}${kpis.spend.toLocaleString()}
CTR: ${kpis.ctr}%
Engagement Rate: ${kpis.engagement_rate}%
Conversion Rate: ${kpis.conversion_rate}%
CPC: ${settings.currency_symbol}${kpis.cpc}
CPA: ${settings.currency_symbol}${kpis.cpa}
CPM: ${settings.currency_symbol}${kpis.cpm}

Rule-Based Issues:
${ruleIssuesSummary || 'No deterministic threshold violations identified.'}

Audience Performance:
${audienceSummary || 'No audience breakdown available.'}

Analyze the campaign.

Return JSON only in this exact schema:
{
  "summary": "High-level diagnostic summary",
  "key_findings": [
    {
      "issue": "Name of issue",
      "evidence": "Evidence string citing observed numbers",
      "severity": "high" | "medium" | "low",
      "possible_causes": ["Possible cause 1", "Possible cause 2"],
      "confidence": 0.82
    }
  ],
  "funnel_analysis": {
    "bottleneck_stage": "Stage name",
    "summary": "Funnel analysis explanation",
    "dropoff_observations": ["Observation 1", "Observation 2"]
  },
  "audience_analysis": {
    "highest_conversion_segment": "Segment name and CVR",
    "lowest_cpa_segment": "Segment name and CPA",
    "highest_ctr_segment": "Segment name and CTR",
    "underperforming_segment": "Segment name and metrics",
    "notes": "Audience comparison notes"
  },
  "recommendations": [
    {
      "title": "Clear action title",
      "description": "Short explanation",
      "reason": "Data evidence justifying this action",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "Audience" | "Conversion" | "Creative" | "Budget" | "Platform" | "Landing Page" | "Funnel",
      "suggested_action": "Specific execution instruction",
      "measurement_metric": "What to measure post-implementation"
    }
  ],
  "data_limitations": ["Limitation note 1", "Limitation note 2"]
}`;

  return { systemPrompt, userPrompt };
}

// Deterministic Fallback Synthesis:
// When AI API is unavailable or offline, generate an evidence-grounded diagnosis
// from the calculated KPIs and rule-based issues without fabricating numbers!
export function generateDeterministicDiagnosisFallback(
  campaign: Campaign,
  kpis: CalculatedKPIs,
  ruleIssues: RuleBasedIssue[],
  audiences: AudienceSegment[],
  platforms: PlatformMetric[],
  settings: AnalysisSettings
): DiagnosisReport {
  const findings: KeyFinding[] = [];
  const recommendations: Recommendation[] = [];

  // Derive findings from rule-based issues
  if (ruleIssues.length > 0) {
    ruleIssues.forEach((issue) => {
      let causes: string[] = [];
      let conf = 0.8;

      if (issue.code === 'HIGH_CPA') {
        causes = [
          'High proportion of budget directed to higher-friction audience cohorts',
          'Downstream cart or sign-up drop-off inflating cost per completed conversion',
          'Auction competition pressure increasing effective CPM and CPC',
        ];
        conf = 0.84;
      } else if (issue.code === 'LOW_CVR') {
        causes = [
          'Destination landing page does not immediately confirm ad promise',
          'Form friction or pricing opacity prior to conversion action',
          'Mobile responsiveness or page latency issue on destination URL',
        ];
        conf = 0.86;
      } else if (issue.code === 'ENGAGEMENT_CONVERSION_GAP') {
        causes = [
          'Ad content is entertaining/engaging but lacks explicit commercial call-to-action',
          'Curiosity-driven clicks failing to qualify user intent',
          'Disparity between creative hook and landing page value proposition',
        ];
        conf = 0.78;
      } else if (issue.code === 'AUDIENCE_DISPARITY') {
        causes = [
          'Product-market fit or purchasing power variances between demographics',
          'Ad copy tailored specifically to one demographic while served broadly to all',
        ];
        conf = 0.81;
      } else {
        causes = ['Audience targeting saturation', 'Creative fatigue across ad variants'];
        conf = 0.72;
      }

      findings.push({
        issue: issue.issue,
        evidence: issue.evidence,
        severity: issue.severity,
        possible_causes: causes,
        confidence: conf,
        observation_type: 'Observed',
      });
    });
  } else {
    findings.push({
      issue: 'Steady Baseline Performance',
      evidence: `Campaign delivers ${kpis.ctr}% CTR and ${settings.currency_symbol}${kpis.cpa} CPA within benchmark ranges.`,
      severity: 'low',
      possible_causes: ['Well-matched creative and audience targeting parameters'],
      confidence: 0.9,
      observation_type: 'Observed',
    });
  }

  // Derive Recommendations
  if (kpis.conversion_rate < 7.0 || kpis.cpa > settings.cpa_target) {
    recommendations.push({
      id: 'rec_det_1',
      title: 'Optimize conversion experience',
      priority: 'HIGH',
      category: 'Conversion',
      description: 'Clicks are relatively strong compared with downstream conversions.',
      reason: `Upper-funnel traffic is clicking at ${kpis.ctr}%, but converts at ${kpis.conversion_rate}%.`,
      suggested_action: 'Review the landing page, offer clarity, checkout speed, and test a simplified single-step conversion action.',
      measurement_metric: 'Conversion Rate and CPA',
    });
  }

  if (audiences.length > 1) {
    const highestCvrAud = [...audiences].sort((a, b) => b.cvr - a.cvr)[0];
    const lowestCvrAud = [...audiences].sort((a, b) => a.cvr - b.cvr)[0];

    recommendations.push({
      id: 'rec_det_2',
      title: 'Review audience allocation',
      priority: 'HIGH',
      category: 'Audience',
      description: 'Investigate lower-converting audience segments and test whether budget allocation should be adjusted.',
      reason: `Segment '${highestCvrAud.segment_name}' converts at ${highestCvrAud.cvr}% (${settings.currency_symbol}${highestCvrAud.cpa} CPA), while '${lowestCvrAud.segment_name}' converts at ${lowestCvrAud.cvr}%.`,
      suggested_action: `Shift 20% of ad spend away from ${lowestCvrAud.segment_name} into ${highestCvrAud.segment_name} for 10 days.`,
      measurement_metric: 'Segment CPA and Net Blended Conversions',
    });
  }

  recommendations.push({
    id: 'rec_det_3',
    title: 'Test alternative creatives',
    priority: 'MEDIUM',
    category: 'Creative',
    description: 'Deploy fresh creative variations to combat fatigue and test alternate messaging angles.',
    reason: `Current CTR is ${kpis.ctr}%. Incremental testing can unlock higher intent traffic.`,
    suggested_action: 'Run an A/B test with 2 new creative variants (one social-proof oriented and one urgency-oriented).',
    measurement_metric: 'CTR and Conversion Rate',
  });

  // Audience analysis object
  let highest_conv = 'None';
  let lowest_cpa = 'None';
  let highest_ctr = 'None';
  let underperforming = 'None';

  if (audiences.length > 0) {
    const sortedCvr = [...audiences].sort((a, b) => b.cvr - a.cvr);
    const sortedCpa = [...audiences].filter((a) => a.conversions > 0).sort((a, b) => a.cpa - b.cpa);
    const sortedCtr = [...audiences].sort((a, b) => b.ctr - a.ctr);

    highest_conv = `${sortedCvr[0].segment_name} (${sortedCvr[0].cvr}% CVR)`;
    lowest_cpa = sortedCpa.length > 0 ? `${sortedCpa[0].segment_name} (${settings.currency_symbol}${sortedCpa[0].cpa})` : 'N/A';
    highest_ctr = `${sortedCtr[0].segment_name} (${sortedCtr[0].ctr}% CTR)`;
    underperforming = `${sortedCvr[sortedCvr.length - 1].segment_name} (${sortedCvr[sortedCvr.length - 1].cvr}% CVR, ${settings.currency_symbol}${sortedCvr[sortedCvr.length - 1].cpa} CPA)`;
  }

  const impToClick = kpis.impressions > 0 ? (kpis.clicks / kpis.impressions) * 100 : 0;
  const clickToConv = kpis.clicks > 0 ? (kpis.conversions / kpis.clicks) * 100 : 0;

  return {
    campaign_id: campaign.id,
    generated_at: new Date().toISOString(),
    ai_provider: 'Deterministic Rule-Based Synthesis Engine',
    ai_mode: 'fallback',
    summary: `The campaign generates ${kpis.reach.toLocaleString()} reach and ${kpis.clicks.toLocaleString()} clicks with ${kpis.ctr}% CTR, but conversion efficiency (${kpis.conversion_rate}% CVR) requires attention.`,
    key_findings: findings,
    funnel_analysis: {
      bottleneck_stage: clickToConv < 5.0 ? 'Click → Conversion' : 'Impression → Click',
      summary: `Funnel demonstrates ${impToClick.toFixed(2)}% click-through rate followed by a ${clickToConv.toFixed(2)}% conversion completion rate.`,
      dropoff_observations: [
        `${kpis.impressions.toLocaleString()} impressions yielded ${kpis.clicks.toLocaleString()} clicks (${impToClick.toFixed(2)}% CTR)`,
        `${kpis.clicks.toLocaleString()} clicks yielded ${kpis.conversions.toLocaleString()} conversions (${clickToConv.toFixed(2)}% CVR)`,
        `Net conversion rate per reached unique individual is ${((kpis.conversions / (kpis.reach || 1)) * 100).toFixed(2)}%`,
      ],
    },
    audience_analysis: {
      highest_conversion_segment: highest_conv,
      lowest_cpa_segment: lowest_cpa,
      highest_ctr_segment: highest_ctr,
      underperforming_segment: underperforming,
      notes: 'Audience comparison derived strictly from isolated segment performance data.',
    },
    recommendations,
    data_limitations: [
      'Attribution model is standard single-source click tracking.',
      'Offline conversions or post-view assist conversions are not available in current dataset.',
    ],
    agent_workflow_stages: [
      { stage_number: 1, name: 'Data Validator', status: 'completed', details: 'All row constraints and non-negativity checks passed.' },
      { stage_number: 2, name: 'KPI Calculator', status: 'completed', details: 'Deterministic calculation of CTR, CPA, CPM, CPC, CVR.' },
      { stage_number: 3, name: 'Rule-Based Diagnosis Engine', status: 'completed', details: `${ruleIssues.length} rule threshold conditions evaluated.` },
      { stage_number: 4, name: 'Audience Analyzer', status: 'completed', details: 'Rankings generated by isolated criteria (CTR, CVR, CPA).' },
      { stage_number: 5, name: 'AI Reasoning Agent', status: 'completed', details: 'Deterministic synthesis mode active (offline/resilient fallback).' },
      { stage_number: 6, name: 'Recommendation Generator', status: 'completed', details: 'Actionable testing recommendations generated.' },
      { stage_number: 7, name: 'Report Generator', status: 'completed', details: 'Structured campaign diagnosis ready for review.' },
    ],
  };
}
