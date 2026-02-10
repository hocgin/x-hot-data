/**
 * 虎扑爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 虎扑爬虫
 */
export class HupuScraper extends BaseScraper {
  readonly platform = 'hupu' as const;
  readonly displayName = '虎扑';
  readonly baseUrl = 'https://www.hupu.com';
  readonly apiEndpoint = '/';
  protected override readonly timeout = 15000;
  private log = logger.child('HupuScraper');

  /**
   * 获取虎扑热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取虎扑热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条虎扑热榜数据`);
      return items;
    } catch (error) {
      this.log.error('虎扑热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配 <a href="..."><div><div>序号</div><div>标题</div></div></a>
    const pattern = /<a\s+href="([^"]+)"[^>]*>\s*<div[^>]*>\s*<div[^>]*>\d+<\/div>\s*<div[^>]*>(.*?)<\/div>/gi;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 30) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `hupu_${index}`),
          title: this.cleanTitle(title),
          url: url.startsWith('http') ? url : `https://www.hupu.com${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }

  /**
   * 清理标题中的HTML标签和多余空格
   */
  private cleanTitle(title: string): string {
    return title
      .replace(/<[^>]+>/g, '')  // 移除HTML标签
      .replace(/\s+/g, ' ')      // 合并多余空格
      .trim();
  }
}
