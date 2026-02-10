import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class DoubanScraper extends BaseScraper {
  readonly platform = 'douban' as const;
  readonly displayName = '豆瓣小组';
  readonly baseUrl = 'https://www.douban.com';
  readonly apiEndpoint = '/group/explore';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const items: TrendingItem[] = [];

    $('.channel-item').each((_index, element) => {
      const $item = $(element);
      const $bd = $item.find('.bd');
      const $a = $bd.find('h3 a');

      const title = $a.text().trim();
      const href = $a.attr('href');
      const likes = $item.find('.likes').text().replace('喜欢', '').trim();
      const description = $bd.find('.block p').text().trim();
      const cover = $bd.find('.pic img').attr('src');

      if (title && href) {
        items.push({
          id: href,
          title,
          url: href,
          hot: parseInt(likes) || 0,
          hotText: likes ? `${likes}喜欢` : undefined,
          description,
          cover,
          timestamp: Date.now(),
          source: this.platform,
        });
      }
    });

    return items;
  }
}
