/**
 * 开发模式入口文件
 */

import { ZhihuScraper } from './src/scrapers/zhihu.ts';
import { WeiboScraper } from './src/scrapers/weibo.ts';
import { BilibiliScraper } from './src/scrapers/bilibili.ts';
import { DouyinScraper } from './src/scrapers/douyin.ts';
import { ToutiaoScraper } from './src/scrapers/toutiao.ts';
import { CsdnScraper } from './src/scrapers/csdn.ts';
import { IthomeScraper } from './src/scrapers/ithome.ts';
import { SspaiScraper } from './src/scrapers/sspai.ts';
import { SchedulerService } from './src/services/scheduler.ts';
import { StorageService } from './src/utils/storage.ts';
import { ApiService } from './src/services/api.ts';
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
      case 'ithome':
        scrapers.push(new IthomeScraper());
        break;
      case 'sspai':
        scrapers.push(new SspaiScraper());
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

  logger.debug(`已注册平台: ${scheduler.getRegisteredPlatforms().join(', ')}`);

  // 只执行一次爬取，获取 Map 格式数据
  const platformsData = await scheduler.fetchAllAsMap();

  // 调试输出
  for (const [platform, items] of platformsData.entries()) {
    if (items && items.length > 0) {
      logger.debug(`${platform} 获取到 ${items.length} 条数据`);
      // 输出前 3 条
      items.slice(0, 3).forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.title} (${item.hotText || item.hot || 'N/A'})`);
      });
    }
  }

  // 统计信息
  const totalItems = Array.from(platformsData.values()).reduce((sum, items) => sum + items.length, 0);
  const successCount = platformsData.size;

  // 保存数据
  const today = dayjs().format('YYYY-MM-DD');

  // 保存到 data 目录（原始数据）
  await storage.saveDailyData(today, platformsData);
  logger.success(`原始数据已保存到 data/${today}/ 目录`);

  // 保存到 api 目录（API 格式）
  await apiService.generateAllApiData(platformsData, today);
  logger.success(`API 数据已生成到 api/ 目录`);

  // 输出统计信息
  console.log('\n' + '='.repeat(60));
  console.log(`获取完成: ${totalItems} 条数据`);
  console.log(`成功: ${successCount} 个平台`);
  console.log('='.repeat(60));
}

// 运行主函数
if (import.meta.main) {
  devMain().catch((error) => {
    logger.error('程序异常退出', error);
    Deno.exit(1);
  });
}
