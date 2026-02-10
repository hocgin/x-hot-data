/**
 * 微博热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

/**
 * 微博热搜数据响应接口
 */
interface WeiboHotDataItem {
  word: string;
  word_cut: string;
    raw_hot?: string;
    hot_score?: number;
  category?: string;
  icon_desc?: string;
}

interface WeiboHotResponse {
  data: {
    realtime: WeiboHotDataItem[];
  };
}

/**
 * 微博热搜爬虫
 */
export class WeiboScraper extends BaseScraper {
  readonly platform = 'weibo' as const;
  readonly displayName = '微博';
  readonly baseUrl = 'https://weibo.com';
  readonly apiEndpoint = '/ajax/side/hotSearch';

  /**
   * 获取微博热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Referer': 'https://weibo.com',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const data = await this.parseJSON<WeiboHotResponse>(response);
    const timestamp = Date.now();

    return (data.data?.realtime || [])
      .filter((item) => item.word && item.word_cut)
      .map((item, index) => {
        const hotScore = item.hot_score || this.parseHotValue(item.raw_hot || '') || 0;
        return {
          id: this.generateId(item.word, `weibo_${index}`),
          title: item.word,
          hot: hotScore,
          hotText: item.raw_hot || this.formatHotScore(hotScore),
          category: item.category || item.icon_desc,
          timestamp,
          source: this.platform,
        };
      })
      .filter((item) => item.hot && item.hot > 0)
      .sort((a, b) => (b.hot || 0) - (a.hot || 0));
  }

  /**
   * 格式化热度分数
   */
  private formatHotScore(score: number): string {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}万`;
    } else if (score >= 10000) {
      return `${(score / 10000).toFixed(1)}万`;
    }
    return score.toString();
  }
}
