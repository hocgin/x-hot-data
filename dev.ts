/**
 * 开发模式入口文件
 */

import { ZhihuScraper } from './src/scrapers/zhihu.ts';
import { WeiboScraper } from './src/scrapers/weibo.ts';
import { SchedulerService } from './src/services/scheduler.ts';
import { StorageService } from './src/utils/storage.ts';
import { logger, LogLevel } from './src/utils/logger.ts';
import { getEnabledPlatforms } from './src/config/platforms.ts';
import dayjs from 'dayjs';

// 开发模式设置日志级别
logger.setLevel(LogLevel.Debug);

/**
 * 开发模式主函数
 */
async function devMain() {
  logger.info('开发模式：开始获取热门数据');

  // 初始化爬虫实例
  const scrapers: any[] = [];
  const enabledPlatforms = getEnabledPlatforms();

  for (const platform of enabledPlatforms) {
    switch (platform) {
      case 'zhihu':
        scrapers.push(new ZhihuScraper());
        break;
      case 'weibo':
        scrapers.push(new WeiboScraper());
        break;
      // 添加更多平台的爬虫
      default:
        logger.warn(`未实现 ${platform} 平台的爬虫`);
    }
  }

  if (scrapers.length === 0) {
    logger.error('没有可用的爬虫，请检查配置');
    Deno.exit(1);
  }

  // 初始化服务
  const scheduler = new SchedulerService(scrapers);
  const storage = new StorageService();

  logger.debug(`已注册平台: ${scheduler.getRegisteredPlatforms().join(', ')}`);

  // 获取数据
  const result = await scheduler.fetchAll();

  // 调试输出
  for (const platformData of result.platforms) {
    if (platformData.success && platformData.items.length > 0) {
      logger.debug(`${platformData.platform} 获取到 ${platformData.items.length} 条数据`);
      // 输出前 3 条
      platformData.items.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.hotText || item.hot || 'N/A'})`);
      });
    }
  }

  // 保存数据
  const today = dayjs().format('YYYY-MM-DD');
  const platformsData = await scheduler.fetchAllAsMap();

  await storage.saveDailyData(today, platformsData);
  logger.success(`数据已保存到 ${today}/ 目录`);

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log(`获取完成: ${result.totalItems} 条数据`);
  console.log(`成功: ${result.successCount} | 失败: ${result.failedCount}`);
  console.log(`耗时: ${result.duration}ms`);
  console.log('='.repeat(60));
}

// 运行主函数
if (import.meta.main) {
  devMain().catch((error) => {
    logger.error('程序异常退出', error);
    Deno.exit(1);
  });
}
