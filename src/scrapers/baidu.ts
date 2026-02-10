import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12';

export class BaiduScraper extends BaseScraper {
  readonly platform = 'baidu' as const;
  readonly displayName = '百度热搜';
  readonly baseUrl = 'https://top.baidu.com';
  readonly apiEndpoint = '/board?tab=realtime';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const items: TrendingItem[] = [];

    // 百度热搜的列表项类名通常是随机生成的，但前缀或结构可能固定
    // 根据之前的分析，列表项包含 .category-wrap_iQLoo
    // 标题在 .c-single-text-ellipsis 中
    // 热度在 .hot-index_1Bl1a 中

    // 尝试查找包含特定结构的容器
    // 由于类名可能变化，尝试使用更通用的选择器
    // 比如查找包含 "热搜指数" 的父元素

    // 如果类名是固定的（根据之前的 curl 输出）
    $('.category-wrap_iQLoo').each((_index, element) => {
      const $item = $(element);

      const $titleElement = $item.find('.c-single-text-ellipsis');
      const title = $titleElement.text().trim();

      const $link = $item.find('a.title_dIF3B');
      const href = $link.attr('href');

      const $hotElement = $item.find('.hot-index_1Bl1a');
      const hotText = $hotElement.text().trim();

      const $descElement = $item.find('.hot-desc_1m_jR.large_nSuFU');
      const description = $descElement.text().replace('查看更多>', '').trim();

      const $imgElement = $item.find('.img-wrapper_29V76 img');
      const cover = $imgElement.attr('src');

      if (title && href) {
        items.push({
          id: title, // 百度热搜通常没有固定 ID，用标题作为 ID
          title,
          url: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
          hot: parseInt(hotText.replace(/,/g, '')) || 0,
          hotText,
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
