/**
 * LinkedIn Marketing API Integration Service (Requirement #7)
 * Official LinkedIn Marketing API OAuth 2.0 and Reporting service.
 * Supports ad account discovery, campaign retrieval, and reporting analytics.
 */

import { RawLinkedInReportItem, DataNormalizer } from '../services/dataNormalizer';
import { NormalizedCampaignMetric } from '../types/campaign';

export interface LinkedInAdAccount {
  id: string; // e.g. "urn:li:sponsoredAccount:509876543"
  account_id: string;
  name: string;
  currency: string;
  status: string;
}

export interface LinkedInCampaignItem {
  id: string;
  name: string;
  status: string;
  costType: string;
  totalBudget?: { amount: string; currencyCode: string };
}

export class LinkedInService {
  private static readonly AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
  private static readonly TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
  private static readonly API_BASE = 'https://api.linkedin.com/rest';

  /**
   * Check if LinkedIn API credentials are configured
   */
  static isConfigured(): boolean {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    return Boolean(
      clientId &&
      clientSecret &&
      clientId !== 'your_linkedin_client_id_here' &&
      clientSecret !== 'your_linkedin_client_secret_here'
    );
  }

  /**
   * Generate official LinkedIn OAuth 2.0 Authorization URL
   */
  static getAuthUrl(state = 'linkedin_auth_state'): string {
    const clientId = process.env.LINKEDIN_CLIENT_ID || '';
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/linkedin/callback`;
    const scopes = ['r_ads', 'r_ads_reporting'].join(' ');

    return `${LinkedInService.AUTH_URL}?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(
      scopes
    )}`;
  }

  /**
   * Exchange code for LinkedIn Access Token
   */
  static async exchangeCodeForToken(code: string): Promise<{ access_token: string; expires_in?: number }> {
    if (!this.isConfigured()) {
      throw new Error('LinkedIn Ads integration requires API credentials and platform approval. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET.');
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID || '';
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/linkedin/callback`;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const response = await fetch(LinkedInService.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error_description || data.error || 'Failed to exchange LinkedIn authorization code');
    }

    return data;
  }

  /**
   * Discover LinkedIn Ad Accounts (GET /api/linkedin/accounts)
   */
  static async getAdAccounts(accessToken: string): Promise<LinkedInAdAccount[]> {
    const url = `${LinkedInService.API_BASE}/adAccounts?q=search`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.message || 'Failed to retrieve LinkedIn ad accounts');
    }

    return (data.elements || []).map((acc: any) => {
      const rawId = acc.id || '';
      const numericId = String(rawId).replace('urn:li:sponsoredAccount:', '');
      return {
        id: rawId,
        account_id: numericId,
        name: acc.name || `LinkedIn Account ${numericId}`,
        currency: acc.currency || 'USD',
        status: acc.status || 'ACTIVE',
      };
    });
  }

  /**
   * Discover Campaigns in a LinkedIn Ad Account (GET /api/linkedin/campaigns)
   */
  static async getCampaigns(accountId: string, accessToken: string): Promise<LinkedInCampaignItem[]> {
    const urn = accountId.startsWith('urn:li:') ? accountId : `urn:li:sponsoredAccount:${accountId}`;
    const url = `${LinkedInService.API_BASE}/adCampaigns?q=search&search=(account:(values:List(${encodeURIComponent(urn)})))`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.message || `Failed to fetch LinkedIn campaigns for account ${accountId}`);
    }

    return (data.elements || []).map((c: any) => ({
      id: String(c.id),
      name: c.name || 'Untitled LinkedIn Campaign',
      status: c.status || 'ACTIVE',
      costType: c.costType || 'CPC',
      totalBudget: c.totalBudget,
    }));
  }

  /**
   * Retrieve Campaign Reporting Insights (GET /api/linkedin/campaigns/:id/report)
   */
  static async getCampaignReport(
    campaignId: string,
    accessToken: string,
    dateRange = 'DAILY'
  ): Promise<NormalizedCampaignMetric[]> {
    const campaignUrn = campaignId.startsWith('urn:li:') ? campaignId : `urn:li:sponsoredCampaign:${campaignId}`;
    const url = `${LinkedInService.API_BASE}/adAnalyticsV2?q=analytics&pivot=CAMPAIGN&timeGranularity=${dateRange}&campaigns=List(${encodeURIComponent(campaignUrn)})&fields=impressions,clicks,externalWebsiteConversions,totalEngagements,costInLocalCurrency,approximateUniqueImpressions,dateRange`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.message || `Failed to fetch LinkedIn reporting for campaign ${campaignId}`);
    }

    const rawList: RawLinkedInReportItem[] = data.elements || [];
    return rawList.map((raw) => DataNormalizer.normalizeLinkedIn(raw));
  }
}
