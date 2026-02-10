/**
 * 微博热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 微博热搜数据响应接口
 */
interface WeiboHotDataItem {
  word: string;
  word_cut?: string;
  num?: number;  // 热度值（实际字段）
  raw_hot?: string;
  hot_score?: number;
  category?: string;
  icon_desc?: string;
  flag?: number;
}

interface WeiboHotResponse {
  ok?: number;
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
  protected override readonly timeout = 15000;
  private log = logger.child('WeiboScraper');

  /**
   * 获取微博热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取微博热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://weibo.com',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      const data = await this.parseJSON<WeiboHotResponse>(response);
      const timestamp = Date.now();

      const items = (data.data?.realtime || [])
        .filter((item) => item.word)
        .map((item, index) => {
          // 使用 num 字段作为热度值（微博 API 的实际字段）
          const hotScore = item.num || item.hot_score || this.parseHotValue(item.raw_hot || '') || 0;
          // 构建搜索链接 URL（参考 hot-trending 项目）
          const searchUrl = `https://s.weibo.com/weibo?q=${encodeURIComponent(item.word)}`;
          return {
            id: this.generateId(item.word, `weibo_${index}`),
            title: item.word,
            url: searchUrl,
            hot: hotScore,
            hotText: item.raw_hot || this.formatHotScore(hotScore),
            category: item.icon_desc,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

      this.log.success(`成功获取 ${items.length} 条微博热搜数据`);
      return items;
    } catch (error) {
      this.log.error('微博热搜数据获取失败', error);
      // 不再返回模拟数据，而是抛出错误或返回空数组
      return [];
    }
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
