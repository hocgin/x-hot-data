/**
 * 主入口文件
 */

import { ZhihuScraper } from './src/scrapers/zhihu.ts';
import { WeiboScraper } from './src/scrapers/weibo.ts';
import { SchedulerService } from './src/services/scheduler.ts';
import { StorageService } from './src/utils/storage.ts';
import { logger } from './src/utils/logger.ts';
import { getEnabledPlatforms } from './src/config/platforms.ts';
import dayjs from 'dayjs';

/**
 * 主函数
 */
async function main() {
  logger.info('开始获取热门数据');

  // 初始化爬虫实例
  const scrapers: BaseScraper[] = [];
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

  // 获取数据
  const result = await scheduler.fetchAll();

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

  // 如果有失败的平台，返回错误码
  if (result.failedCount > 0) {
    Deno.exit(1);
  }
}

// 运行主函数
if (import.meta.main) {
  main().catch((error) => {
    logger.error('程序异常退出', error);
    Deno.exit(1);
  });
}
