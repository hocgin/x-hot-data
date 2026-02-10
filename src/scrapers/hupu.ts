import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class HupuScraper extends BaseScraper {
  readonly platform = 'hupu' as const;
  readonly displayName = '虎扑';
  readonly baseUrl = 'https://www.hupu.com';
  readonly apiEndpoint = '/';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const response = await this.fetchWithRetry(this.baseUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    const items: TrendingItem[] = [];

    // 查找包含“步行街热榜”的区域
    $('.hot-search').each((_index, element) => {
      const $element = $(element);
      const title = $element.find('.hot-search-title').text().trim();
      
      // 我们优先获取“步行街热榜”，如果没有，也可以获取“篮球热榜”等
      if (title.includes('步行街') || title.includes('热榜')) {
        const $items = $element.find('.itemListA a');
        
        $items.each((itemIndex, item) => {
           const $item = $(item);
           const href = $item.attr('href');
           // 尝试解析结构：<div><div>1</div><div>标题</div></div>
           // 或者直接取文本
           
           // 获取所有子 div
           const $divs = $item.children('div').children('div');
           let itemTitle = '';
           let rank = 0;
           
           if ($divs.length >= 2) {
             const rankText = $divs.eq(0).text().trim();
             itemTitle = $divs.eq(1).text().trim();
             rank = parseInt(rankText) || (itemIndex + 1);
           } else {
             // 降级处理：直接获取文本
             itemTitle = $item.text().trim();
             // 尝试去除可能的排名前缀
             const match = itemTitle.match(/^(\d+)\s*(.*)/);
             if (match) {
               rank = parseInt(match[1]);
               itemTitle = match[2];
             } else {
               rank = itemIndex + 1;
             }
           }

           if (href && itemTitle && !items.some(i => i.id === href)) {
             items.push({
               id: href,
               title: itemTitle,
               url: href,
               hot: rank,
               hotText: `Top ${rank}`,
               timestamp: Date.now(),
               source: this.platform,
             });
           }
        });
      }
    });

    // 如果仍然为空，尝试之前的宽泛搜索作为后备
    if (items.length === 0) {
        // ... (保留之前的逻辑或简化)
        $('a').each((_index, element) => {
             // ... 之前的逻辑 ...
             const $element = $(element);
             const $children = $element.children('div');
             if ($children.length === 1 && $children.children('div').length >= 2) {
                 // 有时候是 a > div > div + div
                 const $innerDivs = $children.children('div');
                 const firstText = $innerDivs.eq(0).text().trim();
                 const secondText = $innerDivs.eq(1).text().trim();
                 if (/^\d+$/.test(firstText) && secondText) {
                    const href = $element.attr('href');
                    if (href && !items.some(i => i.id === href)) {
                         items.push({
                           id: href,
                           title: secondText,
                           url: href,
                           hot: parseInt(firstText),
                           hotText: `Top ${firstText}`,
                           timestamp: Date.now(),
                           source: this.platform,
                         });
                    }
                 }
             }
        });
    }

    return items;
  }
}
