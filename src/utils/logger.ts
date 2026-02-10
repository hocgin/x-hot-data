/**
 * 日志工具类
 */

import chalk from 'chalk';
import { LogLevel } from '../config/constants.ts';
import { ensureDir } from 'jsr:@std/fs';

// 重新导出 LogLevel 以便其他模块使用
export { LogLevel };

/** 日志文件路径 */
const LOG_FILE_PATH = './app.log';

/**
 * 日志服务类
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;
  private logFilePath: string;

  constructor(
    level: LogLevel = LogLevel.Info,
    prefix: string = '',
    logFilePath: string = LOG_FILE_PATH
  ) {
    this.level = level;
    this.prefix = prefix;
    this.logFilePath = logFilePath;
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
   * 写入日志文件
   */
  private async writeToFile(message: string): Promise<void> {
    try {
      await ensureDir('./');
      await Deno.writeTextFile(
        this.logFilePath,
        message + '\n',
        { append: true }
      );
    } catch (error) {
      // 文件写入失败不影响程序运行
      // 避免递归调用 logger
      console.error(`写入日志文件失败: ${error}`);
    }
  }

  /**
   * 调试日志
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Debug)) {
      const formatted = this.format('DEBUG', message);
      console.log(chalk.gray(formatted), ...args);
      this.writeToFile(formatted + (args.length > 0 ? ' ' + args.map(String).join(' ') : ''));
    }
  }

  /**
   * 信息日志
   */
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Info)) {
      const formatted = this.format('INFO', message);
      console.log(chalk.blue(formatted), ...args);
      this.writeToFile(formatted + (args.length > 0 ? ' ' + args.map(String).join(' ') : ''));
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Warn)) {
      const formatted = this.format('WARN', message);
      console.warn(chalk.yellow(formatted), ...args);
      this.writeToFile(formatted + (args.length > 0 ? ' ' + args.map(String).join(' ') : ''));
    }
  }

  /**
   * 错误日志
   */
  error(message: string, error?: unknown): void {
    if (this.shouldLog(LogLevel.Error)) {
      const formatted = this.format('ERROR', message);
      console.error(chalk.red(formatted));
      let logMessage = formatted;

      if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
        logMessage += '\n  ' + error.message;
        if (error.stack) {
          const stackTrace = error.stack.split('\n').slice(1).join('\n');
          console.error(chalk.gray(`  ${stackTrace}`));
          logMessage += '\n  ' + stackTrace;
        }
      } else if (error) {
        console.error(chalk.red(`  ${String(error)}`));
        logMessage += '\n  ' + String(error);
      }

      this.writeToFile(logMessage);
    }
  }

  /**
   * 成功日志
   */
  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.Info)) {
      const formatted = this.format('SUCCESS', message);
      console.log(chalk.green(formatted), ...args);
      this.writeToFile(formatted + (args.length > 0 ? ' ' + args.map(String).join(' ') : ''));
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
    return new Logger(this.level, this.prefix ? `${this.prefix}:${prefix}` : prefix, this.logFilePath);
  }
}

/**
 * 全局日志实例
 */
export const logger = new Logger();
