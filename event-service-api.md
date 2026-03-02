# Event-Service（演出服务）API 文档

## 统一响应格式 Result

所有接口返回统一的 `Result<T>` 格式：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": { /* 实际数据 */ },
  "timestamp": 1706745600000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码：200=成功，其他为失败 |
| msg | String | 返回消息 |
| data | T | 实际返回数据 |
| timestamp | long | 时间戳（毫秒） |

---

## 1. 分页查询演出列表

**接口**: `GET /admin/events`

**请求参数** (`QueryParams`):
| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| keyword | String | 否 | 关键词搜索（演出名称、艺人） | "周杰伦" |
| city | String | 否 | 城市筛选 | "上海" |
| type | String | 否 | 演出类型 | "concert" |
| status | String | 否 | 状态筛选 | "on_sale" |
| page | Integer | 否 | 页码，默认1 | 1 |
| pageSize | Integer | 否 | 每页条数，默认10 | 10 |

**响应数据** `Result<EventPageResponse>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "type": "concert",
        "artist": "周杰伦",
        "city": "上海",
        "subtitle": "嘉年华世界巡回演唱会",
        "eventStartDate": "2025-03-15",
        "eventEndDate": "2025-03-15",
        "duration": 180,
        "description": "演出简介",
        "coverImage": "https://example.com/image.jpg",
        "images": ["url1", "url2", "url3"],
        "status": "on_sale",
        "saleStartTime": "2025-02-01 10:00:00",
        "saleEndTime": "2025-03-15 19:30:00",
        "tags": ["recommended", "hot"],
        "tips": "儿童入场提示",
        "refundPolicy": "开演前7天可退票",
        "createdAt": "2025-01-01 10:00:00",
        "updatedAt": "2025-01-01 10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1706745600000
}
```

---

## 2. 查询演出详情

**接口**: `GET /admin/events/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**响应数据** `Result<EventResponse>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
    "type": "concert",
    "artist": "周杰伦",
    "city": "上海",
    "subtitle": "嘉年华世界巡回演唱会",
    "eventStartDate": "2025-03-15",
    "eventEndDate": "2025-03-15",
    "duration": 180,
    "description": "演出简介",
    "coverImage": "https://example.com/image.jpg",
    "images": ["url1", "url2", "url3"],
    "status": "on_sale",
    "saleStartTime": "2025-02-01 10:00:00",
    "saleEndTime": "2025-03-15 19:30:00",
    "tags": ["recommended", "hot"],
    "tips": "儿童入场提示",
    "refundPolicy": "开演前7天可退票",
    "createdAt": "2025-01-01 10:00:00",
    "updatedAt": "2025-01-01 10:00:00"
  },
  "timestamp": 1706745600000
}
```

---

## 3. 创建演出

**接口**: `POST /admin/events`

**请求体** `EventCreateRequest`:
```json
{
  "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
  "type": "concert",
  "artist": "周杰伦",
  "city": "上海",
  "subtitle": "嘉年华世界巡回演唱会",
  "eventStartDate": "2025-03-15",
  "eventEndDate": "2025-03-15",
  "duration": 180,
  "saleStartTime": "2025-02-01T10:00:00",
  "saleEndTime": "2025-03-15T19:30:00",
  "coverImage": "https://example.com/image.jpg",
  "images": "url1,url2,url3",
  "description": "演出简介",
  "tips": "儿童入场提示",
  "refundPolicy": "开演前7天可退票",
  "status": "draft",
  "tags": ["recommended", "hot"]
}
```

**响应数据** `Result<Long>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1,
  "timestamp": 1706745600000
}
```

---

## 4. 更新演出

**接口**: `PUT /admin/events/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**请求体** `EventUpdateRequest`:
```json
{
  "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
  "type": "concert",
  "artist": "周杰伦",
  "city": "上海",
  "subtitle": "嘉年华世界巡回演唱会",
  "eventStartDate": "2025-03-15",
  "eventEndDate": "2025-03-15",
  "duration": 180,
  "saleStartTime": "2025-02-01T10:00:00",
  "saleEndTime": "2025-03-15T19:30:00",
  "coverImage": "https://example.com/image.jpg",
  "images": "url1,url2,url3",
  "description": "演出简介",
  "tips": "儿童入场提示",
  "refundPolicy": "开演前7天可退票",
  "status": "on_sale",
  "tags": ["recommended", "hot"]
}
```

**响应数据** `Result<Void>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 5. 删除演出

**接口**: `DELETE /admin/events/{id}`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**响应数据** `Result<Void>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 6. 更新演出状态

**接口**: `PUT /admin/events/{id}/status`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**请求参数** (`RequestParam`):
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | String | 是 | 状态 |

**响应数据** `Result<Void>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 7. 获取演出最低价格

**接口**: `GET /admin/events/{id}/price`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**响应数据** `Result<BigDecimal>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 2580.00,
  "timestamp": 1706745600000
}
```

---

## 8. 查询演出场次列表（包含场次信息）

**接口**: `GET /admin/events/{id}/sessions`

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 演出ID |

**响应数据** `Result<List<SessionBriefResponse>>`:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "eventId": 1,
      "sessionName": "2025-03-15 19:30场",
      "startTime": "2025-03-15 19:30:00",
      "endTime": "2025-03-15 22:30:00",
      "seatTemplateId": 1,
      "hallName": "主剧场",
      "address": "上海市黄浦区XXX路",
      "availableSeats": 1000,
      "soldSeats": 500,
      "lockedSeats": 50,
      "status": "on_sale",
      "metadata": {
        "duration": 180,
        "saleStartTime": "2025-02-01 10:00:00",
        "saleEndTime": "2025-03-15 19:30:00",
        "seatSelectionMode": "online",
        "requireRealName": true,
        "limitOnePerPerson": false,
        "noRefund": false,
        "sortOrder": 100,
        "remark": ""
      },
      "createdAt": "2025-01-01 10:00:00",
      "updatedAt": "2025-01-01 10:00:00"
    }
  ],
  "timestamp": 1706745600000
}
```

---

## 枚举类型说明

### 演出类型 (type)
| 值 | 说明 |
|----|------|
| concert | 演唱会 |
| theatre | 戏剧 |
| exhibition | 展览 |
| sports | 体育 |
| music | 音乐会 |
| kids | 亲子 |
| dance | 舞蹈 |

### 演出状态 (status)
| 值 | 说明 |
|----|------|
| draft | 草稿 |
| on_sale | 在售 |
| off_sale | 停售 |
| sold_out | 已售完 |
| coming_soon | 即将开售 |

### 场次状态 (status)
| 值 | 说明 |
|----|------|
| not_started | 未开始 |
| on_sale | 在售 |
| sold_out | 已售完 |
| ended | 已结束 |
| off_sale | 停售 |

---

## 重要变更说明

### 已删除字段
| 字段 | 原位置 | 说明 |
|------|--------|------|
| `venueId` | EventResponse, EventCreateRequest, EventUpdateRequest | 演出不再直接关联场馆 |
| `ticketTiers` | EventResponse, EventCreateRequest, EventUpdateRequest | 票档列表已移除 |

### SessionBriefResponse 变更
| 字段 | 变更 |
|------|------|
| ~~`venueId`~~ | 删除 |
| ~~`venueName`~~ | 删除 |
| ~~`totalSeats`~~ | 删除 |
| `seatTemplateId` | 新增 |
| `ticketTiers` | 删除 |

### 字段来源变更
| 字段 | 变更 |
|------|------|
| `duration` | 从 metadata 解析到主字段 |
| `tips` | 从 metadata 解析到主字段 |
| `refundPolicy` | 从 metadata 解析到主字段 |
| `hallName` | 从座位模板服务获取 |
