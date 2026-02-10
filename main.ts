/**
 * 主入口文件
 */

import { ZhihuScraper } from './src/scrapers/zhihu.ts';
import { WeiboScraper } from './src/scrapers/weibo.ts';
import { BilibiliScraper } from './src/scrapers/bilibili.ts';
import { DouyinScraper } from './src/scrapers/douyin.ts';
import { ToutiaoScraper } from './src/scrapers/toutiao.ts';
import { CsdnScraper } from './src/scrapers/csdn.ts';
import { SchedulerService } from './src/services/scheduler.ts';
import { StorageService } from './src/utils/storage.ts';
import { ApiService } from './src/services/api.ts';
import { logger } from './src/utils/logger.ts';
import { getEnabledPlatforms } from './src/config/platforms.ts';
import type { BaseScraper } from './src/scrapers/base.ts';
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
      case 'bilibili':
        scrapers.push(new BilibiliScraper());
        break;
      case 'douyin':
        scrapers.push(new DouyinScraper());
        break;
      case 'toutiao':
        scrapers.push(new ToutiaoScraper());
        break;
      case 'csdn':
        scrapers.push(new CsdnScraper());
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
  const apiService = new ApiService();

  // 获取数据
  const today = dayjs().format('YYYY-MM-DD');
  const platformsData = await scheduler.fetchAllAsMap();

  // 计算统计信息
  const items = Array.from(platformsData.values()).flat();
  const totalItems = items.length;
  const successCount = platformsData.size;
  const failedCount = scrapers.length - successCount;

  // 保存到 data 目录（原始数据）
  await storage.saveDailyData(today, platformsData);
  logger.success(`原始数据已保存到 data/${today}/ 目录`);

  // 保存到 api 目录（API 格式）
  await apiService.generateAllApiData(platformsData, today);
  logger.success(`API 数据已生成到 api/ 目录`);

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log(`获取完成: ${totalItems} 条数据`);
  console.log(`成功: ${successCount} | 失败: ${failedCount}`);
  console.log('='.repeat(60));

  // 如果有失败的平台，返回错误码
  if (failedCount > 0) {
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
