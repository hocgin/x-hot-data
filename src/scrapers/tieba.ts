import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

interface TiebaTopic {
  topic_id: number;
  topic_name: string;
  topic_desc: string;
  topic_url: string;
  topic_pic: string;
  discuss_num: number;
  create_time: number;
}

interface TiebaResponse {
  errno: number;
  errmsg: string;
  data: {
    bang_topic: {
      topic_list: TiebaTopic[];
    };
  };
}

export class TiebaScraper extends BaseScraper {
  readonly platform = 'tieba' as const;
  readonly displayName = '贴吧';
  readonly baseUrl = 'https://tieba.baidu.com';
  readonly apiEndpoint = '/hottopic/browse/topicList';
  protected override readonly timeout = 10000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url);
    const data = await this.parseJSON<TiebaResponse>(response);
    
    if (data.errno !== 0) {
      throw new Error(`Tieba API error: ${data.errmsg}`);
    }

    if (!data.data?.bang_topic?.topic_list) {
      return [];
    }

    return data.data.bang_topic.topic_list.map((item) => ({
      id: item.topic_id.toString(),
      title: item.topic_name,
      url: item.topic_url,
      description: item.topic_desc,
      cover: item.topic_pic,
      hot: item.discuss_num,
      hotText: `${item.discuss_num}讨论`,
      timestamp: Date.now(),
      source: this.platform,
    }));
  }
}
