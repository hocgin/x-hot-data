/**
 * V2EX爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * V2EX爬虫
 */
export class V2exScraper extends BaseScraper {
  readonly platform = 'v2ex' as const;
  readonly displayName = 'V2EX';
  readonly baseUrl = 'https://www.v2ex.com';
  readonly apiEndpoint = '/?tab=hot';
  protected override readonly timeout = 15000;
  private log = logger.child('V2exScraper');

  /**
   * 获取V2EX热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取V2EX热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条V2EX热榜数据`);
      return items;
    } catch (error) {
      this.log.error('V2EX热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配 <span class="item_hot_topic_title"><a href="...">标题</a></span>
    const pattern = /<span\s+class="item_hot_topic_title">\s*<a\s+href="(.*?)">(.*?)<\/a>\s*<\/span>/g;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 30) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `v2ex_${index}`),
          title,
          url: url.startsWith('http') ? url : `https://www.v2ex.com${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
