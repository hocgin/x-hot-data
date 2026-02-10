# 热门数据爬虫

基于 Deno + GitHub Actions 的多平台热门数据定时爬取系统。

## 特性

- **多平台支持**: 知乎、微博等热门榜单数据爬取
- **自动化**: GitHub Actions 定时任务，每小时自动更新
- **模块化设计**: 每个平台独立的爬虫实现，易于扩展
- **类型安全**: 完整的 TypeScript 类型定义
- **数据归档**: 按日期自动归档存储
- **API 接口**: 提供 RESTful 风格的 JSON 数据接口

## 项目结构

```
x-hot-data/
├── .github/
│   └── workflows/
│       └── fetch-hot-data.yml    # GitHub Actions 工作流
├── api/                           # API 数据目录
│   ├── provider.json              # 所有数据源列表
│   ├── zhihu-hot-questions/       # 知乎数据
│   │   ├── now.json              # 当前热门数据
│   │   ├── history.json          # 历史记录列表
│   │   └── history/              # 历史数据文件
│   └── weibo-top-search/         # 微博数据
│       ├── now.json
│       ├── history.json
│       └── history/
├── data/                          # 原始数据存储目录
│   └── YYYY-MM-DD/
│       ├── zhihu.json
│       └── weibo.json
├── src/
│   ├── config/                    # 配置文件
│   │   ├── platforms.ts           # 平台配置
│   │   └── constants.ts           # 全局常量
│   ├── scrapers/                  # 爬虫实现
│   │   ├── base.ts                # 爬虫基类
│   │   ├── zhihu.ts               # 知乎爬虫
│   │   └── weibo.ts               # 微博爬虫
│   ├── services/                  # 服务层
│   │   ├── scheduler.ts           # 任务调度
│   │   ├── api.ts                 # API 数据生成
│   │   └── storage.ts             # 数据存储
│   ├── types/                     # 类型定义
│   │   ├── trending.ts            # 热门数据类型
│   │   ├── api.ts                 # API 数据类型
│   │   └── error.ts               # 错误类型
│   └── utils/                     # 工具函数
│       ├── logger.ts              # 日志工具
│       └── storage.ts             # 存储工具
├── main.ts                        # 生产入口
├── dev.ts                         # 开发入口
├── deno.json                      # Deno 配置
└── README.md
```

## 快速开始

### 本地运行

```bash
# 开发模式（带详细日志）
deno task dev

# 生产模式
deno task start

# 运行测试
deno task test

# 代码检查
deno task lint

# 代码格式化
deno task fmt
```

### GitHub Actions

1. Fork 本仓库
2. 启用 GitHub Actions（在仓库的 Settings > Actions 中）
3. Actions 会每小时自动运行一次

## API 接口格式

### 数据目录结构

```
api/
├── provider.json                              # 数据源列表
├── zhihu-hot-questions/                       # 知乎数据
│   ├── now.json                              # 当前热门
│   ├── history.json                          # 历史记录索引
│   └── history/
│       └── 2026-02-10#12_00_00.json         # 历史数据
└── weibo-top-search/                         # 微博数据
    ├── now.json
    ├── history.json
    └── history/
        └── 2026-02-10#12_00_00.json
```

### 1. /api/provider.json

获取所有数据源的信息：

```json
{
  "provider": [
    {
      "id": "zhihu-hot-questions",
      "lastUpdateAt": "2026-02-10 12:00:00"
    },
    {
      "id": "weibo-top-search",
      "lastUpdateAt": "2026-02-10 12:00:00"
    }
  ]
}
```

### 2. /api/{provider-id}/now.json

获取当前热门数据：

```json
{
  "id": "zhihu-hot-questions.1234567890",
  "lastUpdatedAt": "2026-02-10 12:00:00",
  "data": [
    {
      "title": "热门话题标题",
      "summary": "话题摘要",
      "url": "https://www.zhihu.com/question/368283344",
      "imageUrl": "https://example.com/cover.jpg",
      "createdAt": "2026-02-10 12:00:00",
      "tags": ["AI", "科技"],
      "hot": 1000000
    }
  ]
}
```

### 3. /api/{provider-id}/history.json

获取历史记录列表：

```json
{
  "id": "zhihu-hot-questions.history",
  "history": [
    {
      "date": "2026-02-10",
      "uri": "/api/zhihu-hot-questions/history/2026-02-10.json"
    }
  ]
}
```

### 4. /api/{provider-id}/history/{date}#time.json

获取指定日期的历史数据：

```json
{
  "id": "zhihu-hot-questions.history.2026-02-10",
  "createdAt": "2026-02-10 12:00:00",
  "data": [
    {
      "id": "zhihu-hot-questions.1234567890",
      "lastUpdatedAt": "2026-02-10 12:00:00",
      "data": [
        {
          "title": "热门话题标题",
          "summary": "话题摘要",
          "url": "https://www.zhihu.com/question/368283344",
          "imageUrl": "https://example.com/cover.jpg",
          "createdAt": "2026-02-10 12:00:00",
          "tags": ["AI"],
          "hot": 1000000
        }
      ]
    }
  ]
}
```

## 原始数据格式

存储在 `data/YYYY-MM-DD/` 目录的原始格式：

```json
{
  "platform": "zhihu",
  "items": [
    {
      "id": "zhihu_1234567890_abc123",
      "title": "热门话题标题",
      "url": "https://...",
      "hot": 1234567,
      "hotText": "123万热",
      "category": "热搜",
      "timestamp": 1234567890000,
      "source": "zhihu"
    }
  ],
  "fetchedAt": 1234567890000,
  "fetchedAtFormatted": "2024-01-01 12:00:00"
}
```

## 添加新平台

1. 在 `src/config/platforms.ts` 添加平台配置
2. 在 `src/scrapers/` 创建新的爬虫文件，继承 `BaseScraper`
3. 在 `main.ts` 和 `dev.ts` 中注册新爬虫

示例：

```typescript
// src/scrapers/github.ts
import { BaseScraper } from './base.ts';
import type { TrendingItem } from '../types/trending.ts';

export class GithubScraper extends BaseScraper {
  readonly platform = 'github' as const;
  readonly displayName = 'GitHub';
  readonly baseUrl = 'https://github.com';
  readonly apiEndpoint = '/trending';

  async fetchTrending(): Promise<TrendingItem[]> {
    // 实现爬虫逻辑
  }
}
```

## 配置

### 启用/禁用平台

编辑 `src/config/platforms.ts` 中的 `enabled` 字段：

```typescript
zhihu: {
  // ...
  enabled: true,  // 启用
}
```

### 调整定时频率

编辑 `.github/workflows/fetch-hot-data.yml`：

```yaml
schedule:
  - cron: '0 * * * *'  # 每小时
  # - cron: '0 */2 * * *'  # 每2小时
  # - cron: '0 0 * * *'  # 每天零点
```

## 项目参考

- [知乎热搜榜](https://github.com/justjavac/zhihu-trending-top-search)
- [知乎热门话题](https://github.com/justjavac/zhihu-trending-hot-questions)
- [微博热搜榜](https://github.com/justjavac/weibo-trending-hot-search)
- [少数派热门榜](https://github.com/hua1995116/shaoshupai-trending-hot-search)
- [hot-trending](https://github.com/skadoosh-Q/hot-trending)

## License

MIT
