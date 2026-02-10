import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class IthomeScraper extends BaseScraper {
  readonly platform = 'ithome' as const;
  readonly displayName = 'IT之家';
  readonly baseUrl = 'https://m.ithome.com';
  readonly apiEndpoint = '/rankm/';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const items: TrendingItem[] = [];

    // 根据文档和常见结构解析
    // 假设结构为列表项
    $('.rank-box .placeholder').each((index, element) => {
      const $element = $(element);
      const $link = $element.find('a').first();
      const href = $link.attr('href');
      const title = $element.find('.plc-title').text().trim();
      const timeText = $element.find('.post-time').text().trim(); // 可能有时间
      
      if (title && href) {
        items.push({
          id: href,
          title,
          url: href, // 通常 href 是完整的或相对的，如果是相对的需要拼接
          hot: index + 1, // 使用排名作为热度
          hotText: `第${index + 1}名`,
          timestamp: Date.now(),
          source: this.platform,
        });
      }
    });

    // 如果上面的选择器不对，尝试更通用的
    if (items.length === 0) {
       // 备用选择器逻辑，基于 CLAUDE.md 的描述
       // <a href="..."><p class="plc-title">标题</p></a>
       $('a').each((_index, element) => {
         const $element = $(element);
         const $title = $element.find('.plc-title');
         if ($title.length > 0) {
           const title = $title.text().trim();
           const href = $element.attr('href');
           if (title && href) {
             items.push({
               id: href,
               title,
               url: href,
               timestamp: Date.now(),
               source: this.platform,
             });
           }
         }
       });
       
       // 重新排序并添加热度
       items.forEach((item, index) => {
         item.hot = index + 1;
         item.hotText = `第${index + 1}名`;
       });
    }

    return items;
  }
}
