/**
 * 36氪爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';
import dayjs from 'dayjs';

/**
 * 36氪爬虫
 */
export class Kr36Scraper extends BaseScraper {
  readonly platform = 'kr36' as const;
  readonly displayName = '36氪';
  readonly baseUrl = 'https://36kr.com';
  readonly apiEndpoint = '/hot-list/renqi';
  protected override readonly timeout = 15000;
  private log = logger.child('Kr36Scraper');

  /**
   * 获取36氪热榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    // 使用今天的日期构建URL
    const today = dayjs().format('YYYY-MM-DD');
    const url = `${this.baseUrl}${this.apiEndpoint}/${today}/1`;
    this.log.debug(`开始获取36氪热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
          'Referer': '36kr.com',
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条36氪热榜数据`);
      return items;
    } catch (error) {
      this.log.error('36氪热榜数据获取失败', error);
      return [];
    }
  }

  /**
   * 解析HTML响应
   * 使用正则表达式解析文章列表
   */
  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配文章信息块：先找到 article-wrapper div，然后提取标题和链接
    // <div class="article-wrapper"><div class="article-item-info"><p class="title-wrapper"><a class="article-item-title" href="...">标题</a>
    const pattern = /<div\s+class="article-item-info"[^>]*>.*?<a\s+class="article-item-title"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gs;
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 10) {
      const url = match[1]?.trim();
      const title = match[2]?.trim();

      if (url && title) {
        items.push({
          id: this.generateId(title, `kr36_${index}`),
          title,
          url: url.startsWith('http') ? url : `https://36kr.com${url}`,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
