/**
 * 知乎热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

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
  protected override readonly timeout = 15000;

  /**
   * 获取知乎热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.zhihu.com/hot',
          'Accept': 'application/json, text/plain, */*',
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
    } catch (error) {
      // 如果知乎 API 失败，返回模拟数据用于测试
      console.warn('知乎 API 请求失败，返回模拟数据');
      return [];
    }
  }

  /**
   * 获取模拟数据（用于测试）
   */
  private getMockData(): TrendingItem[] {
    const timestamp = Date.now();
    return [
      {
        id: this.generateId('如何快速学习 TypeScript', 'https://www.zhihu.com/question/1'),
        title: '如何快速学习 TypeScript',
        url: 'https://www.zhihu.com/question/1',
        hot: 1250000,
        hotText: '125万热',
        category: '热搜',
        timestamp,
        source: this.platform,
      },
      {
        id: this.generateId('2024年最值得期待的技术趋势', 'https://www.zhihu.com/question/2'),
        title: '2024年最值得期待的技术趋势',
        url: 'https://www.zhihu.com/question/2',
        hot: 980000,
        hotText: '98万热',
        category: '热搜',
        timestamp,
        source: this.platform,
      },
      {
        id: this.generateId('程序员如何保持技术敏感度', 'https://www.zhihu.com/question/3'),
        title: '程序员如何保持技术敏感度',
        url: 'https://www.zhihu.com/question/3',
        hot: 750000,
        hotText: '75万热',
        category: '热搜',
        timestamp,
        source: this.platform,
      },
    ];
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
