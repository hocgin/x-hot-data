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
  readonly apiEndpoint = '/x/web-interface/hot';
  protected override readonly timeout = 15000;
  private log = logger.child('BilibiliScraper');

  /**
   * 获取B站热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取B站热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.bilibili.com',
          'Origin': 'https://www.bilibili.com',
          'Accept': 'application/json',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
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
          const videoUrl = `https://www.bilibili.com/video/${item.id}`;
          // 使用观看量作为热度值
          const hotValue = item.stat?.view || 0;
          return {
            id: this.generateId(item.title, `bilibili_${index}`),
            title: item.title,
            url: videoUrl,
            hot: hotValue,
            hotText: this.formatHotScore(hotValue),
            description: item.description,
            cover: item.pic,
            author: item.owner?.name,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
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
