import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

export class GithubScraper extends BaseScraper {
  readonly platform = 'github' as const;
  readonly displayName = 'GitHub';
  readonly baseUrl = 'https://github.com';
  readonly apiEndpoint = '/trending';
  protected override readonly timeout = 15000;
  private log = logger.child('GithubScraper');

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    this.log.debug(`开始获取 GitHub 热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': this.baseUrl,
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条 GitHub 热榜数据`);
      return items;
    } catch (error) {
      this.log.error('GitHub 热榜数据获取失败', error);
      return [];
    }
  }

  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // Split by article tag to process each item independently
    const articles = html.split('<article class="Box-row">');
    // Remove the first part which is before the first article
    articles.shift();

    let index = 0;
    for (const article of articles) {
      // Extract URL and Title
      // <a href="/KeygraphHQ/shannon" ...>
      const urlMatch = article.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"/);
      const urlPath = urlMatch ? urlMatch[1] : null;

      // Extract Description
      // <p class="col-9 color-fg-muted my-1 pr-4">
      const descMatch = article.match(/<p\s+class="col-9 color-fg-muted my-1 pr-4">\s*([\s\S]*?)\s*<\/p>/);
      const description = descMatch ? descMatch[1].trim() : undefined;

      if (urlPath) {
        // Remove leading slash if present
        const cleanPath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath;
        const title = cleanPath; // owner/repo
        const url = `${this.baseUrl}/${cleanPath}`;

        items.push({
          id: this.generateId(title, `github_${index}`),
          title,
          url,
          description: description ? description.replace(/\s+/g, ' ') : undefined, // Clean up extra spaces
          timestamp,
          source: this.platform,
          // You might want to parse star count or language if needed, but keeping it simple for now
        });
        index++;
      }
    }

    return items;
  }
}
