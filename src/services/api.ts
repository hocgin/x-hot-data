/**
 * API 数据服务
 * 用于生成符合 API 接口规范的 JSON 数据
 */

import * as path from '@std/path';
import { ensureDir } from '@std/fs';
import dayjs from 'dayjs';
import type { TrendingItem, Platform } from '../types/trending.ts';
import type {
  ApiDataItem,
  ProviderListResponse,
  NowResponse,
  HistoryResponse,
  HistoryDetailResponse,
  PLATFORM_TO_PROVIDER_ID,
} from '../types/api.ts';

/**
 * API 服务配置
 */
interface ApiServiceConfig {
  /** API 基础路径 */
  basePath: string;
  /** API URI 基础路径 */
  baseUri: string;
}

/**
 * API 数据服务类
 */
export class ApiService {
  private config: ApiServiceConfig;

  constructor(config?: Partial<ApiServiceConfig>) {
    this.config = {
      basePath: config?.basePath || './api',
      baseUri: config?.baseUri || '/api',
    };
  }

  /**
   * �换 TrendingItem 为 ApiDataItem
   */
  private trendingToApiData(item: TrendingItem): ApiDataItem {
    return {
      title: item.title,
      summary: item.description,
      url: item.url,
      imageUrl: item.cover,
      createdAt: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss'),
      tags: item.tags,
      hot: item.hot,
    };
  }

  /**
   * 获取 Provider ID 和优先级
   */
  private getProviderInfo(platform: Platform): { id: string; priority: number } {
    const platformToProviderInfo: Record<Platform, { id: string; priority: number }> = {
      zhihu: { id: 'zhihu-hot-questions', priority: 1000 },
      weibo: { id: 'weibo-top-search', priority: 999 },
      github: { id: 'github-trending', priority: 998 },
      baidu: { id: 'baidu-hot-search', priority: 997 },
      douyin: { id: 'douyin-hot', priority: 996 },
      bilibili: { id: 'bilibili-hot', priority: 995 },
      v2ex: { id: 'v2ex-hot', priority: 994 },
      hackernews: { id: 'hackernews-top', priority: 993 },
      toutiao: { id: 'toutiao-hot', priority: 992 },
      csdn: { id: 'csdn-hot', priority: 991 },
      ithome: { id: 'ithome-hot', priority: 990 },
      sspai: { id: 'sspai-hot', priority: 989 },
      acfun: { id: 'acfun-hot', priority: 988 },
      anquanke: { id: 'anquanke-hot', priority: 987 },
      hupu: { id: 'hupu-hot', priority: 986 },
      kr36: { id: 'kr36-hot', priority: 985 },
      wuaipojie: { id: 'wuaipojie-hot', priority: 983 },
    };
    return platformToProviderInfo[platform];
  }

  /**
   * 获取 Provider ID（兼容旧代码）
   */
  private getProviderId(platform: Platform): string {
    return this.getProviderInfo(platform).id;
  }

  /**
   * 生成 provider.json
   */
  async generateProviderList(
    platforms: Map<Platform, TrendingItem[]>
  ): Promise<void> {
    const providers = Array.from(platforms.keys()).map((platform) => {
      const info = this.getProviderInfo(platform);
      return {
        id: info.id,
        lastUpdateAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        priority: info.priority,
      };
    });

    const providerList: ProviderListResponse = { provider: providers };

    const filePath = path.join(this.config.basePath, 'provider.json');
    await ensureDir(this.config.basePath);
    await Deno.writeTextFile(filePath, JSON.stringify(providerList, null, 2));
  }

  /**
   * 生成 {provider-id}/now.json
   */
  async generateNowData(
    platform: Platform,
    items: TrendingItem[]
  ): Promise<void> {
    const providerId = this.getProviderId(platform);
    const providerDir = path.join(this.config.basePath, providerId);
    await ensureDir(providerDir);

    const timestamp = Date.now();
    const nowData: NowResponse = {
      id: `${providerId}.${timestamp}`,
      lastUpdatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: items.map(this.trendingToApiData),
    };

    const filePath = path.join(providerDir, 'now.json');
    await Deno.writeTextFile(filePath, JSON.stringify(nowData, null, 2));
  }

  /**
   * 生成 {provider-id}/history.json
   */
  async generateHistoryList(platform: Platform, dates: string[]): Promise<void> {
    const providerId = this.getProviderId(platform);
    const providerDir = path.join(this.config.basePath, providerId);
    await ensureDir(providerDir);

    const history = dates.map((date) => ({
      date,
      uri: `${this.config.baseUri}/${providerId}/history/${date}.json`,
    }));

    const historyData: HistoryResponse = {
      id: `${providerId}.history`,
      history,
    };

    const filePath = path.join(providerDir, 'history.json');
    await Deno.writeTextFile(filePath, JSON.stringify(historyData, null, 2));
  }

  /**
   * 生成 {provider-id}/history/{date}.json
   * 同一天多次采集时会追加数据，而不是覆盖
   */
  async generateHistoryDetail(
    platform: Platform,
    date: string,
    items: TrendingItem[]
  ): Promise<void> {
    const providerId = this.getProviderId(platform);
    const historyDir = path.join(this.config.basePath, providerId, 'history');
    await ensureDir(historyDir);

    const filePath = path.join(historyDir, `${date}.json`);
    const timestamp = Date.now();
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    // 新数据项
    const newDataItem = {
      id: `${providerId}.${timestamp}`,
      lastUpdatedAt: now,
      data: items.map(this.trendingToApiData),
    };

    // 尝试读取现有文件
    let historyDetail: HistoryDetailResponse;
    try {
      const existingContent = await Deno.readTextFile(filePath);
      const existingData = JSON.parse(existingContent) as HistoryDetailResponse;

      // 追加新数据项到现有文件
      historyDetail = {
        ...existingData,
        data: [...existingData.data, newDataItem],
      };
    } catch {
      // 文件不存在，创建新文件
      historyDetail = {
        id: `${providerId}.history.${date}`,
        createdAt: now,
        data: [newDataItem],
      };
    }

    await Deno.writeTextFile(filePath, JSON.stringify(historyDetail, null, 2));
  }

  /**
   * 生成所有 API 数据
   */
  async generateAllApiData(
    platforms: Map<Platform, TrendingItem[]>,
    date: string
  ): Promise<void> {
    // 生成 provider.json
    await this.generateProviderList(platforms);

    // 为每个平台生成数据
    for (const [platform, items] of platforms.entries()) {
      // 生成 now.json
      await this.generateNowData(platform, items);

      // 生成 history/{date}#time.json
      await this.generateHistoryDetail(platform, date, items);

      // 更新 history.json
      const providerId = this.getProviderId(platform);
      const historyDir = path.join(this.config.basePath, providerId, 'history');

      // 读取现有历史文件
      let existingDates: string[] = [];
      try {
        const historyPath = path.join(this.config.basePath, providerId, 'history.json');
        const historyContent = await Deno.readTextFile(historyPath);
        const historyData = JSON.parse(historyContent) as HistoryResponse;
        existingDates = historyData.history.map((h) => h.date);
      } catch {
        // 文件不存在，忽略
      }

      // 获取所有历史文件日期
      try {
        const files = Array.from(Deno.readDirSync(historyDir));
        const dates = files
          .filter((f) => f.name.endsWith('.json'))
          .map((f) => f.name.replace('.json', ''))  // 移除 .json 后缀
          .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));  // 验证日期格式

        // 合并现有日期和新日期
        const allDates = Array.from(new Set([...existingDates, ...dates, date])).sort().reverse();
        await this.generateHistoryList(platform, allDates);
      } catch {
        // 目录不存在，只添加当前日期
        await this.generateHistoryList(platform, [date]);
      }
    }
  }

  /**
   * 读取 now.json
   */
  async readNowData(platform: Platform): Promise<NowResponse | null> {
    const providerId = this.getProviderId(platform);
    const filePath = path.join(this.config.basePath, providerId, 'now.json');

    try {
      const content = await Deno.readTextFile(filePath);
      return JSON.parse(content) as NowResponse;
    } catch {
      return null;
    }
  }

  /**
   * 读取 provider.json
   */
  async readProviderList(): Promise<ProviderListResponse | null> {
    const filePath = path.join(this.config.basePath, 'provider.json');

    try {
      const content = await Deno.readTextFile(filePath);
      return JSON.parse(content) as ProviderListResponse;
    } catch {
      return null;
    }
  }
}
