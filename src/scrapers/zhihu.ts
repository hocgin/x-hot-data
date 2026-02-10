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
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取知乎热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.zhihu.com/hot',
          'Origin': 'https://www.zhihu.com',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      });

      const data = await this.parseJSON<ZhihuHotResponse>(response);
      const timestamp = Date.now();

      const items = data.data
        .filter((item) => item.target && item.target.title)
        .map((item) => {
          // 参考 hot-trending 项目：使用 target.id 构建问题链接
          const questionUrl = item.target.url || `https://www.zhihu.com/question/${item.target.id}`;
          // 从 detail_text 解析热度值（格式如 "125万热"）
          const hotValue = item.hot_value || this.parseHotValueFromText(item.detail_text) || 0;
          return {
            id: this.generateId(item.target.title, questionUrl),
            title: item.target.title,
            url: questionUrl,
            hot: hotValue,
            hotText: item.detail_text,
            description: item.target.excerpt,
            cover: item.target.cover?.url,
            category: this.parseCategory(item.type),
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

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
