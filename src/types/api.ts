/**
 * API 数据类型定义
 * 用于生成符合 API 接口规范的 JSON 数据
 */

import type { Platform } from './trending.ts';

/**
 * API 数据项
 */
export interface ApiDataItem {
  /** 标题 */
  title: string;
  /** 摘要 */
  summary?: string;
  /** 链接地址 */
  url?: string;
  /** 封面图片 */
  imageUrl?: string;
  /** 创建时间 */
  createdAt: string;
  /** 标签 */
  tags?: string[];
  /** 热度值 */
  hot?: number;
}

/**
 * Provider 信息
 */
export interface ProviderInfo {
  /** Provider ID */
  id: string;
  /** 标题 */
  title: string;
  /** 封面图片 */
  imageUrl: string | null;
  /** 链接地址 */
  url: string;
  /** 最后更新时间 */
  lastUpdateAt: string;
  /** 优先级 */
  priority: number;
}

/**
 * Provider 列表响应
 */
export interface ProviderListResponse {
  provider: ProviderInfo[];
}

/**
 * Now.json 响应格式
 */
export interface NowResponse {
  /** ID 格式: {provider-id}.{timestamp} */
  id: string;
  /** 最后更新时间 */
  lastUpdatedAt: string;
  /** 数据列表 */
  data: ApiDataItem[];
}

/**
 * 历史记录项
 */
export interface HistoryItem {
  /** 日期 */
  date: string;
  /** URI 路径 */
  uri: string;
}

/**
 * History.json 响应格式
 */
export interface HistoryResponse {
  /** ID 格式: {provider-id}.history */
  id: string;
  /** 历史记录列表 */
  history: HistoryItem[];
}

/**
 * 历史详情响应格式
 */
export interface HistoryDetailResponse {
  /** ID 格式: {provider-id}.history.{date} */
  id: string;
  /** 创建时间 */
  createdAt: string;
  /** 数据列表 */
  data: {
    /** 数据 ID */
    id: string;
    /** 最后更新时间 */
    lastUpdatedAt: string;
    /** 数据项 */
    data: ApiDataItem[];
  }[];
}

/**
 * 平台到 Provider ID 的映射
 */
export const PLATFORM_TO_PROVIDER_ID: Record<Platform, string> = {
  zhihu: 'zhihu-hot-questions',
  weibo: 'weibo-top-search',
  sougou: 'sougou-hot',
  github: 'github-trending',
  baidu: 'baidu-hot-search',
  douyin: 'douyin-hot',
  bilibili: 'bilibili-hot',
  v2ex: 'v2ex-hot',
  hackernews: 'hackernews-top',
  toutiao: 'toutiao-hot',
  csdn: 'csdn-hot',
  ithome: 'ithome-hot',
  sspai: 'sspai-hot',
  acfun: 'acfun-hot',
  anquanke: 'anquanke-hot',
  hupu: 'hupu-hot',
  kr36: 'kr36-hot',
  wuaipojie: 'wuaipojie-hot',
  smzdm: 'smzdm-hot',
  tieba: 'tieba-hot',
  qqnews: 'qqnews-hot',
  douban: 'douban-group-hot',
  so: '360search-hot',
  yiche: 'yiche-hot',
  dongqiudi: 'dongqiudi-hot',
  youxiputao: 'youxiputao-hot',
};

/**
 * Provider ID 到平台的映射
 */
export const PROVIDER_ID_TO_PLATFORM: Record<string, Platform> = {
  'zhihu-hot-questions': 'zhihu',
  'weibo-top-search': 'weibo',
  'github-trending': 'github',
  'baidu-hot-search': 'baidu',
  'douyin-hot': 'douyin',
  'bilibili-hot': 'bilibili',
  'v2ex-hot': 'v2ex',
  'hackernews-top': 'hackernews',
  'toutiao-hot': 'toutiao',
  'csdn-hot': 'csdn',
  'ithome-hot': 'ithome',
  'sspai-hot': 'sspai',
  'acfun-hot': 'acfun',
  'anquanke-hot': 'anquanke',
  'hupu-hot': 'hupu',
  'kr36-hot': 'kr36',
  'wuaipojie-hot': 'wuaipojie',
  'smzdm-hot': 'smzdm',
  'tieba-hot': 'tieba',
  'qqnews-hot': 'qqnews',
  'douban-group-hot': 'douban',
  '360search-hot': 'so',
  'yiche-hot': 'yiche',
  'dongqiudi-hot': 'dongqiudi',
  'youxiputao-hot': 'youxiputao',
};
