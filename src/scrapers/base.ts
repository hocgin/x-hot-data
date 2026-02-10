/**
 * 爬虫基类
 */

import type { TrendingItem, Platform } from '../types/trending.ts';
import { NetworkError, RateLimitError, ParseError } from '../types/error.ts';
import { DEFAULT_HEADERS, MAX_RETRIES, RETRY_DELAY_BASE } from '../config/constants.ts';

/**
 * 爬虫抽象基类
 */
export abstract class BaseScraper {
  /** 平台名称 */
  abstract readonly platform: Platform;

  /** 平台显示名称 */
  abstract readonly displayName: string;

  /** 基础 URL */
  abstract readonly baseUrl: string;

  /** API 端点 */
  abstract readonly apiEndpoint: string;

  /** 请求超时时间 */
  protected readonly timeout: number = 10000;

  /**
   * 获取热门话题数据
   */
  abstract fetchTrending(): Promise<TrendingItem[]>;

  /**
   * 带重试机制的 HTTP 请求
   */
  protected async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = MAX_RETRIES
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);

        clearTimeout(timeoutId);

        // 检查是否被限流
        if (response.status === 429) {
          throw new RateLimitError(this.platform);
        }

        // 检查响应状态
        if (!response.ok) {
          throw new NetworkError(
            this.platform,
            new Error(`HTTP ${response.status}: ${response.statusText}`)
          );
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // 如果是 AbortError，说明是超时
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = new NetworkError(this.platform, new Error('请求超时'));
        }

        // 如果是最后一次尝试，抛出错误
        if (attempt === maxRetries - 1) {
          break;
        }

        // 延迟后重试
        await this.delay(RETRY_DELAY_BASE * (attempt + 1));
      }
    }

    throw lastError || new NetworkError(this.platform);
  }

  /**
   * 解析 JSON 响应
   */
  protected async parseJSON<T>(response: Response): Promise<T> {
    try {
      return await response.json();
    } catch (error) {
      throw new ParseError(this.platform, '无法解析 JSON 响应', error);
    }
  }

  /**
   * 生成唯一 ID
   */
  protected generateId(title: string, url?: string): string {
    const timestamp = Date.now();
    const hash = this.simpleHash(title + (url || ''));
    return `${this.platform}_${timestamp}_${hash}`;
  }

  /**
   * 简单的字符串哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * 延迟函数
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 解析热度值
   */
  protected parseHotValue(hotText: string): number | undefined {
    if (!hotText) return undefined;

    // 处理 "100万+热" 这种格式
    const match = hotText.match(/(\d+\.?\d*)(万|亿)?/);
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
}
