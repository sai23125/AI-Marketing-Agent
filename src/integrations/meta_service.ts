/**
 * Meta Marketing API Integration Service (Requirement #4)
 * Official Meta Graph API / Marketing API integration for Facebook & Instagram Ads.
 * Handles OAuth 2.0, Ad Account Discovery, Campaign Discovery, and Insights Retrieval.
 */

import { RawMetaInsight, DataNormalizer } from '../services/dataNormalizer';
import { NormalizedCampaignMetric } from '../types/campaign';

export interface MetaAdAccount {
  id: string; // e.g. "act_1029384756"
  account_id: string;
  name: string;
  currency: string;
  account_status: number;
  amount_spent?: string;
}

export interface MetaCampaignItem {
  id: string;
  name: string;
  objective: string;
  status: string;
  start_time?: string;
  stop_time?: string;
}

export class MetaService {
  private static readonly GRAPH_API_VERSION = 'v19.0';
  private static readonly BASE_URL = `https://graph.facebook.com/${MetaService.GRAPH_API_VERSION}`;

  /**
   * Check if Meta OAuth credentials are configured in environment
   */
  static isConfigured(): boolean {
    const clientId = process.env.META_CLIENT_ID;
    const clientSecret = process.env.META_CLIENT_SECRET;
    return Boolean(
      clientId &&
      clientSecret &&
      clientId !== 'your_meta_app_id_here' &&
      clientSecret !== 'your_meta_app_secret_here'
    );
  }

  /**
   * Generate official Meta OAuth 2.0 Authorization URL
   */
  static getAuthUrl(state = 'meta_auth_state'): string {
    const clientId = process.env.META_CLIENT_ID || '';
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/meta/callback`;
    const scopes = ['ads_read', 'ads_management', 'read_insights'].join(',');

    return `https://www.facebook.com/${MetaService.GRAPH_API_VERSION}/dialog/oauth?client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(
      state
    )}&response_type=code`;
  }

  /**
   * Exchange authorization code for User Access Token via server-side POST
   */
  static async exchangeCodeForToken(code: string): Promise<{ access_token: string; expires_in?: number }> {
    if (!this.isConfigured()) {
      throw new Error('Meta integration is not configured yet. Configure META_CLIENT_ID and META_CLIENT_SECRET.');
    }

    const clientId = process.env.META_CLIENT_ID || '';
    const clientSecret = process.env.META_CLIENT_SECRET || '';
    const redirectUri = process.env.META_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/auth/meta/callback`;

    const tokenUrl = `${MetaService.BASE_URL}/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&code=${encodeURIComponent(code)}`;

    const response = await fetch(tokenUrl, { method: 'GET' });
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to exchange Meta authorization code');
    }

    return data;
  }

  /**
   * Discover authorized Meta Ad Accounts (GET me/adaccounts)
   */
  static async getAdAccounts(accessToken: string): Promise<MetaAdAccount[]> {
    const url = `${MetaService.BASE_URL}/me/adaccounts?fields=id,account_id,name,currency,account_status,amount_spent&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Meta ad accounts');
    }

    return (data.data || []).map((acc: any) => ({
      id: acc.id,
      account_id: acc.account_id,
      name: acc.name || `Ad Account ${acc.account_id}`,
      currency: acc.currency || 'USD',
      account_status: acc.account_status,
      amount_spent: acc.amount_spent,
    }));
  }

  /**
   * Discover Campaigns in an Ad Account (GET act_<id>/campaigns)
   */
  static async getCampaigns(adAccountId: string, accessToken: string): Promise<MetaCampaignItem[]> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const url = `${MetaService.BASE_URL}/${formattedId}/campaigns?fields=id,name,objective,status,start_time,stop_time&limit=50&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Failed to fetch campaigns for Meta account ${adAccountId}`);
    }

    return (data.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      objective: c.objective,
      status: c.status,
      start_time: c.start_time,
      stop_time: c.stop_time,
    }));
  }

  /**
   * Retrieve Campaign Insights / Daily Reporting Data (GET <campaign_id>/insights)
   */
  static async getCampaignInsights(
    campaignId: string,
    accessToken: string,
    datePreset = 'last_30d'
  ): Promise<NormalizedCampaignMetric[]> {
    const fields = ['impressions', 'reach', 'clicks', 'spend', 'actions', 'date_start', 'date_stop', 'campaign_id', 'campaign_name'].join(',');
    const url = `${MetaService.BASE_URL}/${campaignId}/insights?fields=${fields}&date_preset=${datePreset}&time_increment=1&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || `Failed to fetch insights for Meta campaign ${campaignId}`);
    }

    const rawList: RawMetaInsight[] = data.data || [];
    return rawList.map((raw) => DataNormalizer.normalizeMeta(raw));
  }
}
