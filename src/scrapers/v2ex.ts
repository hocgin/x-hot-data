import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class V2exScraper extends BaseScraper {
  readonly platform = 'v2ex' as const;
  readonly displayName = 'V2EX';
  readonly baseUrl = 'https://www.v2ex.com';
  readonly apiEndpoint = '/?tab=hot';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items: TrendingItem[] = [];

    // V2EX 的列表项结构
    $('.item_hot_topic_title').each((_index, element) => {
      const $title = $(element);
      const $a = $title.find('a');
      const href = $a.attr('href');
      const title = $a.text().trim();
      
      // 查找父级 cell，再找对应的其他信息
      // 结构通常是: table -> tr -> td (avatar) + td (title/meta) + td (reply count)
      const $cell = $title.closest('.cell');
      
      // 回复数
      const $count = $cell.find('.count_livid');
      const replyCount = $count.text().trim();
      
      // 头像
      const $avatar = $cell.find('.avatar');
      const cover = $avatar.attr('src');
      
      // 节点/分类
      const $node = $cell.find('.node');
      const category = $node.text().trim();

      if (title && href) {
        // href 包含类似 /t/123456#reply12，需要提取 ID
        const idMatch = href.match(/\/t\/(\d+)/);
        const id = idMatch ? idMatch[1] : href;

        items.push({
          id,
          title,
          url: `${this.baseUrl}${href}`,
          hot: parseInt(replyCount) || 0,
          hotText: replyCount ? `${replyCount}回复` : undefined,
          category,
          cover,
          timestamp: Date.now(),
          source: this.platform,
        });
      }
    });

    return items;
  }
}
