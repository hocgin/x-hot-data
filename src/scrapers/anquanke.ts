/**
 * 安全客爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 安全客文章数据项
 */
interface AnquankeItem {
  title: string;
  url: string;
}

/**
 * 安全客API响应
 */
interface AnquankeResponse {
  data: {
    list: AnquankeItem[];
  };
}

/**
 * 安全客爬虫
 */
export class AnquankeScraper extends BaseScraper {
  readonly platform = 'anquanke' as const;
  readonly displayName = '安全客';
  readonly baseUrl = 'https://www.anquanke.com';
  readonly apiEndpoint = '/webapi/api/index/top/list';
  protected override readonly timeout = 15000;
  private log = logger.child('AnquankeScraper');

  /**
   * 获取安全客热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    this.log.debug(`开始获取安全客热榜数据`);

    try {
      // 获取前两页数据
      const items = await this.fetchPage(1);
      const items2 = await this.fetchPage(2);
      const allItems = [...items, ...items2];

      this.log.success(`成功获取 ${allItems.length} 条安全客热榜数据`);
      return allItems;
    } catch (error) {
      this.log.error('安全客热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 获取指定页码数据
   */
  private async fetchPage(page: number): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}?page=${page}`;
    const response = await this.fetchWithRetry(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
      },
    });

    const data = await this.parseJSON<AnquankeResponse>(response);
    const timestamp = Date.now();
    const startIndex = (page - 1) * 10;

    const items = (data.data?.list || [])
      .map((item, index) => ({
        id: this.generateId(item.title, `anquanke_${startIndex + index}`),
        title: item.title,
        url: item.url?.startsWith('http') ? item.url : `https://www.anquanke.com${item.url}`,
        timestamp,
        source: this.platform,
      }))
      .filter((item) => item.title);

    return items;
  }
}
