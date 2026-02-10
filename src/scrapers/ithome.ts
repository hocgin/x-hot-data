/**
 * IT之家爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * IT之家热榜数据项
 */
interface ITHomeItem {
  title: string;
  url: string;
}

/**
 * IT之家爬虫
 */
export class ITHomeScraper extends BaseScraper {
  readonly platform = 'ithome' as const;
  readonly displayName = 'IT之家';
  readonly baseUrl = 'https://m.ithome.com';
  readonly apiEndpoint = '/rankm/';
  protected override readonly timeout = 15000;
  private log = logger.child('ITHomeScraper');

  /**
   * 获取IT之家热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取IT之家热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条IT之家热榜数据`);
      return items;
    } catch (error) {
      this.log.error('IT之家热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配 <a href="..."><p class="plc-title">标题</p></a>
    const pattern = /<a\s+href="(.*?)".*?<p\s+class="plc-title">(.*?)<\/p>/gs;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 50) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `ithome_${index}`),
          title,
          url: url.startsWith('http') ? url : `https://m.ithome.com${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
