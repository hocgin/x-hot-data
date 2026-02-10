import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface ZhihuArticle {
  id: number;
  title: string;
  url: string;
  excerpt: string;
  image_url: string;
  updated: number;
  author: {
    name: string;
  };
}

interface ZhihuResponse {
  data: ZhihuArticle[];
  paging: {
    is_end: boolean;
    totals: number;
  };
}

export class YouxiputaoScraper extends BaseScraper {
  readonly platform = 'youxiputao' as const;
  readonly displayName = '游戏葡萄';
  readonly baseUrl = 'https://zhuanlan.zhihu.com';
  readonly apiEndpoint = '/api/columns/gamegrapes/articles?limit=20&offset=0';
  protected override readonly timeout = 15000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url, {
      headers: {
        'Referer': this.baseUrl,
      },
    });

    const data = await this.parseJSON<ZhihuResponse>(response);

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format');
    }

    return data.data.map((item) => ({
      id: item.id.toString(),
      title: item.title,
      url: item.url,
      description: item.excerpt,
      cover: item.image_url,
      author: item.author?.name,
      timestamp: item.updated * 1000,
      source: 'youxiputao',
      hot: undefined, // 知乎专栏文章列表不直接提供热度
    }));
  }
}
