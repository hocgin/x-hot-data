import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  descendants: number; // comments count
  by: string;
  time: number;
}

export class HackerNewsScraper extends BaseScraper {
  readonly platform = 'hackernews' as const;
  readonly displayName = 'Hacker News';
  readonly baseUrl = 'https://news.ycombinator.com';
  readonly apiEndpoint = 'https://hacker-news.firebaseio.com/v0/topstories.json';
  protected override readonly timeout = 30000; // 增加超时时间，因为需要多次请求

  async fetchTrending(): Promise<TrendingItem[]> {
    const response = await this.fetchWithRetry(this.apiEndpoint);
    const ids = await this.parseJSON<number[]>(response);
    
    // 只获取前 30 条
    const topIds = ids.slice(0, 30);
    
    const items: TrendingItem[] = [];
    
    // 并发获取详情
    const promises = topIds.map(async (id) => {
      try {
        const detailUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const detailRes = await this.fetchWithRetry(detailUrl);
        const detail = await this.parseJSON<HackerNewsItem>(detailRes);
        
        if (detail && detail.title) {
          return {
            id: detail.id.toString(),
            title: detail.title,
            url: detail.url || `${this.baseUrl}/item?id=${detail.id}`,
            hot: detail.score,
            hotText: `${detail.score} points`,
            description: `${detail.descendants || 0} comments`,
            author: detail.by,
            timestamp: detail.time * 1000,
            source: this.platform,
          } as TrendingItem;
        }
      } catch (e) {
        // 忽略单个失败
        console.error(`Failed to fetch HN item ${id}:`, e);
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter((item): item is TrendingItem => item !== null);
  }
}
