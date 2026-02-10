/**
 * 抖音热搜爬虫
 */

import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

/**
 * 抖音热搜数据响应接口
 */
interface DouyinHotDataItem {
  word: string;
  hot_value: number;
  position?: number;
}

interface DouyinHotResponse {
  data: DouyinHotDataItem[];
  status_code: number;
  status_msg: string;
}

/**
 * 抖音热搜爬虫
 */
export class DouyinScraper extends BaseScraper {
  readonly platform = 'douyin' as const;
  readonly displayName = '抖音';
  readonly baseUrl = 'https://www.douyin.com';
  readonly apiEndpoint = '/aweme/v1/web/search/item/general/';
  protected override readonly timeout = 15000;
  private log = logger.child('DouyinScraper');

  /**
   * 获取抖音热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    // 参考 hot-trending 项目的抖音爬虫实现
    const params = new URLSearchParams({
      device_platform: 'webapp',
      aid: '6383',
      channel: 'channel_pc_web',
      search_channel: 'aweme_general',
      sort_type: '0',
      publish_time: '0',
      keyword: '热搜',
      search_source: 'normal_search',
      query_correct_type: '1',
      is_filter_search: '0',
      from_group_id: '',
      offset: '0',
      count: '20',
    });

    const url = `${this.baseUrl}${this.apiEndpoint}?${params.toString()}`;
    this.log.debug(`开始获取抖音热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.douyin.com',
          'Accept': 'application/json',
        },
      });

      const data = await this.parseJSON<DouyinHotResponse>(response);
      const timestamp = Date.now();

      if (data.status_code !== 0 && data.status_code !== 200) {
        this.log.warn(`抖音 API 返回状态码: ${data.status_code}, 消息: ${data.status_msg}`);
      }

      const items = (data.data || [])
        .filter((item) => item.word && item.hot_value)
        .map((item, index) => {
          // 参考 hot-trending：使用搜索链接 URL
          const searchUrl = `https://www.douyin.com/search/${encodeURIComponent(item.word)}`;
          // 热值处理：除以 10000 并保留 1 位小数，添加"万"后缀
          const hotValue = Math.round(item.hot_value / 100);
          return {
            id: this.generateId(item.word, `douyin_${index}`),
            title: item.word,
            url: searchUrl,
            hot: hotValue,
            hotText: this.formatHotScore(item.hot_value),
            timestamp,
            source: this.platform,
          };
        })
        .filter((item) => item.hot && item.hot > 0)
        .sort((a, b) => (b.hot || 0) - (a.hot || 0));

      this.log.success(`成功获取 ${items.length} 条抖音热搜数据`);
      return items;
    } catch (error) {
      this.log.error('抖音热搜数据获取失败', error);
      return [];
    }
  }

  /**
   * 格式化热度分数
   * 参考 hot-trending：将原始热值除以 10000 并保留 1 位小数
   */
  private formatHotScore(score: number): string {
    // 将原始热值除以 10000，保留 1 位小数
    const value = Math.round(score / 100) / 100;
    if (value >= 10000) {
      return `${(value / 10000).toFixed(1)}亿`;
    }
    return `${value.toFixed(1)}万`;
  }
}
