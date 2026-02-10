/**
 * 存储工具类
 */

import * as path from '@std/path';
import { ensureDir } from '@std/fs';
import type { TrendingItem, Platform, DailyData } from '../types/trending.ts';
import { DATA_BASE_PATH, DATE_FORMAT } from '../config/constants.ts';
import dayjs from 'dayjs';

/**
 * 存储服务类
 */
export class StorageService {
  private basePath: string;

  constructor(basePath: string = DATA_BASE_PATH) {
    this.basePath = basePath;
  }

  /**
   * 保存单平台数据
   */
  async savePlatformData(
    date: string,
    platform: Platform,
    items: TrendingItem[]
  ): Promise<void> {
    const dateDir = path.join(this.basePath, date);
    await ensureDir(dateDir);

    const filePath = path.join(dateDir, `${platform}.json`);
    const data = {
      platform,
      items,
      fetchedAt: Date.now(),
      fetchedAtFormatted: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    await Deno.writeTextFile(filePath, JSON.stringify(data, null, 2), {
      create: true,
    });
  }

  /**
   * 读取单平台数据
   */
  async loadPlatformData(
    date: string,
    platform: Platform
  ): Promise<TrendingItem[] | null> {
    const filePath = path.join(this.basePath, date, `${platform}.json`);

    try {
      const content = await Deno.readTextFile(filePath);
      const data = JSON.parse(content);
      return data.items || [];
    } catch {
      return null;
    }
  }

  /**
   * 保存每日数据
   */
  async saveDailyData(
    date: string,
    platformsData: Map<Platform, TrendingItem[]>
  ): Promise<void> {
    const promises = Array.from(platformsData.entries()).map(
      ([platform, items]) => this.savePlatformData(date, platform, items)
    );

    await Promise.all(promises);
  }

  /**
   * 读取每日数据
   */
  async loadDailyData(date: string): Promise<DailyData | null> {
    const dateDir = path.join(this.basePath, date);

    try {
      const entries = Array.from(Deno.readDirSync(dateDir));
      const platformFiles = entries.filter((e) => e.name.endsWith('.json'));

      if (platformFiles.length === 0) {
        return null;
      }

      const data: Record<Platform, TrendingItem[]> = {} as Record<
        Platform,
        TrendingItem[]
      >;

      for (const file of platformFiles) {
        const platform = file.name.replace('.json', '') as Platform;
        const items = await this.loadPlatformData(date, platform);
        if (items) {
          data[platform] = items;
        }
      }

      return {
        date,
        data,
        updatedAt: Date.now(),
      };
    } catch {
      return null;
    }
  }

  /**
   * 获取最新可用日期
   */
  async getLatestAvailableDate(): Promise<string | null> {
    try {
      const entries = Array.from(Deno.readDirSync(this.basePath));
      const dates = entries
        .filter((e) => e.isDirectory && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
        .map((e) => e.name)
        .sort()
        .reverse();

      return dates[0] || null;
    } catch {
      return null;
    }
  }

  /**
   * 清理过期数据
   */
  async cleanupOldData(retentionDays: number = 90): Promise<void> {
    const cutoffDate = dayjs().subtract(retentionDays, 'day');
    const entries = Array.from(Deno.readDirSync(this.basePath));

    for (const entry of entries) {
      if (!entry.isDirectory || !/^\d{4}-\d{2}-\d{2}$/.test(entry.name)) {
        continue;
      }

      const entryDate = dayjs(entry.name, DATE_FORMAT);
      if (entryDate.isBefore(cutoffDate)) {
        const dirPath = path.join(this.basePath, entry.name);
        await Deno.remove(dirPath, { recursive: true });
      }
    }
  }

  /**
   * 获取所有可用日期
   */
  async getAvailableDates(): Promise<string[]> {
    try {
      const entries = Array.from(Deno.readDirSync(this.basePath));
      return entries
        .filter((e) => e.isDirectory && /^\d{4}-\d{2}-\d{2}$/.test(e.name))
        .map((e) => e.name)
        .sort()
        .reverse();
    } catch {
      return [];
    }
  }
}
