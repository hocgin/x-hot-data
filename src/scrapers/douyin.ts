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
  readonly apiEndpoint = '/aweme/v1/web/hot/search/list/';
  protected override readonly timeout = 15000;
  private log = logger.child('DouyinScraper');

  /**
   * 获取抖音热搜数据
   */
  async fetchTrending(): Promise<TrendingItem[]> {
    // 使用测试通过的 API 参数
    const params = new URLSearchParams({
      device_platform: 'webapp',
      aid: '6383',
      channel: 'channel_pc_web',
      detail_list: '1',
      source: '6',
      pc_client_type: '1',
      version_code: '170400',
      version_name: '17.4.0',
      cookie_enabled: 'true',
      screen_width: '1920',
      screen_height: '1080',
      browser_language: 'zh-CN',
      browser_platform: 'MacIntel',
      browser_name: 'Chrome',
      browser_version: '120.0.0.0',
      browser_online: 'true',
      engine_name: 'Blink',
      engine_version: '120.0.0.0',
      os_name: 'Mac OS X',
      os_version: '10_15_7',
      cpu_core_num: '8',
      device_memory: '8',
      platform: 'PC',
      downlink: '10',
      effective_type: '4g',
      round_trip_time: '100',
    });

    const url = `${this.baseUrl}${this.apiEndpoint}?${params.toString()}`;
    this.log.debug(`开始获取抖音热搜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Referer': 'https://www.douyin.com/hot',
          'Cookie': 'ttwid=1%7Cfake', // 必须带 Cookie，哪怕是假的
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const data = await this.parseJSON<any>(response);
      const timestamp = Date.now();

      if (data.status_code !== 0) {
        this.log.warn(`抖音 API 返回状态码: ${data.status_code}`);
      }

      const items = (data.data?.word_list || [])
        .filter((item: any) => item.word)
        .map((item: any, index: number) => {
          const searchUrl = `https://www.douyin.com/search/${encodeURIComponent(item.word)}`;
          const hotValue = item.hot_value || 0;
          
          return {
            id: this.generateId(item.word, `douyin_${index}`),
            title: item.word,
            url: searchUrl,
            hot: hotValue,
            hotText: this.formatHotScore(hotValue),
            timestamp,
            source: this.platform,
          };
        })
        .filter((item: TrendingItem) => item.title);

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
