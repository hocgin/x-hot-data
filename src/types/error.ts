/**
 * 错误类型定义
 */

/**
 * 爬虫错误类型
 */
export enum ScraperErrorType {
  /** 网络错误 */
  NetworkError = 'NetworkError',
  /** 解析错误 */
  ParseError = 'ParseError',
  /** 验证错误 */
  ValidationError = 'ValidationError',
  /** 限流错误 */
  RateLimitError = 'RateLimitError',
  /** 未知错误 */
  UnknownError = 'UnknownError',
}

/**
 * 自定义错误类
 */
export class ScraperError extends Error {
  constructor(
    public type: ScraperErrorType,
    message: string,
    public platform?: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'ScraperError';
  }
}

/**
 * 网络错误
 */
export class NetworkError extends ScraperError {
  constructor(platform: string, originalError?: unknown) {
    super(
      ScraperErrorType.NetworkError,
      `网络请求失败: ${platform}`,
      platform,
      originalError,
    );
    this.name = 'NetworkError';
  }
}

/**
 * 解析错误
 */
export class ParseError extends ScraperError {
  constructor(platform: string, message: string, originalError?: unknown) {
    super(
      ScraperErrorType.ParseError,
      `数据解析失败: ${platform} - ${message}`,
      platform,
      originalError,
    );
    this.name = 'ParseError';
  }
}

/**
 * 验证错误
 */
export class ValidationError extends ScraperError {
  constructor(platform: string, message: string) {
    super(
      ScraperErrorType.ValidationError,
      `数据验证失败: ${platform} - ${message}`,
      platform,
    );
    this.name = 'ValidationError';
  }
}

/**
 * 限流错误
 */
export class RateLimitError extends ScraperError {
  constructor(platform: string) {
    super(
      ScraperErrorType.RateLimitError,
      `请求被限流: ${platform}`,
      platform,
    );
    this.name = 'RateLimitError';
  }
}
