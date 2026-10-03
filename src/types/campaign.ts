export interface Campaign {
  id: string;
  name: string;
  objective: 'Conversions' | 'Lead Generation' | 'Brand Awareness' | 'Traffic' | 'Engagement';
  platform: string;
  start_date: string;
  end_date: string;
  created_at: string;
  status: 'Healthy' | 'Needs Optimization' | 'Critical Attention' | 'Under Review';
  currency: string;
  // Multi-source data attribution & live sync
  data_source: 'live' | 'csv' | 'manual' | 'demo';
  source_platform?: 'Meta' | 'Google Ads' | 'TikTok Ads' | 'LinkedIn Ads' | 'CSV' | 'Manual' | 'Demo' | string;
  account_id?: string;
  account_name?: string;
  last_synced_at?: string;
  sync_status?: 'up_to_date' | 'syncing' | 'failed';
  sync_error?: string;
  external_campaign_id?: string;
}

export interface ConnectedAccount {
  id: string;
  user_id?: string;
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  platform_name: string;
  account_id: string;
  account_name: string;
  is_connected: boolean;
  token_expires_at?: string;
  created_at: string;
  last_synced_at?: string;
  sync_status: 'up_to_date' | 'syncing' | 'failed' | 'disconnected';
  sync_error?: string;
  permissions?: string[];
  active_campaigns_count?: number;
}

export interface PlatformIntegrationConfig {
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin';
  name: string;
  configured: boolean;
  status_message: string;
  requires_approval?: boolean;
  auth_url?: string;
  connected_account?: ConnectedAccount | null;
}

export interface NormalizedCampaignMetric {
  platform: string;
  account_id: string;
  campaign_id: string;
  campaign_name: string;
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
  raw_data?: Record<string, any>;
}

export interface CampaignDailyMetric {
  id: string;
  campaign_id: string;
  date: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface AudienceSegment {
  id: string;
  campaign_id: string;
  segment_name: string;
  age_group: string; // e.g. '18–24', '25–34', '35–44', '45+'
  gender: string;
  location: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
  // Deterministic calculated properties
  ctr: number;
  cvr: number;
  cpa: number;
  engagement_rate: number;
  cpc: number;
}

export interface PlatformMetric {
  platform: string;
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cvr: number;
  cpa: number;
  cpc: number;
}

export interface CalculatedKPIs {
  reach: number;
  impressions: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number; // percentage e.g. 5.39
  engagement_rate: number; // percentage
  conversion_rate: number; // percentage e.g. 6.69
  cpc: number; // Spend / Clicks
  cpa: number; // Spend / Conversions
  cpm: number; // Spend / Impressions * 1000
  estimated_revenue?: number;
  roas?: number;
  roi?: number;

  // Comparison metrics vs previous period (e.g. +1.8%)
  changes: {
    reach_change_pct: number;
    impressions_change_pct: number;
    engagement_change_pct: number;
    clicks_change_pct: number;
    conversions_change_pct: number;
    ctr_change_pct: number;
    cpa_change_pct: number;
    conversion_rate_change_pct: number;
  };
}

export interface CampaignHealthBreakdown {
  ctr_score: number; // 0-100
  engagement_score: number; // 0-100
  conversion_score: number; // 0-100
  cpa_score: number; // 0-100
}

export interface CampaignHealth {
  overall_score: number; // 0-100
  status: 'Healthy' | 'Needs Optimization' | 'Critical Attention';
  breakdown: CampaignHealthBreakdown;
  weights: {
    ctr: number;
    engagement: number;
    conversion: number;
    cpa: number;
  };
  explanation: string;
}

export interface MarketingFunnel {
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  impression_to_click_rate: number; // CTR
  click_to_conversion_rate: number; // CVR
  reach_to_conversion_rate: number;
  biggest_dropoff_stage: string;
}

export interface RuleBasedIssue {
  id: string;
  code: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string;
  metric_impacted: string;
  threshold_rule: string;
  current_value: string;
}

export interface KeyFinding {
  issue: string;
  evidence: string;
  severity: 'high' | 'medium' | 'low';
  possible_causes: string[];
  confidence: number; // 0 to 1, e.g. 0.82
  observation_type: 'Observed' | 'Possible Cause';
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Audience' | 'Conversion' | 'Creative' | 'Budget' | 'Platform' | 'Landing Page' | 'Funnel';
  suggested_action: string;
  measurement_metric: string;
}

export interface DiagnosisReport {
  campaign_id: string;
  generated_at: string;
  ai_provider: string; // 'OpenRouter' | 'Gemini' | 'Deterministic Engine (Fallback)'
  ai_mode: 'live' | 'fallback';
  summary: string;
  key_findings: KeyFinding[];
  funnel_analysis: {
    bottleneck_stage: string;
    summary: string;
    dropoff_observations: string[];
  };
  audience_analysis: {
    highest_conversion_segment: string;
    lowest_cpa_segment: string;
    highest_ctr_segment: string;
    underperforming_segment: string;
    notes: string;
  };
  recommendations: Recommendation[];
  data_limitations: string[];
  agent_workflow_stages: {
    stage_number: number;
    name: string;
    status: 'completed' | 'in_progress' | 'pending';
    details: string;
  }[];
}

export interface AnalysisSettings {
  ctr_warning_threshold: number; // default 2.0%
  cvr_warning_threshold: number; // default 3.0%
  cpa_target: number; // default 150
  engagement_threshold: number; // default 4.0%
  currency_symbol: string; // default '₹'
  ai_model: string; // default 'openrouter/free'
  temperature: number; // default 0.3
  max_csv_size_mb: number; // default 10
}

export interface CsvValidationError {
  row: number;
  column: string;
  problem: string;
  suggested_fix: string;
}

export interface CsvValidationResult {
  valid: boolean;
  total_rows: number;
  errors: CsvValidationError[];
  warnings: string[];
  campaign_name_detected?: string;
  date_range_detected?: string;
  parsed_records?: Array<Record<string, any>>;
}
