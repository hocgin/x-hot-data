import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class SmzdmScraper extends BaseScraper {
  readonly platform = 'smzdm' as const;
  readonly displayName = '什么值得买';
  readonly baseUrl = 'https://www.smzdm.com';
  readonly apiEndpoint = '/top/';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const items: TrendingItem[] = [];
    const uniqueIds = new Set<string>();

    $('.feed-hot-card').each((_index, element) => {
      const $card = $(element);
      const $a = $card.find('a').first();

      const title = $card.find('.feed-hot-title').text().trim();
      const href = $a.attr('href');
      const cover = $card.find('.feed-hot-pic img').attr('src');
      const highlight = $card.find('.z-highlight').text().trim();

      if (title && href && !uniqueIds.has(href)) {
        uniqueIds.add(href);
        items.push({
          id: href,
          title,
          url: href,
          hot: items.length + 1,
          hotText: highlight || undefined,
          cover,
          timestamp: Date.now(),
          source: this.platform,
        });
      }
    });

    return items;
  }
}
