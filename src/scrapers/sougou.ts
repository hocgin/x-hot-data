import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';
import { logger } from '../utils/logger.ts';

export class SougouScraper extends BaseScraper {
  readonly platform = 'sougou' as const;
  readonly displayName = '搜狗';
  readonly baseUrl = 'https://www.sogou.com';
  readonly apiEndpoint = '/web';
  protected override readonly timeout = 15000;
  private log = logger.child('SougouScraper');

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}?query=%E6%90%9C%E7%8B%97%E7%83%AD%E6%90%9C`;
    this.log.debug(`开始获取搜狗热榜数据: ${url}`);

    try {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.sogou.com/',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Cookie': 'SUV=' + Math.random().toString(36).substring(2) + '; CXID=' + Math.random().toString(36).substring(2),
        },
      });

      const html = await response.text();
      const items = this.parseHTML(html);

      this.log.success(`成功获取 ${items.length} 条搜狗热榜数据`);
      return items;
    } catch (error) {
      this.log.error('搜狗热榜数据获取失败', error);
      return [];
    }
  }

  private parseHTML(html: string): TrendingItem[] {
    const items: TrendingItem[] = [];
    const timestamp = Date.now();

    // 匹配包含热搜的 li 元素
    // <li class="fz-mid space-small"> ... <span class="hot-rank-right">...</span></li>
    // 使用更宽松的正则以适应可能的样式变化
    const pattern = /<li[^>]*>([\s\S]*?)<span\s+class="hot-rank-right">([\s\S]*?)<\/span>[\s\S]*?<\/li>/g;
    
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = pattern.exec(html)) !== null && index < 30) {
      const content = match[1];
      const hotText = match[2]?.trim();

      // 提取标题和链接
      // <a href="..." target="_blank" id="sogou_vr_..." posid="...">标题</a>
      const linkMatch = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/i.exec(content);

      if (linkMatch) {
        const url = linkMatch[1].trim();
        const title = linkMatch[2].trim();

        // 过滤掉非热搜链接（如果有）
        if (!url.includes('query=')) {
            continue;
        }

        items.push({
          id: this.generateId(title, `sougou_${index}`),
          title,
          url: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
          hotText,
          timestamp,
          source: this.platform,
        });
        index++;
      }
    }

    return items;
  }
}
