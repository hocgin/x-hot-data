/**
 * 日志工具类
 */

import chalk from 'chalk';
import { LogLevel } from '../config/constants.ts';

/**
 * 日志服务类
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(level: LogLevel = LogLevel.Info, prefix: string = '') {
    this.level = level;
    this.prefix = prefix;
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 设置前缀
   */
  setPrefix(prefix: string): void {
    this.prefix = prefix;
  }

  /**
   * 获取时间戳
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  /**
   * 格式化日志消息
   */
  private format(level: string, message: string): string {
    const timestamp = this.getTimestamp();
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    return `${timestamp} ${prefix}[${level}] ${message}`;
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Debug)) {
      console.log(chalk.gray(this.format('DEBUG', message)), ...args);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Info)) {
      console.log(chalk.blue(this.format('INFO', message)), ...args);
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Warn)) {
      console.warn(chalk.yellow(this.format('WARN', message)), ...args);
    }
  }

  /**
   * 错误日志
   */
  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.Error)) {
      console.error(chalk.red(this.format('ERROR', message)));
      if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
        if (error.stack) {
          console.error(chalk.gray(`  ${error.stack.split('\n').slice(1).join('\n')}`));
        }
      } else if (error) {
        console.error(chalk.red(`  ${String(error)}`));
      }
    }
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Info)) {
      console.log(chalk.green(this.format('SUCCESS', message)), ...args);
    }
  }

  /**
   * 判断是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  /**
   * 创建子日志器
   */
  child(prefix: string): Logger {
    return new Logger(this.level, this.prefix ? `${this.prefix}:${prefix}` : prefix);
  }
}

/**
 * 全局日志实例
 */
export const logger = new Logger();
