import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface SoResult {
  query: string;
  heat: string;
  update: string;
}

interface SoResponse {
  data: {
    result: SoResult[];
  };
  msg: string;
}

export class SoScraper extends BaseScraper {
  readonly platform = 'so' as const;
  readonly displayName = '360搜索';
  readonly baseUrl = 'https://trends.so.com';
  readonly apiEndpoint = '/top/realtime';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const json = await this.parseJSON<SoResponse>(response);

    if (!json || !json.data || !json.data.result) {
      throw new Error('Invalid response format');
    }

    return json.data.result.map((item, index) => ({
      id: item.query,
      title: item.query,
      url: `https://www.so.com/s?q=${encodeURIComponent(item.query)}`,
      hot: parseInt(item.heat) || 0,
      hotText: item.heat,
      timestamp: Date.now(),
      source: this.platform,
    }));
  }
}
