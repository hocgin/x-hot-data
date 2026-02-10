# API 文档
> 域名地址: https://hot-data.hocgin.top/


本文档描述了系统生成的所有数据接口格式。

## 接口总览

所有 API 数据均以静态 JSON 文件形式提供，位于 `/` 目录下。

| 接口 | 路径 | 描述 |
| --- | --- | --- |
| 获取支持的平台 | `/provider.json` | 返回所有已启用平台的列表信息 |
| 获取最新热门数据 | `/{provider-id}/now.json` | 返回指定平台最新的热门数据 |
| 获取历史记录列表 | `/{provider-id}/history.json` | 返回指定平台的历史数据日期列表 |
| 获取历史数据详情 | `/{provider-id}/history/{date}.json` | 返回指定平台特定日期的所有数据快照 |

## 数据结构

### 1. 平台列表

**接口路径**: `/provider.json`

**响应格式**:

```json
{
  "provider": [
    {
      "id": "zhihu-hot-questions",
      "title": "知乎",
      "imageUrl": "https://cdn.brandfetch.io/zhihu.com?c=c=1idMtg8Xt8Gie1JFDdv",
      "url": "/zhihu-hot-questions/now.json",
      "lastUpdateAt": "2024-03-21 12:00:00",
      "priority": 1000
    },
    // ...
  ]
}
```

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `id` | string | 平台唯一标识符 (Provider ID) |
| `title` | string | 平台显示名称 |
| `imageUrl` | string | 平台 Logo 图片地址 |
| `url` | string | 获取该平台最新数据的 API 路径 |
| `lastUpdateAt` | string | 最后更新时间 (YYYY-MM-DD HH:mm:ss) |
| `priority` | number | 排序优先级，数值越大越靠前 |

### 2. 最新热门数据

**接口路径**: `/{provider-id}/now.json`

**响应格式**:

```json
{
  "id": "zhihu-hot-questions.1711000000000",
  "lastUpdatedAt": "2024-03-21 12:00:00",
  "data": [
    {
      "title": "热门话题标题",
      "summary": "话题描述或摘要",
      "url": "https://www.zhihu.com/question/123456",
      "imageUrl": "https://example.com/cover.jpg",
      "createdAt": "2024-03-21 12:00:00",
      "tags": ["科技", "AI"],
      "hot": 10000
    },
    // ...
  ]
}
```

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `id` | string | 数据快照 ID，格式为 `{provider-id}.{timestamp}` |
| `lastUpdatedAt` | string | 数据最后更新时间 |
| `data` | array | 热门数据列表 |
| `data[].title` | string | 标题 |
| `data[].summary` | string | (可选) 摘要或描述 |
| `data[].url` | string | (可选) 原始链接 |
| `data[].imageUrl` | string | (可选) 封面图片 URL |
| `data[].createdAt` | string | 采集时间 |
| `data[].tags` | string[] | (可选) 标签列表 |
| `data[].hot` | number | (可选) 热度数值 |

### 3. 历史记录列表

**接口路径**: `/{provider-id}/history.json`

**响应格式**:

```json
{
  "id": "zhihu-hot-questions.history",
  "history": [
    {
      "date": "2024-03-21",
      "uri": "/zhihu-hot-questions/history/2024-03-21.json"
    },
    // ...
  ]
}
```

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `id` | string | 历史记录 ID，格式为 `{provider-id}.history` |
| `history` | array | 历史日期列表 |
| `history[].date` | string | 日期 (YYYY-MM-DD) |
| `history[].uri` | string | 该日期详细数据的 API 路径 |

### 4. 历史数据详情

**接口路径**: `/{provider-id}/history/{date}.json`

**响应格式**:

```json
{
  "id": "zhihu-hot-questions.history.2024-03-21",
  "createdAt": "2024-03-21 00:00:00",
  "data": [
    {
      "id": "zhihu-hot-questions.1711000000000",
      "lastUpdatedAt": "2024-03-21 00:00:00",
      "data": [
        // ... (同 now.json 中的 data 结构)
      ]
    },
    {
      "id": "zhihu-hot-questions.1711003600000",
      "lastUpdatedAt": "2024-03-21 01:00:00",
      "data": [
        // ...
      ]
    }
    // ... 当天其他时间点的快照
  ]
}
```

| 字段 | 类型 | 描述 |
| --- | --- | --- |
| `id` | string | 详情 ID，格式为 `{provider-id}.history.{date}` |
| `createdAt` | string | 首次创建时间 |
| `data` | array | 当天所有采集时间点的数据快照列表 |
| `data[].id` | string | 单次采集的快照 ID |
| `data[].lastUpdatedAt` | string | 采集时间 |
| `data[].data` | array | 热门数据项列表 |
