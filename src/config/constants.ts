/**
 * 全局常量配置
 */

/** 数据存储基础路径 */
export const DATA_BASE_PATH = './data';

/** 日志级别 */
export enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
}

/** 最大重试次数 */
export const MAX_RETRIES = 3;

/** 重试延迟基数（毫秒） */
export const RETRY_DELAY_BASE = 1000;

/** 并发请求数量 */
export const CONCURRENT_REQUESTS = 5;

/** 请求超时时间（毫秒） */
export const REQUEST_TIMEOUT = 10000;

/** 数据保留天数 */
export const DATA_RETENTION_DAYS = 90;

/** 日期格式 */
export const DATE_FORMAT = 'YYYY-MM-DD';

/** 时间格式 */
export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/** 默认请求头 */
export const DEFAULT_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
};
