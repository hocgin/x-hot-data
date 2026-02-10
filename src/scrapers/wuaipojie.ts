import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class WuaipojieScraper extends BaseScraper {
  readonly platform = 'wuaipojie' as const;
  readonly displayName = '吾爱破解';
  readonly baseUrl = 'https://www.52pojie.cn';
  readonly apiEndpoint = '/misc.php?mod=ranklist&type=thread&view=heats&orderby=today';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder('gbk');
    const html = decoder.decode(buffer);
    const $ = cheerio.load(html);

    const items: TrendingItem[] = [];

    // Discuz! 排行榜页面结构通常是表格
    // 查找包含 ranklist 的表格行
    // 尝试更通用的选择器，因为 .bm_c 可能不存在或者结构不同

    // 直接查找所有包含 thread 链接的 th
    $('tr').each((_index, element) => {
      const $row = $(element);
      const $th = $row.find('th');
      const $a = $th.find('a[href^="thread"]').first();

      if ($a.length > 0) {
        const title = $a.text().trim();
        let href = $a.attr('href');

        if (title && href) {
          // 处理相对路径
          if (!href.startsWith('http')) {
            href = `${this.baseUrl}/${href}`;
          }

          // 排除不需要的链接（如果有的话）

          items.push({
            id: href,
            title,
            url: href,
            hot: items.length + 1,
            hotText: `Top ${items.length + 1}`,
            timestamp: Date.now(),
            source: this.platform,
          });
        }
      }
    });

    return items;
  }
}
