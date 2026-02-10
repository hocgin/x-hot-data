/**
 * 豆瓣小组爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 豆瓣小组爬虫
 */
export class DoubanScraper extends BaseScraper {
  readonly platform = 'douban' as const;
  readonly displayName = '豆瓣小组';
  readonly baseUrl = 'https://www.douban.com';
  readonly apiEndpoint = '/group/explore';
  protected override readonly timeout = 15000;
  private log = logger.child('DoubanScraper');

  /**
   * 获取豆瓣小组热门数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取豆瓣小组热门数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条豆瓣小组热门数据`);
      return items;
    } catch (error) {
      this.log.error('豆瓣小组热门数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配 <div class="channel-item"><div class="bd"><h3><a href="...">标题</a></h3></div></div>
    const pattern = /<div\s+class="channel-item"[^>]*>.*?<div\s+class="bd"[^>]*>.*?<h3[^>]*>.*?<a\s+href="([^"]*)"[^>]*>([^<]*)<\/a>/gs;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 20) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `douban_${index}`),
          title,
          url: url.startsWith('http') ? url : `https://www.douban.com${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
