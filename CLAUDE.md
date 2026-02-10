# 热门数据爬虫 - AI 辅助开发文档

本文档用于 Claude AI 辅助开发，包含项目信息、平台对接情况和技术规范。

## 项目概述

基于 Deno + GitHub Actions 的多平台热门数据定时爬取系统。

## 平台对接状态

### 已对接平台

| 平台        | Provider ID         | 状态         | 文件                   | 优先级 |
| ----------- | ------------------- | ------------ | ---------------------- | ------ |
| 微博        | weibo-top-search    | ✅ 已启用    | scrapers/weibo.ts      | 999    |
| 今日头条    | toutiao-hot         | ✅ 已启用    | scrapers/toutiao.ts    | 992    |
| CSDN        | csdn-hot            | ✅ 已启用    | scrapers/csdn.ts       | 991    |
| 知乎        | zhihu-hot-questions | ⚠️ 需 Cookie | scrapers/zhihu.ts      | 1000   |
| GitHub      | github-trending     | ✅ 已启用    | scrapers/github.ts     | 998    |
| 百度        | baidu-hot-search    | ✅ 已启用    | scrapers/baidu.ts      | 997    |
| 抖音        | douyin-hot          | ❌ 需 Token  | scrapers/douyin.ts     | 996    |
| B站         | bilibili-hot        | ❌ 风控      | scrapers/bilibili.ts   | 995    |
| V2EX        | v2ex-hot            | ✅ 已启用    | scrapers/v2ex.ts       | 994    |
| Hacker News | hackernews-top      | ✅ 已启用    | scrapers/hackernews.ts | 993    |

### 已对接平台 (续)

| 平台       | Provider ID      | 状态      | 文件                   | 优先级 |
| ---------- | ---------------- | --------- | ---------------------- | ------ |
| IT之家     | ithome-hot       | ✅ 已启用 | scrapers/ithome.ts     | 990    |
| 少数派     | sspai-hot        | ✅ 已启用 | scrapers/sspai.ts      | 989    |
| AcFun      | acfun-hot        | ✅ 已启用 | scrapers/acfun.ts      | 988    |
| 安全客     | anquanke-hot     | ✅ 已启用 | scrapers/anquanke.ts   | 987    |
| 36氪       | kr36-hot         | ✅ 已启用 | scrapers/kr36.ts       | 986    |
| 虎扑       | hupu-hot         | ✅ 已启用 | scrapers/hupu.ts       | 985    |
| 豆瓣小组   | douban-group-hot | ✅ 已启用 | scrapers/douban.ts     | 984    |
| 吾爱破解   | wuaipojie-hot    | ✅ 已启用 | scrapers/wuaipojie.ts  | 983    |
| 搜狗       | sougou-hot       | ❌ 已下线 | -                      | 982    |
| 360搜索    | 360search-hot    | ✅ 已启用 | scrapers/so.ts         | 981    |
| 贴吧       | tieba-hot        | ✅ 已启用 | scrapers/tieba.ts      | 980    |
| 腾讯新闻   | qqnews-hot       | ✅ 已启用 | scrapers/qqnews.ts     | 979    |
| 什么值得买 | smzdm-hot        | ✅ 已启用 | scrapers/smzdm.ts      | 978    |
| 易车网     | yiche-hot        | ✅ 已启用 | scrapers/yiche.ts      | 977    |
| 游戏葡萄   | youxiputao-hot   | ✅ 已启用 | scrapers/youxiputao.ts | 976    |
| 懂球帝     | dongqiudi-hot    | ✅ 已启用 | scrapers/dongqiudi.ts  | 975    |

### 待对接平台（参考 hot-trending-master）

目前所有高优先级活跃平台均已对接完毕。

## 平台对接规范

添加平台配置：

```typescript
platformName: {
  name: 'platformName',
  displayName: '平台显示名',
  baseUrl: 'https://example.com',
  apiEndpoint: '/api/path',
  enabled: true,  // 是否启用
  timeout: 10000,  // 超时时间（毫秒）
  userAgent: 'Mozilla/5.0 ...',
}
```

### 2. 类型定义 (src/types/trending.ts)

添加平台到 Platform 类型：

```typescript
export type Platform =
  | 'zhihu'
  | 'weibo'
  | 'platformName'; // 新平台
```

### 3. 爬虫实现 (src/scrapers/platformName.ts)

创建爬虫类，继承 BaseScraper：

```typescript
import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

export class PlatformNameScraper extends BaseScraper {
  readonly platform = 'platformName' as const;
  readonly displayName = '平台显示名';
  readonly baseUrl = 'https://example.com';
  readonly apiEndpoint = '/api/path';
  protected override readonly timeout = 15000;

  async fetchTrending(): Promise<TrendingItem[]> {
    const url = `${this.baseUrl}${this.apiEndpoint}`;
    const response = await this.fetchWithRetry(url, {
      headers: {
        'Referer': this.baseUrl,
      },
    });

    // 解析响应并返回数据
    const data = await this.parseJSON<ResponseType>(response);
    // ... 数据转换逻辑
    return items;
  }
}
```

### 4. API 映射 (src/types/api.ts)

添加到平台映射：

```typescript
export const PLATFORM_TO_PROVIDER_ID: Record<Platform, string> = {
  // ...
  platformName: 'platformName-hot',
};

export const PROVIDER_ID_TO_PLATFORM: Record<string, Platform> = {
  // ...
  'platformName-hot': 'platformName',
};
```

### 5. 注册爬虫 (main.ts & dev.ts)

在主入口注册爬虫：

```typescript
import { PlatformNameScraper } from './src/scrapers/platformName.ts';

async function main() {
  // ...
  for (const platform of enabledPlatforms) {
    switch (platform) {
      case 'platformName':
        scrapers.push(new PlatformNameScraper());
        break;
    }
  }
}
```

### 6. 优先级配置 (src/services/api.ts)

添加平台优先级：

```typescript
private getProviderInfo(platform: Platform): { id: string; priority: number } {
  const platformToProviderInfo: Record<Platform, { id: string; priority: number }> = {
    // ...
    platformName: { id: 'platformName-hot', priority: 990 },
  };
  return platformToProviderInfo[platform];
}
```

## 平台 API 参考

### GitHub

- URL: https://github.com/trending
- 方法: HTML 解析
- 选择器: `<article class="Box-row">`

### IT 之家

- URL: https://m.ithome.com/rankm/
- 方法: HTML 解析
- 选择器: `<a href="..."><p class="plc-title">标题</p></a>`

### 少数派

- URL:
  https://sspai.com/api/v1/article/tag/page/get?limit=100000&tag=%E7%83%AD%E9%97%A8%E6%96%87%E7%AB%A0
- 方法: JSON API
- 响应字段: title, released_time, author, like_count, comment_count

### AcFun

- URL:
  https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=&subChannelId=&rankLimit=30&rankPeriod=DAY
- 方法: JSON API
- 响应字段: rankList[].contentTitle, rankList[].shareUrl

### 安全客

- URL: https://www.anquanke.com/webapi/api/index/top/list?page=1
- 方法: JSON API
- 响应字段: data.list[].title, data.list[].url

### 36氪

- URL: https://36kr.com/hot-list/renqi/{date}/1
- 方法: HTML 解析 (DOM)
- 选择器: `//div[@class="article-list"]/div[contains(@class, "article-wrapper")]`

### 虎扑

- URL: https://www.hupu.com/
- 方法: HTML 解析
- 选择器: `<a href="..."><div><div>序号</div><div>标题</div></div></a>`

### V2EX

- URL: https://www.v2ex.com/?tab=hot
- 方法: HTML 解析
- 选择器: `<span class="item_hot_topic_title"><a href="...">标题</a></span>`

### 豆瓣小组

- URL: https://www.douban.com/group/explore
- 方法: HTML 解析 (DOM)
- 选择器: `//div[@class="channel-item"]`
- 需要 Cookie

### 吾爱破解

- URL: https://www.52pojie.cn/misc.php?mod=ranklist&type=thread&view=heats&orderby=today
- 方法: HTML 解析
- 选择器: `<th><a href="..." target="_blank">标题</a></th>`

## 开发指南

### 本地开发

```bash
# 开发模式（详细日志）
deno task dev

# 生产模式
deno task start

# 代码检查
deno task lint

# 代码格式化
deno task fmt
```

### 调试新爬虫

1. 在 `dev.ts` 中单独测试新爬虫
2. 查看日志输出验证数据格式
3. 确认无误后在 `main.ts` 中注册

### 测试数据格式

确保返回的数据符合 TrendingItem 类型：

```typescript
interface TrendingItem {
  id: string;
  title: string;
  url?: string;
  hot?: number;
  hotText?: string;
  category?: string;
  tags?: string[];
  description?: string;
  cover?: string;
  author?: string;
  timestamp: number;
  source: Platform;
}
```

## 常见问题

### 1. Cookie 认证

某些平台（如知乎、豆瓣）需要 Cookie 认证，考虑从环境变量或配置文件读取。

### 2. 反爬虫策略

- 使用随机 User-Agent
- 添加请求头 (Referer, Accept 等)
- 控制请求频率
- 考虑使用代理

### 3. 数据解析

- 优先使用 JSON API
- HTML 解析使用正则或 DOM
- 注意字符编码 (UTF-8, GBK)
