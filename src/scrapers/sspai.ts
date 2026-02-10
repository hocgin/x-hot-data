/**
 * 少数派爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 少数派文章数据项
 */
interface SspaiArticle {
  id: number;
  title: string;
  released_time: number;
  author: {
    nickname: string;
  };
  like_count: number;
  comment_count: number;
}

/**
 * 少数派API响应
 */
interface SspaiResponse {
  data: SspaiArticle[];
}

/**
 * 少数派爬虫
 */
export class SspaiScraper extends BaseScraper {
  readonly platform = 'sspai' as const;
  readonly displayName = '少数派';
  readonly baseUrl = 'https://sspai.com';
  readonly apiEndpoint = '/api/v1/article/tag/page/get?limit=100000&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0';
  protected override readonly timeout = 15000;
  private log = logger.child('SspaiScraper');

  /**
   * 获取少数派热门文章数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取少数派热门文章数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        },
      });

      const data = await this.parseJSON<SspaiResponse>(response);
      const timestamp = Date.now();

      const items = (data.data || [])
        .map((article, index) => ({
          id: this.generateId(article.title, `sspai_${article.id}`),
          title: article.title,
          url: `https://sspai.com/post/${article.id}`,
          author: article.author?.nickname,
          hot: article.like_count || 0,
          description: `评论 ${article.comment_count || 0}`,
          timestamp,
          source: this.platform,
        }))
        .filter((item) => item.title);

      this.log.success(`成功获取 ${items.length} 条少数派热门文章数据`);
      return items;
    } catch (error) {
      this.log.error('少数派热门文章数据获取失败', error);
      return [];
    }
  }
}
