/**
 * AcFun爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * AcFun排行榜数据项
 */
interface AcfunRankItem {
  contentTitle: string;
  shareUrl: string;
}

/**
 * AcFun API响应
 */
interface AcfunResponse {
  rankList: AcfunRankItem[];
}

/**
 * AcFun爬虫
 */
export class AcfunScraper extends BaseScraper {
  readonly platform = 'acfun' as const;
  readonly displayName = 'AcFun';
  readonly baseUrl = 'https://www.acfun.cn';
  readonly apiEndpoint = '/rest/pc-direct/rank/channel?channelId=&subChannelId=&rankLimit=30&rankPeriod=DAY';
  protected override readonly timeout = 15000;
  private log = logger.child('AcfunScraper');

  /**
   * 获取AcFun排行榜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取AcFun排行榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
        },
      });

      const data = await this.parseJSON<AcfunResponse>(response);
      const timestamp = Date.now();

      const items = (data.rankList || [])
        .map((item, index) => ({
          id: this.generateId(item.contentTitle, `acfun_${index}`),
          title: item.contentTitle,
          url: item.shareUrl,
          timestamp,
          source: this.platform,
        }))
        .filter((item) => item.title && item.url);

      this.log.success(`成功获取 ${items.length} 条AcFun排行榜数据`);
      return items;
    } catch (error) {
      this.log.error('AcFun排行榜数据获取失败', error);
      return [];
    }
  }
}
