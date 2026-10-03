/**
 * Data Normalizer Service (Requirement #8)
 * Converts heterogeneous platform API payloads (Meta, Google Ads, TikTok, LinkedIn),
 * CSV records, and manual entries into the Common Normalized Campaign Schema.
 */

import { NormalizedCampaignMetric, CampaignDailyMetric } from '../types/campaign';

export interface RawMetaInsight {
  campaign_id: string;
  campaign_name: string;
  date_start: string;
  impressions?: string | number;
  reach?: string | number;
  clicks?: string | number;
  spend?: string | number;
  actions?: Array<{ action_type: string; value: string | number }>;
  account_id?: string;
  [key: string]: any;
}

export interface RawGoogleAdsMetric {
  campaign?: { id: string; name: string };
  segments?: { date: string };
  metrics?: {
    impressions?: number | string;
    clicks?: number | string;
    conversions?: number | string;
    cost_micros?: number | string; // 1,000,000 micros = 1 currency unit
    interactions?: number | string;
  };
  customer_id?: string;
  [key: string]: any;
}

export interface RawTikTokReportItem {
  campaign_id: string;
  campaign_name: string;
  stat_time_day: string;
  reach?: number | string;
  show_cnt?: number | string; // impressions
  click_cnt?: number | string;
  conversion_cnt?: number | string;
  stat_cost?: number | string;
  ad_account_id?: string;
  [key: string]: any;
}

export interface RawLinkedInReportItem {
  campaign_id: string;
  campaign_name?: string;
  dateRange?: { start: { year: number; month: number; day: number } };
  impressions?: number | string;
  clicks?: number | string;
  externalWebsiteConversions?: number | string;
  totalEngagements?: number | string;
  costInLocalCurrency?: number | string;
  approximateUniqueImpressions?: number | string; // reach
  account?: string;
  [key: string]: any;
}

export class DataNormalizer {
  /**
   * Normalize Meta Marketing API (Graph API) Insights
   */
  static normalizeMeta(raw: RawMetaInsight, accountId = 'act_meta'): NormalizedCampaignMetric {
    let conversions = 0;
    let engagement = 0;

    if (Array.isArray(raw.actions)) {
      raw.actions.forEach((a) => {
        const val = Number(a.value || 0);
        if (
          a.action_type === 'purchase' ||
          a.action_type === 'lead' ||
          a.action_type === 'complete_registration' ||
          a.action_type === 'omni_purchase'
        ) {
          conversions += val;
        }
        if (
          a.action_type === 'post_engagement' ||
          a.action_type === 'page_engagement' ||
          a.action_type === 'like' ||
          a.action_type === 'comment'
        ) {
          engagement += val;
        }
      });
    }

    const impressions = Math.max(0, Number(raw.impressions || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(raw.clicks || 0)));
    const spend = Math.max(0, Number(raw.spend || 0));
    const reach = Math.max(0, Number(raw.reach || Math.round(impressions * 0.75)));
    conversions = Math.min(clicks, Math.max(0, conversions));

    // Fallback engagement if not explicitly tracked
    if (engagement === 0) {
      engagement = Math.round(clicks * 1.4);
    }

    return {
      platform: 'Meta Ads',
      account_id: raw.account_id || accountId,
      campaign_id: String(raw.campaign_id || 'meta_camp'),
      campaign_name: String(raw.campaign_name || 'Meta Campaign'),
      date: raw.date_start || new Date().toISOString().slice(0, 10),
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
      raw_data: raw,
    };
  }

  /**
   * Normalize Google Ads API reporting metrics
   */
  static normalizeGoogleAds(raw: RawGoogleAdsMetric, accountId = 'cust_google'): NormalizedCampaignMetric {
    const metrics = raw.metrics || {};
    const campaign = raw.campaign || { id: 'goog_camp', name: 'Google Search/Display Campaign' };
    const date = raw.segments?.date || new Date().toISOString().slice(0, 10);

    const impressions = Math.max(0, Number(metrics.impressions || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(metrics.clicks || 0)));
    const conversions = Math.min(clicks, Math.max(0, Number(metrics.conversions || 0)));

    // Cost in Google Ads is returned in micros (1/1,000,000 unit)
    const costMicros = Number(metrics.cost_micros || 0);
    const spend = costMicros > 0 ? Number((costMicros / 1000000).toFixed(2)) : 0;
    const engagement = Math.max(clicks, Number(metrics.interactions || clicks));
    const reach = Math.max(0, Math.round(impressions * 0.8));

    return {
      platform: 'Google Ads',
      account_id: raw.customer_id || accountId,
      campaign_id: String(campaign.id || 'goog_camp'),
      campaign_name: String(campaign.name || 'Google Ads Campaign'),
      date,
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
      raw_data: raw,
    };
  }

  /**
   * Normalize TikTok Business Marketing API Report
   */
  static normalizeTikTok(raw: RawTikTokReportItem, accountId = 'adv_tiktok'): NormalizedCampaignMetric {
    const impressions = Math.max(0, Number(raw.show_cnt || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(raw.click_cnt || 0)));
    const conversions = Math.min(clicks, Math.max(0, Number(raw.conversion_cnt || 0)));
    const spend = Math.max(0, Number(raw.stat_cost || 0));
    const reach = Math.max(0, Number(raw.reach_cnt || Math.round(impressions * 0.7)));
    const engagement = Math.round(clicks * 1.8);

    return {
      platform: 'TikTok Ads',
      account_id: raw.ad_account_id || accountId,
      campaign_id: String(raw.campaign_id || 'tiktok_camp'),
      campaign_name: String(raw.campaign_name || 'TikTok Video Campaign'),
      date: raw.stat_time_day || new Date().toISOString().slice(0, 10),
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
      raw_data: raw,
    };
  }

  /**
   * Normalize LinkedIn Marketing API Report
   */
  static normalizeLinkedIn(raw: RawLinkedInReportItem, accountId = 'urn:li:sponsoredAccount'): NormalizedCampaignMetric {
    const impressions = Math.max(0, Number(raw.impressions || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(raw.clicks || 0)));
    const conversions = Math.min(clicks, Math.max(0, Number(raw.externalWebsiteConversions || 0)));
    const spend = Math.max(0, Number(raw.costInLocalCurrency || 0));
    const reach = Math.max(0, Number(raw.approximateUniqueImpressions || Math.round(impressions * 0.65)));
    const engagement = Math.max(clicks, Number(raw.totalEngagements || clicks));

    let date = new Date().toISOString().slice(0, 10);
    if (raw.dateRange?.start) {
      const { year, month, day } = raw.dateRange.start;
      const m = String(month).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      date = `${year}-${m}-${d}`;
    }

    return {
      platform: 'LinkedIn Ads',
      account_id: raw.account || accountId,
      campaign_id: String(raw.campaign_id || 'li_camp'),
      campaign_name: String(raw.campaign_name || 'LinkedIn Sponsored Campaign'),
      date,
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
      raw_data: raw,
    };
  }

  /**
   * Normalize CSV Record Row
   */
  static normalizeCsvRow(row: Record<string, any>, defaultCampaignId = 'csv_imported'): NormalizedCampaignMetric {
    const impressions = Math.max(0, Number(row.impressions || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(row.clicks || 0)));
    const conversions = Math.min(clicks, Math.max(0, Number(row.conversions || 0)));
    const reach = Math.max(0, Number(row.reach || Math.round(impressions * 0.75)));
    const engagement = Math.max(0, Number(row.engagement || Math.round(clicks * 1.5)));
    const spend = Math.max(0, Number(row.spend || 0));

    return {
      platform: String(row.platform || 'CSV Import'),
      account_id: 'csv_upload_account',
      campaign_id: defaultCampaignId,
      campaign_name: String(row.campaign_name || 'CSV Campaign'),
      date: String(row.date || new Date().toISOString().slice(0, 10)),
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
      raw_data: row,
    };
  }

  /**
   * Normalize Manual Form Submission
   */
  static normalizeManualEntry(formData: {
    campaign_name: string;
    platform: string;
    start_date: string;
    end_date: string;
    reach: number;
    impressions: number;
    engagement: number;
    clicks: number;
    conversions: number;
    spend: number;
  }, campaignId = `camp_manual_${Date.now()}`): NormalizedCampaignMetric[] {
    const impressions = Math.max(0, Number(formData.impressions || 0));
    const clicks = Math.min(impressions, Math.max(0, Number(formData.clicks || 0)));
    const conversions = Math.min(clicks, Math.max(0, Number(formData.conversions || 0)));
    const reach = Math.max(0, Number(formData.reach || Math.round(impressions * 0.8)));
    const engagement = Math.max(0, Number(formData.engagement || clicks));
    const spend = Math.max(0, Number(formData.spend || 0));

    // Distribute manual totals across a daily timeline (14 days default)
    const days = 14;
    const dailyMetrics: NormalizedCampaignMetric[] = [];
    const startDateObj = new Date(formData.start_date || '2026-09-01');

    for (let i = 0; i < days; i++) {
      const curDate = new Date(startDateObj);
      curDate.setDate(curDate.getDate() + i);
      const dateStr = curDate.toISOString().slice(0, 10);

      const ratio = 1 / days;
      // Slight natural variance per day
      const variance = 1 + (Math.sin(i * 1.3) * 0.15);

      dailyMetrics.push({
        platform: formData.platform || 'Manual',
        account_id: 'manual_account',
        campaign_id: campaignId,
        campaign_name: formData.campaign_name,
        date: dateStr,
        reach: Math.round((reach * ratio) * variance),
        impressions: Math.round((impressions * ratio) * variance),
        engagement: Math.round((engagement * ratio) * variance),
        clicks: Math.round((clicks * ratio) * variance),
        conversions: Math.max(1, Math.round((conversions * ratio) * variance)),
        spend: Number(((spend * ratio) * variance).toFixed(2)),
      });
    }

    return dailyMetrics;
  }

  /**
   * Convert Normalized metrics array to CampaignDailyMetric array for analytics engine
   */
  static toCampaignDailyMetrics(metrics: NormalizedCampaignMetric[], campaignId: string): CampaignDailyMetric[] {
    return metrics.map((m, idx) => ({
      id: `daily_${campaignId}_${idx}`,
      campaign_id: campaignId,
      date: m.date,
      reach: m.reach,
      impressions: m.impressions,
      engagement: m.engagement,
      clicks: m.clicks,
      conversions: m.conversions,
      spend: m.spend,
    }));
  }
}
