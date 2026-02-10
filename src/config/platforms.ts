/**
 * 平台配置
 */

import type { Platform } from '../types/trending.ts';

/**
 * 平台配置接口
 */
export interface PlatformConfig {
  /** 平台名称 */
  name: Platform;
  /** 平台显示名称 */
  displayName: string;
  /** 基础 URL */
  baseUrl: string;
  /** API 端点 */
  apiEndpoint: string;
  /** 是否启用 */
  enabled: boolean;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** User-Agent */
  userAgent: string;
}

/**
 * 平台配置映射
 */
export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  zhihu: {
    name: 'zhihu',
    displayName: '知乎',
    baseUrl: 'https://www.zhihu.com',
    apiEndpoint: '/api/v3/feed/topstory/hot-lists/total',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  weibo: {
    name: 'weibo',
    displayName: '微博',
    baseUrl: 'https://weibo.com',
    apiEndpoint: '/ajax/side/hotSearch',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  github: {
    name: 'github',
    displayName: 'GitHub',
    baseUrl: 'https://github.com',
    apiEndpoint: '/trending',
    enabled: false,
    timeout: 15000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  baidu: {
    name: 'baidu',
    displayName: '百度',
    baseUrl: 'https://top.baidu.com',
    apiEndpoint: '/api/board',
    enabled: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  douyin: {
    name: 'douyin',
    displayName: '抖音',
    baseUrl: 'https://www.douyin.com',
    apiEndpoint: '/aweme/v1/hotsearch/list/',
    enabled: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  bilibili: {
    name: 'bilibili',
    displayName: 'B站',
    baseUrl: 'https://api.bilibili.com',
    apiEndpoint: '/x/web-interface/hot',
    enabled: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  v2ex: {
    name: 'v2ex',
    displayName: 'V2EX',
    baseUrl: 'https://www.v2ex.com',
    apiEndpoint: '/api/topics/hot.json',
    enabled: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  hackernews: {
    name: 'hackernews',
    displayName: 'Hacker News',
    baseUrl: 'https://hacker-news.firebaseio.com',
    apiEndpoint: '/v0/topstories.json',
    enabled: false,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
};

/**
 * 获取启用的平台列表
 */
export function getEnabledPlatforms(): Platform[] {
  return Object.entries(PLATFORM_CONFIGS)
    .filter(([_, config]) => config.enabled)
    .map(([name]) => name as Platform);
}

/**
 * 获取平台配置
 */
export function getPlatformConfig(platform: Platform): PlatformConfig {
  return PLATFORM_CONFIGS[platform];
}
