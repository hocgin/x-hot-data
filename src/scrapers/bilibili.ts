/**
 * B站热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * B站热搜数据响应接口
 */
interface BilibiliHotDataItem {
  id: string;
  title: string;
  dynamic?: string;
  description?: string;
  owner?: {
    name: string;
    mid: string;
  };
  stat?: {
    view: number;
    like: number;
    coin: number;
    favorite: number;
  };
  pic?: string;
}

interface BilibiliHotResponse {
  code: number;
  message: string;
  data: {
    list: BilibiliHotDataItem[];
  };
}

/**
 * B站热搜爬虫
 */
export class BilibiliScraper extends BaseScraper {
  readonly platform = 'bilibili' as const;
  readonly displayName = 'B站';
  readonly baseUrl = 'https://api.bilibili.com';
  readonly apiEndpoint = '/x/web-interface/popular';
  protected override readonly timeout = 15000;
  private log = logger.child('BilibiliScraper');

  /**
   * 获取B站热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const params = new URLSearchParams({
      ps: '20',
      pn: '1',
    });
    const url = `${this.baseUrl}${this.apiEndpoint}?${params.toString()}`;
    this.log.debug(`开始获取B站热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.bilibili.com/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const data = await this.parseJSON<BilibiliHotResponse>(response);
      const timestamp = Date.now();

      if (data.code !== 0) {
        throw new Error(`B站 API 返回错误: ${data.message}`);
      }

      const items = (data.data?.list || [])
        .map((item, index) => {
          // 构建视频链接 URL
          const videoUrl = item.short_link_v2 || `https://www.bilibili.com/video/${item.bvid || item.aid}`;
          // 使用观看量作为热度值
          const hotValue = item.stat?.view || 0;
          return {
            id: this.generateId(item.title, `bilibili_${index}`),
            title: item.title,
            url: videoUrl,
            hot: hotValue,
            hotText: this.formatHotScore(hotValue),
            description: item.desc || item.description,
            cover: item.pic,
            author: item.owner?.name,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.title)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

      this.log.success(`成功获取 ${items.length} 条B站热搜数据`);
      return items;
    } catch (error) {
      this.log.error('B站热搜数据获取失败', error);
      return [];
    }
  }

  /**
   * 格式化热度分数
   */
  private formatHotScore(score: number): string {
    if (score >= 100000000) {
      return `${(score / 100000000).toFixed(1)}亿`;
    } else if (score >= 10000) {
      return `${(score / 10000).toFixed(1)}万`;
    }
    return score.toString();
  }
}
