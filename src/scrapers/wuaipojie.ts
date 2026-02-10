/**
 * 吾爱破解爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 吾爱破解爬虫
 */
export class WuaipojieScraper extends BaseScraper {
  readonly platform = 'wuaipojie' as const;
  readonly displayName = '吾爱破解';
  readonly baseUrl = 'https://www.52pojie.cn';
  readonly apiEndpoint = '/misc.php?mod=ranklist&type=thread&view=heats&orderby=today';
  protected override readonly timeout = 15000;
  private log = logger.child('WuaipojieScraper');

  /**
   * 获取吾爱破解热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取吾爱破解热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条吾爱破解热榜数据`);
      return items;
    } catch (error) {
      this.log.error('吾爱破解热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配 <th><a href="..." target="_blank">标题</a></th>
    const pattern = /<th><a\s+href="([^"]*)"\s+target="_blank">([^<]*)<\/a><\/th>/g;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 30) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `wuaipojie_${index}`),
          title,
          url: url.startsWith('http') ? url : `https://www.52pojie.cn/${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
