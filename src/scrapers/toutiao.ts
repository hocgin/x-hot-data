/**
 * 今日头条热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 今日头条热搜数据响应接口
 */
interface ToutiaoHotDataItem {
  ClusterId: string;
  Title: string;
  Url: string;
  HotValue: string;
  Label?: string;
  LabelDesc?: string;
}

interface ToutiaoHotResponse {
  data: ToutiaoHotDataItem[];
}

/**
 * 今日头条热搜爬虫
 */
export class ToutiaoScraper extends BaseScraper {
  readonly platform = 'toutiao' as const;
  readonly displayName = '今日头条';
  readonly baseUrl = 'https://www.toutiao.com';
  readonly apiEndpoint = '/hot-event/hot-board/?origin=toutiao_pc';
  protected override readonly timeout = 15000;
  private log = logger.child('ToutiaoScraper');

  /**
   * 获取今日头条热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取今日头条热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.toutiao.com',
          'Accept': 'application/json',
        },
      });

      const data = await this.parseJSON<ToutiaoHotResponse>(response);
      const timestamp = Date.now();

      const items = (data.data || [])
        .map((item, index) => {
          // 使用 HotValue 作为热度值
          const hotValue = parseInt(item.HotValue, 10) || 0;
          return {
            id: this.generateId(item.Title, `toutiao_${index}`),
            title: item.Title,
            url: item.Url,
            hot: hotValue,
            hotText: this.formatHotScore(hotValue),
            category: item.LabelDesc,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

      this.log.success(`成功获取 ${items.length} 条今日头条热搜数据`);
      return items;
    } catch (error) {
      this.log.error('今日头条热搜数据获取失败', error);
      return [];
    }
  }

  /**
   * 格式化热度分数
   */
  private formatHotScore(score: number): string {
    if (score >= 100000000) {
      return `${(score / 100000000).toFixed(1)}亿`;
    } else if (score >= 10000) {
      return `${(score / 10000).toFixed(1)}万`;
    }
    return score.toString();
  }
}
