/**
 * 任务调度服务
 */

import type { Platform, TrendingItem, PlatformData, FetchResult } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';
import { getPlatformConfig } from '../config/platforms.ts';
import type { BaseScraper } from '../scrapers/base.ts';

/**
 * 调度服务类
 */
export class SchedulerService {
  private scrapers: Map<Platform, BaseScraper>;
  private log: logger;

  constructor(scrapers: BaseScraper[]) {
    this.scrapers = new Map(scrapers.map((s) => [s.platform, s]));
    this.log = logger.child('Scheduler');
  }

  /**
   * 获取单个平台数据
   */
  async fetchPlatform(platform: Platform): Promise<PlatformData> {
    const scraper = this.scrapers.get(platform);
    if (!scraper) {
      return {
        platform,
        items: [],
        fetchedAt: Date.now(),
        success: false,
        error: '爬虫未注册',
      };
    }

    const config = getPlatformConfig(platform);
    this.log.info(`开始获取 ${config.displayName} 热门数据`);

    try {
      const startTime = Date.now();
      const items = await scraper.fetchTrending();
      const duration = Date.now() - startTime;

      this.log.success(
        `${config.displayName} 获取成功，共 ${items.length} 条数据，耗时 ${duration}ms`
      );

      return {
        platform,
        items,
        fetchedAt: Date.now(),
        success: true,
      };
    } catch (error) {
      this.log.error(`${config.displayName} 获取失败`, error);
      return {
        platform,
        items: [],
        fetchedAt: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 获取所有平台数据
   */
  async fetchAll(platforms?: Platform[]): Promise<FetchResult> {
    const startTime = Date.now();
    const targetPlatforms = platforms || Array.from(this.scrapers.keys());

    this.log.info(`开始获取 ${targetPlatforms.length} 个平台的热门数据`);

    // 并发获取所有平台数据
    const results = await Promise.all(
      targetPlatforms.map((platform) => this.fetchPlatform(platform))
    );

    const totalItems = results.reduce((sum, r) => sum + r.items.length, 0);
    const successCount = results.filter((r) => r.success).length;
    const failedCount = results.length - successCount;
    const duration = Date.now() - startTime;

    this.log.success(
      `数据获取完成，共 ${totalItems} 条，成功 ${successCount} 个，失败 ${failedCount} 个，耗时 ${duration}ms`
    );

    return {
      platforms: results,
      totalItems,
      successCount,
      failedCount,
      duration,
    };
  }

  /**
   * 获取所有平台数据（返回 Map 格式）
   */
  async fetchAllAsMap(platforms?: Platform[]): Promise<Map<Platform, TrendingItem[]>> {
    const result = await this.fetchAll(platforms);
    const map = new Map<Platform, TrendingItem[]>();

    for (const platformData of result.platforms) {
      if (platformData.success) {
        map.set(platformData.platform, platformData.items);
      }
    }

    return map;
  }

  /**
   * 注册爬虫
   */
  registerScraper(scraper: BaseScraper): void {
    this.scrapers.set(scraper.platform, scraper);
    this.log.info(`注册爬虫: ${scraper.displayName}`);
  }

  /**
   * 移除爬虫
   */
  unregisterScraper(platform: Platform): void {
    this.scrapers.delete(platform);
    this.log.info(`移除爬虫: ${platform}`);
  }

  /**
   * 获取已注册的爬虫列表
   */
  getRegisteredPlatforms(): Platform[] {
    return Array.from(this.scrapers.keys());
  }
}
