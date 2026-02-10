/**
 * 知乎热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { getPlatformConfig } from '../config/platforms.ts';

/**
 * 知乎热搜数据响应接口
 */
interface ZhihuHotDataItem {
  target: {
    id: string;
    title: string;
    url: string;
    excerpt?: string;
    cover?: {
      url?: string;
    };
  };
  detail_text: string;
  hot_value: number;
  type: string;
}

interface ZhihuHotResponse {
  data: ZhihuHotDataItem[];
}

/**
 * 知乎热搜爬虫
 */
export class ZhihuScraper extends BaseScraper {
  readonly platform = 'zhihu' as const;
  readonly displayName = '知乎';
  readonly baseUrl = 'https://www.zhihu.com';
  readonly apiEndpoint = '/api/v3/feed/topstory/hot-lists/total';

  /**
   * 获取知乎热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const config = getPlatformConfig(this.platform);
    const url = `${this.baseUrl}${this.apiEndpoint}`;

    const response = await this.fetchWithRetry(url, {
      headers: {
        'Referer': 'https://www.zhihu.com/hot',
      },
    });

    const data = await this.parseJSON<ZhihuHotResponse>(response);
    const timestamp = Date.now();

    return data.data
      .filter((item) => item.target && item.target.title)
      .map((item) => ({
        id: this.generateId(item.target.title, item.target.url),
        title: item.target.title,
        url: item.target.url,
        hot: item.hot_value,
        hotText: item.detail_text,
        description: item.target.excerpt,
        cover: item.target.cover?.url,
        category: this.parseCategory(item.type),
        timestamp,
        source: this.platform,
      }))
      .filter((item) => item.hot && item.hot > 0)
      .sort((a, b) => (b.hot || 0) - (a.hot || 0));
  }

  /**
   * 解析分类
   */
  private parseCategory(type: string): string | undefined {
    const typeMap: Record<string, string> = {
      'hot_list': '热搜',
      'hot_topic': '话题',
      'hot_question': '问答',
    };
    return typeMap[type] || undefined;
  }
}
