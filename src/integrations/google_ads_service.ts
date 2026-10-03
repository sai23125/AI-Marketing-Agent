/**
 * Google Ads API Integration Service (Requirement #5)
 * Official Google Ads API OAuth 2.0 and Reporting service.
 * Supports customer account selection, campaign discovery, performance metrics, and date filtering.
 */

import { RawGoogleAdsMetric, DataNormalizer } from '../services/dataNormalizer';
import { NormalizedCampaignMetric } from '../types/campaign';

export interface GoogleAdsCustomer {
  resourceName: string;
  id: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
}

export interface GoogleAdsCampaignItem {
  id: string;
  name: string;
  status: string;
  advertisingChannelType: string;
  startDate?: string;
  endDate?: string;
}

export class GoogleAdsService {
  private static readonly GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly GOOGLE_ADS_API_ENDPOINT = 'https://googleads.googleapis.com/v16';

  /**
   * Check if Google Ads OAuth credentials are configured
   */
  static isConfigured(): boolean {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    return Boolean(
      clientId &&
      clientSecret &&
      clientId !== 'your_google_client_id_here' &&
      clientSecret !== 'your_google_client_secret_here'
    );
  }

  /**
   * Generate official Google OAuth 2.0 Authorization URL
   */
  static getAuthUrl(state = 'google_ads_auth_state'): string {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;
    const scopes = ['https://www.googleapis.com/auth/adwords'].join(' ');

    return `${GoogleAdsService.GOOGLE_OAUTH_URL}?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(
      scopes
    )}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;
  }

  /**
   * Exchange code for Google OAuth Tokens
   */
  static async exchangeCodeForToken(code: string): Promise<{ access_token: string; refresh_token?: string; expires_in?: number }> {
    if (!this.isConfigured()) {
      throw new Error('Google Ads integration requires API credentials and platform approval. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/google/callback`;

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(GoogleAdsService.GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error_description || data.error || 'Failed to exchange Google Ads authorization code');
    }

    return data;
  }

  /**
   * List accessible customer accounts (GET /api/google/accounts)
   */
  static async getCustomerAccounts(accessToken: string): Promise<GoogleAdsCustomer[]> {
    const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'test_dev_token';
    const url = `${GoogleAdsService.GOOGLE_ADS_API_ENDPOINT}/customers:listAccessibleCustomers`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
      },
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to retrieve accessible Google Ads customers');
    }

    const resourceNames: string[] = data.resourceNames || [];
    return resourceNames.map((rn) => {
      const id = rn.replace('customers/', '');
      return {
        resourceName: rn,
        id,
        descriptiveName: `Google Ads Account (${id})`,
        currencyCode: 'USD',
        timeZone: 'America/New_York',
      };
    });
  }

  /**
   * Retrieve campaigns for a Customer (GET /api/google/campaigns)
   */
  static async getCampaigns(customerId: string, accessToken: string): Promise<GoogleAdsCampaignItem[]> {
    const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'test_dev_token';
    const cleanId = customerId.replace(/-/g, '');
    const url = `${GoogleAdsService.GOOGLE_ADS_API_ENDPOINT}/customers/${cleanId}/googleAds:search`;

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.start_date,
        campaign.end_date
      FROM campaign
      ORDER BY campaign.id
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Failed to fetch Google Ads campaigns for customer ${customerId}`);
    }

    return (data.results || []).map((row: any) => ({
      id: String(row.campaign?.id),
      name: row.campaign?.name || 'Untitled Campaign',
      status: row.campaign?.status || 'ENABLED',
      advertisingChannelType: row.campaign?.advertisingChannelType || 'SEARCH',
      startDate: row.campaign?.startDate,
      endDate: row.campaign?.endDate,
    }));
  }

  /**
   * Retrieve campaign performance metrics (GET /api/google/campaigns/:id/metrics)
   */
  static async getCampaignMetrics(
    customerId: string,
    campaignId: string,
    accessToken: string,
    dateRange = 'LAST_30_DAYS'
  ): Promise<NormalizedCampaignMetric[]> {
    const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN || 'test_dev_token';
    const cleanId = customerId.replace(/-/g, '');
    const url = `${GoogleAdsService.GOOGLE_ADS_API_ENDPOINT}/customers/${cleanId}/googleAds:search`;

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros,
        metrics.interactions
      FROM campaign
      WHERE campaign.id = ${campaignId}
        AND segments.date DURING ${dateRange}
      ORDER BY segments.date ASC
    `;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Failed to fetch Google Ads metrics for campaign ${campaignId}`);
    }

    const rawList: RawGoogleAdsMetric[] = data.results || [];
    return rawList.map((raw) => DataNormalizer.normalizeGoogleAds(raw, customerId));
  }
}
