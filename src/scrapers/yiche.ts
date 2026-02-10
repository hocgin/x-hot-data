import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

export class YicheScraper extends BaseScraper {
  readonly platform = 'yiche' as const;
  readonly displayName = '易车';
  readonly baseUrl = 'https://car.yiche.com';
  readonly apiEndpoint = '/hotrank/';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const text = await response.text();

    const items: TrendingItem[] = [];
    const itemRegex =
      /<div class="rk-item ka"[\s\S]*?data-spell="([^"]+)"[\s\S]*?<span class="rk-xuhao">(\d+)<\/span>[\s\S]*?<div class="rk-car-name">([^<]+)<\/div>[\s\S]*?<div class="rk-car-price">([^<]+)<\/div>[\s\S]*?<span class="rk-car-num">([^<]+)<\/span>/g;

    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const [_, spell, rankStr, name, price, hotStr] = match;
      const rank = parseInt(rankStr);

      // 处理热度 "13.50万" -> 135000
      let hot = 0;
      if (hotStr.includes('万')) {
        hot = parseFloat(hotStr.replace('万', '')) * 10000;
      } else {
        hot = parseFloat(hotStr);
      }

      items.push({
        id: spell,
        title: name,
        url: `${this.baseUrl}/${spell}/`,
        hot,
        hotText: hotStr,
        description: `价格: ${price}`,
        timestamp: Date.now(),
        source: this.platform,
        cover: undefined, // 图片提取比较复杂，暂时跳过
      });
    }

    return items;
  }
}
