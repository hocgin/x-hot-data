基于 deno + github action 定时爬取平台数据，每个类目都用一个定时任务触发

## 项目参考
知乎热搜榜，https://github.com/justjavac/zhihu-trending-top-search
知乎热门话题，https://github.com/justjavac/zhihu-trending-hot-questions
微博热搜榜，https://github.com/justjavac/weibo-trending-hot-search
少数派热门榜，https://github.com/hua1995116/shaoshupai-trending-hot-search
参考 https://github.com/skadoosh-Q/hot-trending/tree/master/script

## 数据存放目录设计
```
.
├── api/
│   ├── zhihu-hot-questions/
│   │    └── now.json
│   ├── weibo-top-search/
│   │    ├── history/
│   │    │    └── 2026-02-10#12_00_00.json
│   │    ├── history.json
│   │    └── now.json
│   ├── shaoshupai-top-search/
│   │    └── now.json
│   └── provider.json
```

### 结构设计
#### /api/provider.json 提供所有数据的接口，格式如下
```json
{
    "provider": [{
        "id": "zhihu-hot-questions",
        "lastUpdateAt": "2026-02-10 12:00:00"
    },{
        "id": "weibo-top-search",
        "lastUpdateAt": "2026-02-10 12:00:00"
    },{
        "id": "shaoshupai-top-search",
        "lastUpdateAt": "2026-02-10 12:00:00"
    }]
}
```

#### /api/{provider-id}/now.json 提供每个数据的接口，格式如下
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
#### /api/{provider-id}/history.json 提供每个数据的接口，格式如下
```json
{
    "id": "{provider-id}.history",
    "history": [{
        "date": "2026-02-10",
        "uri": "/api/{provider-id}/history/2026-02-10.json"
    }]
}
```
#### /api/{provider-id}/history/2026-02-10.json 提供每个数据的接口，格式如下
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
    }]
}
```
