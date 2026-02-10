import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface QQNewsItem {
  id: string;
  shareUrl: string;
  hotEvent?: {
    id: string;
    ranking: number;
    title: string;
    hotScore: number;
  };
}

interface QQNewsResponse {
  idlist: Array<{
    newslist: QQNewsItem[];
  }>;
}

export class QQNewsScraper extends BaseScraper {
  readonly platform = 'qqnews' as const;
  readonly displayName = '腾讯新闻';
  readonly baseUrl = 'https://r.inews.qq.com';
  readonly apiEndpoint = '/gw/event/hot_ranking_list?ids_hash=&offset=0&page_id=1&page_size=50';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const data = await this.parseJSON<QQNewsResponse>(response);
    
    if (!data.idlist || data.idlist.length === 0 || !data.idlist[0].newslist) {
      return [];
    }

    return data.idlist[0].newslist
      .filter(item => item.hotEvent && item.hotEvent.title)
      .map((item) => ({
        id: item.hotEvent!.id || item.id,
        title: item.hotEvent!.title,
        url: item.shareUrl,
        hot: item.hotEvent!.hotScore,
        hotText: `${item.hotEvent!.hotScore}`,
        timestamp: Date.now(),
        source: this.platform,
      }));
  }
}
