/**
 * CSDN 热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * CSDN 热搜数据响应接口
 */
interface CsdnHotDataItem {
  articleTitle: string;
  articleDetailUrl: string;
  hotRankScore: string;
  nickName: string;
  viewCount: string;
  commentCount: string;
  favorCount: string;
}

interface CsdnHotResponse {
  code: number;
  data: CsdnHotDataItem[];
}

/**
 * CSDN 热搜爬虫
 */
export class CsdnScraper extends BaseScraper {
  readonly platform = 'csdn' as const;
  readonly displayName = 'CSDN';
  readonly baseUrl = 'https://blog.csdn.net';
  readonly apiEndpoint = '/phoenix/web/blog/hotRank';
  protected override readonly timeout = 15000;
  private log = logger.child('CsdnScraper');

  /**
   * 获取 CSDN 热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}?&pageSize=100`;
    this.log.debug(`开始获取 CSDN 热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.csdn.net',
          'Accept': 'application/json',
        },
      });

      const data = await this.parseJSON<CsdnHotResponse>(response);
      const timestamp = Date.now();

      if (data.code !== 200) {
        throw new Error(`CSDN API 返回错误: code=${data.code}`);
      }

      const items = (data.data || [])
        .map((item, index) => {
          // 使用 hotRankScore 作为热度值
          const hotValue = parseInt(item.hotRankScore, 10) || 0;
          return {
            id: this.generateId(item.articleTitle, `csdn_${index}`),
            title: item.articleTitle,
            url: item.articleDetailUrl,
            hot: hotValue,
            hotText: item.hotRankScore || hotValue.toString(),
            description: `作者: ${item.nickName}`,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

      this.log.success(`成功获取 ${items.length} 条 CSDN 热搜数据`);
      return items;
    } catch (error) {
      this.log.error('CSDN 热搜数据获取失败', error);
      return [];
    }
  }
}
