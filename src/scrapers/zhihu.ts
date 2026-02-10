/**
 * 知乎热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 知乎热搜数据响应接口
 */
interface ZhihuHotDataItem {
  target: {
    id: string;
    title: string;
    url?: string;
    excerpt?: string;
    cover?: {
      url?: string;
    };
  };
  detail_text: string;
  hot_value?: number;
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
  private log = logger.child('ZhihuScraper');

  /**
   * 获取知乎热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    const url = 'https://www.zhihu.com/topsearch';
    this.log.debug(`开始获取知乎热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.zhihu.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        },
      });

      const html = await response.text();
      const match = html.match(/<script id="js-initialData" type="text\/json">(.+?)<\/script>/);

      if (!match) {
        throw new Error('未找到初始数据脚本 (js-initialData)');
      }

      const data = JSON.parse(match[1]);
      const topSearch = data.initialState?.topsearch?.data || [];
      const timestamp = Date.now();

      const items = topSearch
        .map((item: any, index: number) => {
          const query = item.queryDisplay || item.realQuery;
          const searchUrl = `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(query)}`;
          
          return {
            id: this.generateId(query, searchUrl),
            title: query,
            url: searchUrl,
            hot: 0, // 热搜榜暂时没有直接的热度数值
            hotText: item.display_num || '', // 尝试获取显示的热度文本
            description: item.queryDescription,
            timestamp,
            source: this.platform,
          };
        })
        .filter((item: TrendingItem) => item.title);

      this.log.success(`成功获取 ${items.length} 条知乎热搜数据`);
      return items;
    } catch (error) {
      this.log.error('知乎热搜数据获取失败', error);
      return [];
    }
  }

  /**
   * 从 detail_text 解析热度值
   * 格式如 "125万热" -> 1250000
   */
  private parseHotValueFromText(detailText: string): number | undefined {
    if (!detailText) return undefined;

    // 匹配 "数字+万+热" 或 "数字+亿+热" 格式
    const match = detailText.match(/(\d+\.?\d*)(万|亿)/);
    if (!match) return undefined;

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit === '万') {
      return Math.floor(value * 10000);
    } else if (unit === '亿') {
      return Math.floor(value * 100000000);
    }

    return Math.floor(value);
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
