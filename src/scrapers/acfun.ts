import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface AcFunResponse {
  result: number;
  rankList: AcFunVideo[];
}

interface AcFunVideo {
  contentId: number;
  contentTitle: string;
  videoCover: string;
  userName: string;
  contributeTime: number;
  likeCountShow: string;
  danmuCount: number;
  commentCountShow: string;
  shareUrl?: string; // 某些接口可能有，这里手动拼接
}

export class AcfunScraper extends BaseScraper {
  readonly platform = 'acfun' as const;
  readonly displayName = 'AcFun';
  readonly baseUrl = 'https://www.acfun.cn';
  readonly apiEndpoint = '/rest/pc-direct/rank/channel';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url =
      `${this.baseUrl}${this.apiEndpoint}?channelId=&subChannelId=&rankLimit=30&rankPeriod=DAY`;
    const response = await this.fetchWithRetry(url);
    const data = await this.parseJSON<AcFunResponse>(response);

    if (data.result !== 0) {
      throw new Error('AcFun API error');
    }

    return data.rankList.map((item, index) => ({
      id: item.contentId.toString(),
      title: item.contentTitle,
      url: `${this.baseUrl}/v/ac${item.contentId}`,
      cover: item.videoCover,
      author: item.userName,
      hot: parseInt(item.likeCountShow.replace(/,/g, '')), // 假设是数字或带逗号的字符串
      hotText: `${item.likeCountShow} 赞`,
      timestamp: item.contributeTime,
      source: this.platform,
    }));
  }
}
