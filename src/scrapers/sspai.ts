import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface SspaiResponse {
  error: number;
  msg: string;
  data: SspaiArticle[];
}

interface SspaiArticle {
  id: number;
  title: string;
  banner: string;
  summary: string;
  released_time: number; // 注意这里是 released_time
  author: {
    nickname: string;
    id: number;
  };
  like_count: number;
  comment_count: number;
}

export class SspaiScraper extends BaseScraper {
  readonly platform = 'sspai' as const;
  readonly displayName = '少数派';
  readonly baseUrl = 'https://sspai.com';
  readonly apiEndpoint = '/api/v1/article/tag/page/get';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}?limit=20&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0`;
    const response = await this.fetchWithRetry(url);
    const data = await this.parseJSON<SspaiResponse>(response);

    if (data.error !== 0) {
      throw new Error(`Sspai API error: ${data.msg}`);
    }

    // console.log('Sspai response data:', JSON.stringify(data, null, 2));

    return data.data.map((item, index) => ({
      id: item.id.toString(),
      title: item.title,
      url: `${this.baseUrl}/post/${item.id}`,
      description: item.summary,
      cover: item.banner,
      author: item.author.nickname,
      hot: item.like_count, // 使用点赞数作为热度
      hotText: `${item.like_count} 赞`,
      timestamp: item.released_time * 1000,
      source: this.platform,
    }));
  }
}
