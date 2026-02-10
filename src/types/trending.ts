/**
 * 热门话题数据类型定义
 */

/**
 * 单个热门话题项
 */
export interface TrendingItem {
  /** 唯一标识 */
  id: string;
  /** 标题 */
  title: string;
  /** 链接地址 */
  url?: string;
  /** 热度值 */
  hot?: number;
  /** 热度文本描述（如"100万+热"） */
  hotText?: string;
  /** 分类 */
  category?: string;
  /** 标签 */
  tags?: string[];
  /** 描述 */
  description?: string;
  /** 封面图 */
  cover?: string;
  /** 作者 */
  author?: string;
  /** 时间戳 */
  timestamp: number;
  /** 数据来源平台 */
  source: Platform;
}

/**
 * 支持的平台类型
 */
export type Platform =
  | 'zhihu'
  | 'weibo'
  | 'github'
  | 'baidu'
  | 'douyin'
  | 'bilibili'
  | 'v2ex'
  | 'hackernews'
  | 'toutiao'
  | 'csdn'
  | 'ithome'
  | 'sspai'
  | 'acfun'
  | 'anquanke'
  | 'hupu'
  | 'kr36'
  | 'douban'
  | 'so'
  | 'wuaipojie'
  | 'smzdm'
  | 'tieba'
  | 'qqnews'
  | 'yiche';

/**
 * 每日数据集合
 */
export interface DailyData {
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 各平台数据 */
  data: Record<Platform, TrendingItem[]>;
  /** 更新时间戳 */
  updatedAt: number;
}

/**
 * 单个平台数据
 */
export interface PlatformData {
  /** 平台名称 */
  platform: Platform;
  /** 热门话题列表 */
  items: TrendingItem[];
  /** 获取时间戳 */
  fetchedAt: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 数据爬取结果
 */
export interface FetchResult {
  /** 各平台数据 */
  platforms: PlatformData[];
  /** 总数据量 */
  totalItems: number;
  /** 成功数量 */
  successCount: number;
  /** 失败数量 */
  failedCount: number;
  /** 耗时（毫秒） */
  duration: number;
}
