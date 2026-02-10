import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import * as cheerio from 'npm:cheerio';

export class DongqiudiScraper extends BaseScraper {
  readonly platform = 'dongqiudi' as const;
  readonly displayName = '懂球帝';
  readonly baseUrl = 'https://www.dongqiudi.com';
  readonly apiEndpoint = '/';
  protected override readonly timeout = 15000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const response = await this.fetchWithRetry(this.baseUrl);
    const html = await response.text();

    const items: TrendingItem[] = [];

    // 尝试从 Nuxt 数据中提取
    // 格式: "Title","https://n.dongqiudi.com/webapp/news.html?articleId=..."
    // 我们使用正则全局匹配这种模式
    const pattern =
      /"([^"]+)","(https:\\u002F\\u002Fn\.dongqiudi\.com\\u002Fwebapp\\u002Fnews\.html\?articleId=(\d+)[^"]*)"/g;
    let match;

    // 用于去重
    const seenIds = new Set<string>();

    while ((match = pattern.exec(html)) !== null) {
      const [_, title, urlRaw, id] = match;

      // 过滤无效标题（如图片链接）
      if (title.includes('\\u002F') || title.startsWith('http') || title.length < 5) {
        continue;
      }

      if (seenIds.has(id)) continue;
      seenIds.add(id);

      // 构建 PC 端 URL
      const url = `https://www.dongqiudi.com/article/${id}`;

      items.push({
        id,
        title,
        url,
        timestamp: Date.now(),
        source: this.platform,
      });
    }

    return items;
  }
}
