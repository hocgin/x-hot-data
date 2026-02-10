import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface AnquankeResponse {
  errno: number;
  msg: string;
  data: {
    list: AnquankeArticle[];
  };
}

interface AnquankeArticle {
  rank: number;
  title: string;
  url: string;
  tag: number;
}

export class AnquankeScraper extends BaseScraper {
  readonly platform = 'anquanke' as const;
  readonly displayName = '安全客';
  readonly baseUrl = 'https://www.anquanke.com';
  readonly apiEndpoint = '/webapi/api/index/top/list';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}?page=1`;
    const response = await this.fetchWithRetry(url);
    const data = await this.parseJSON<AnquankeResponse>(response);

    if (data.errno !== 0) {
      throw new Error(`Anquanke API error: ${data.msg}`);
    }

    return data.data.list.map((item) => ({
      id: item.url,
      title: item.title,
      url: `${this.baseUrl}${item.url}`,
      hot: item.rank,
      hotText: `Top ${item.rank}`,
      timestamp: Date.now(), // 列表接口没有时间，使用当前时间
      source: this.platform,
    }));
  }
}
