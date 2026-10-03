/**
 * TikTok Business API Integration Service (Requirement #6)
 * Official TikTok Marketing API OAuth 2.0 and Reporting service.
 * Supports advertiser account selection, campaign retrieval, reporting data, and date filtering.
 */

import { RawTikTokReportItem, DataNormalizer } from '../services/dataNormalizer';
import { NormalizedCampaignMetric } from '../types/campaign';

export interface TikTokAdvertiser {
  advertiser_id: string;
  advertiser_name: string;
  currency: string;
  timezone: string;
}

export interface TikTokCampaignItem {
  campaign_id: string;
  campaign_name: string;
  objective_type: string;
  operation_status: string;
  create_time?: string;
}

export class TikTokService {
  private static readonly AUTH_URL = 'https://business-api.tiktok.com/portal/auth';
  private static readonly API_BASE = 'https://business-api.tiktok.com/open_api/v1.3';

  /**
   * Check if TikTok API credentials are configured
   */
  static isConfigured(): boolean {
    const key = process.env.TIKTOK_CLIENT_KEY;
    const secret = process.env.TIKTOK_CLIENT_SECRET;
    return Boolean(
      key &&
      secret &&
      key !== 'your_tiktok_client_key_here' &&
      secret !== 'your_tiktok_client_secret_here'
    );
  }

  /**
   * Generate official TikTok OAuth 2.0 Authorization URL
   */
  static getAuthUrl(state = 'tiktok_auth_state'): string {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/tiktok/callback`;

    return `${TikTokService.AUTH_URL}?app_id=${encodeURIComponent(clientKey)}&state=${encodeURIComponent(
      state
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  /**
   * Exchange auth_code for Access Token
   */
  static async exchangeCodeForToken(authCode: string): Promise<{ access_token: string; advertiser_ids?: string[] }> {
    if (!this.isConfigured()) {
      throw new Error('TikTok Ads integration requires API credentials and platform approval. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET.');
    }

    const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';

    const url = `${TikTokService.API_BASE}/oauth2/access_token/`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: clientKey,
        secret: clientSecret,
        auth_code: authCode,
      }),
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || 'Failed to exchange TikTok authorization code');
    }

    return {
      access_token: data.data.access_token,
      advertiser_ids: data.data.advertiser_ids,
    };
  }

  /**
   * Discover authorized TikTok Advertiser accounts (GET /api/tiktok/accounts)
   */
  static async getAdvertiserAccounts(accessToken: string): Promise<TikTokAdvertiser[]> {
    const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';

    const url = `${TikTokService.API_BASE}/oauth2/advertiser/get/?app_id=${clientKey}&secret=${clientSecret}`;
    const response = await fetch(url, {
      headers: { 'Access-Token': accessToken },
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || 'Failed to retrieve TikTok advertiser accounts');
    }

    return (data.data?.list || []).map((adv: any) => ({
      advertiser_id: String(adv.advertiser_id),
      advertiser_name: adv.advertiser_name || `TikTok Account (${adv.advertiser_id})`,
      currency: adv.currency || 'USD',
      timezone: adv.timezone || 'UTC',
    }));
  }

  /**
   * Retrieve Campaigns for an Advertiser (GET /api/tiktok/campaigns)
   */
  static async getCampaigns(advertiserId: string, accessToken: string): Promise<TikTokCampaignItem[]> {
    const url = `${TikTokService.API_BASE}/campaign/get/?advertiser_id=${advertiserId}&page_size=50`;
    const response = await fetch(url, {
      headers: { 'Access-Token': accessToken },
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || `Failed to fetch TikTok campaigns for advertiser ${advertiserId}`);
    }

    return (data.data?.list || []).map((c: any) => ({
      campaign_id: String(c.campaign_id),
      campaign_name: c.campaign_name,
      objective_type: c.objective_type,
      operation_status: c.operation_status,
      create_time: c.create_time,
    }));
  }

  /**
   * Retrieve Campaign Reporting Insights (GET /api/tiktok/campaigns/:id/report)
   */
  static async getCampaignReport(
    advertiserId: string,
    campaignId: string,
    accessToken: string,
    startDate?: string,
    endDate?: string
  ): Promise<NormalizedCampaignMetric[]> {
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);

    const metrics = ['spend', 'impressions', 'clicks', 'conversions', 'reach'].join(',');
    const url = `${TikTokService.API_BASE}/report/integrated/get/?advertiser_id=${advertiserId}&report_type=BASIC&data_level=AUCTION_CAMPAIGN&dimensions=["campaign_id","stat_time_day"]&metrics=[${metrics}]&start_date=${start}&end_date=${end}&filters=[{"field_name":"campaign_ids","filter_type":"IN","filter_value":["${campaignId}"]}]`;

    const response = await fetch(url, {
      headers: { 'Access-Token': accessToken },
    });

    const data = await response.json();
    if (!response.ok || data.code !== 0) {
      throw new Error(data.message || `Failed to fetch TikTok reporting for campaign ${campaignId}`);
    }

    const rawList: RawTikTokReportItem[] = (data.data?.list || []).map((item: any) => ({
      campaign_id: item.dimensions?.campaign_id || campaignId,
      campaign_name: 'TikTok Campaign',
      stat_time_day: item.dimensions?.stat_time_day,
      reach: item.metrics?.reach,
      show_cnt: item.metrics?.impressions,
      click_cnt: item.metrics?.clicks,
      conversion_cnt: item.metrics?.conversions,
      stat_cost: item.metrics?.spend,
      ad_account_id: advertiserId,
    }));

    return rawList.map((raw) => DataNormalizer.normalizeTikTok(raw, advertiserId));
  }
}
