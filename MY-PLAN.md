基于 deno + github action 定时爬取平台数据，每个 provider 都用一个定时 github action 触发

## 规划任务
1. 允许外部命令通过传入 provider 来爬取指定平台的数据。
2. 更新 github action 添加并行 job 进行作业


## 项目参考

知乎热搜榜，https://github.com/justjavac/zhihu-trending-top-search
知乎热门话题，https://github.com/justjavac/zhihu-trending-hot-questions
微博热搜榜，https://github.com/justjavac/weibo-trending-hot-search
少数派热门榜，https://github.com/hua1995116/shaoshupai-trending-hot-search 参考
/Users/hocgin/GitHub/hot-trending-master

## 数据存放目录设计

```
.
├── api/
│   ├── zhihu-hot-questions/
│   │    └── now.json
│   ├── weibo-top-search/
│   │    ├── history/
│   │    │    └── 2026-02-10.json
│   │    ├── history.json
│   │    └── now.json
│   ├── shaoshupai-top-search/
│   │    └── now.json
│   ├── ...
│   └── provider.json
├── ...
...
```

### 结构设计

#### 获取所有支持的平台

> /api/provider.json 提供所有数据的接口，格式如下

```json
{
  "provider": [{
    "id": "zhihu-hot-questions",
    "title": "知乎热搜话题",
    "imageUrl": null,
    "url": "/api/zhihu-hot-questions/now.json",
    "lastUpdateAt": "2026-02-10 12:00:00",
    "priority": 1000
  }, {
    "id": "weibo-top-search",
    "title": "微博热搜话题",
    "imageUrl": null,
    "url": "/api/weibo-top-search/now.json",
    "lastUpdateAt": "2026-02-10 12:00:00",
    "priority": 999
  }, {
    "id": "shaoshupai-top-search",
    "title": "少数派热搜话题",
    "imageUrl": null,
    "url": "/api/shaoshupai-top-search/now.json",
    "lastUpdateAt": "2026-02-10 12:00:00",
    "priority": 998
  }]
}
```

#### 获取某平台最新数据

> /api/{provider-id}/now.json 提供每个数据的接口，格式如下

```json
{
  "id": "{provider-id}.{timestamp}",
  "lastUpdatedAt": "2026-02-10 12:00:00",
  "data": [{
    "title": "热门话题",
    "summary": "摘要",
    "url": "https://www.zhihu.com/question/368283344",
    "imageUrl": "https://www.zhihu.com/question/368283344",
    "createdAt": "2026-02-10 12:00:00",
    "tags": ["AI"],
    "hot": 1000000
  }]
}
```

#### 获取某平台所有历史数据

> /api/{provider-id}/history.json 提供每个数据的接口，格式如下

```json
{
  "id": "{provider-id}.history",
  "history": [{
    "date": "2026-02-10",
    "uri": "/api/{provider-id}/history/2026-02-10.json"
  }]
}
```

#### 获取某平台某天不同时间的数据

> /api/{provider-id}/history/2026-02-10.json 提供每个数据的接口，格式如下

```json
{
    "id": "{provider-id}.history.2026-02-10",
    "createdAt": "2026-02-10 12:00:00",
    "data": [{
        "id": "{provider-id}.{timestamp}",
        "lastUpdatedAt": "2026-02-10 12:00:00",
        "data": [{
            "title": "热门话题",
            "summary": "摘要",
            "url": "https://www.zhihu.com/question/368283344",
            "imageUrl": "https://www.zhihu.com/question/368283344",
            "createdAt": "2026-02-10 12:00:00",
            "tags": ["AI"],
            "hot": 1000000
        }]
    }，{
        "id": "{provider-id}.{timestamp}",
        "lastUpdatedAt": "2026-02-10 12:00:00",
        "data": [{
            "title": "热门话题",
            "summary": "摘要",
            "url": "https://www.zhihu.com/question/368283344",
            "imageUrl": "https://www.zhihu.com/question/368283344",
            "createdAt": "2026-02-10 12:00:00",
            "tags": ["AI"],
            "hot": 1000000
        }]
    }]
}
```

### 品牌 Logo

https://brandfetch.com/
