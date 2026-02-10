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
    enabled: false,  // 暂时禁用，需要 Cookie 验证
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
    displayName: '百度热搜',
    baseUrl: 'https://top.baidu.com',
    apiEndpoint: '/board?tab=realtime',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  so: {
    name: 'so',
    displayName: '360搜索',
    baseUrl: 'https://trends.so.com',
    apiEndpoint: '/top/realtime',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  bilibili: {
    name: 'bilibili',
    displayName: 'B站',
    baseUrl: 'https://api.bilibili.com',
    apiEndpoint: '/x/web-interface/hot',
    enabled: false,  // 暂时禁用，触发风控策略
    timeout: 15000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  douyin: {
    name: 'douyin',
    displayName: '抖音',
    baseUrl: 'https://www.douyin.com',
    apiEndpoint: '/aweme/v1/web/search/item/general/',
    enabled: false,  // 暂时禁用，需要复杂的 Token 验证
    timeout: 15000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  v2ex: {
    name: 'v2ex',
    displayName: 'V2EX',
    baseUrl: 'https://www.v2ex.com',
    apiEndpoint: '/?tab=hot',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  hackernews: {
    name: 'hackernews',
    displayName: 'Hacker News',
    baseUrl: 'https://news.ycombinator.com',
    apiEndpoint: 'https://hacker-news.firebaseio.com/v0/topstories.json',
    enabled: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  ithome: {
    name: 'ithome',
    displayName: 'IT之家',
    baseUrl: 'https://m.ithome.com',
    apiEndpoint: '/rankm/',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
  },
  sspai: {
    name: 'sspai',
    displayName: '少数派',
    baseUrl: 'https://sspai.com',
    apiEndpoint: '/api/v1/article/tag/page/get?limit=100000&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  acfun: {
    name: 'acfun',
    displayName: 'AcFun',
    baseUrl: 'https://www.acfun.cn',
    apiEndpoint: '/rest/pc-direct/rank/channel?channelId=&subChannelId=&rankLimit=30&rankPeriod=DAY',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  anquanke: {
    name: 'anquanke',
    displayName: '安全客',
    baseUrl: 'https://www.anquanke.com',
    apiEndpoint: '/webapi/api/index/top/list?page=1',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  hupu: {
    name: 'hupu',
    displayName: '虎扑',
    baseUrl: 'https://www.hupu.com',
    apiEndpoint: '/',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  wuaipojie: {
    name: 'wuaipojie',
    displayName: '吾爱破解',
    baseUrl: 'https://www.52pojie.cn',
    apiEndpoint: '/misc.php?mod=ranklist&type=thread&view=heats&orderby=today',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  smzdm: {
    name: 'smzdm',
    displayName: '什么值得买',
    baseUrl: 'https://www.smzdm.com',
    apiEndpoint: '/top/',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
  },
  tieba: {
    name: 'tieba',
    displayName: '贴吧',
    baseUrl: 'https://tieba.baidu.com',
    apiEndpoint: '/hottopic/browse/topicList',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  qqnews: {
    name: 'qqnews',
    displayName: '腾讯新闻',
    baseUrl: 'https://r.inews.qq.com',
    apiEndpoint: '/gw/event/hot_ranking_list?ids_hash=&offset=0&page_id=1&page_size=50',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  douban: {
    name: 'douban',
    displayName: '豆瓣小组',
    baseUrl: 'https://www.douban.com',
    apiEndpoint: '/group/explore',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  toutiao: {
    name: 'toutiao',
    displayName: '今日头条',
    baseUrl: 'https://www.toutiao.com',
    apiEndpoint: '/hot-event/hot-board/?origin=toutiao_pc',
    enabled: true,
    timeout: 15000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  csdn: {
    name: 'csdn',
    displayName: 'CSDN',
    baseUrl: 'https://blog.csdn.net',
    apiEndpoint: '/phoenix/web/blog/hotRank',
    enabled: true,
    timeout: 15000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  yiche: {
    name: 'yiche',
    displayName: '易车',
    baseUrl: 'https://car.yiche.com',
    apiEndpoint: '/hotrank/',
    enabled: true,
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
  kr36: {
    name: 'kr36',
    displayName: '36氪',
    baseUrl: 'https://36kr.com',
    apiEndpoint: '/hot-list/renqi',
    enabled: false,  // 需要动态日期，暂时禁用
    timeout: 10000,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1',
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
