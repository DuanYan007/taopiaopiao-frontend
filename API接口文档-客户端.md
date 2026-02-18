# 淘票票客户端 API 接口文档

> **版本**: v1.1.0
> **更新时间**: 2026-02-17
> **Base URL**: `http://localhost:8080`

---

## 快速导航

| 模块 | 接口数 | 路径前缀 |
|------|--------|----------|
| 演出相关 | 3个 | `/client/events` |
| 场次相关 | 2个 | `/client/sessions` |
| 场馆相关 | 2个 | `/client/venues` |

---

## 1. 通用说明

### 1.1 统一响应格式

所有接口返回格式均为：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "timestamp": 1739080800000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，200表示成功，其他表示失败 |
| msg | string | 响应消息 |
| data | object/array | 业务数据 |
| timestamp | long | 服务器时间戳（毫秒） |

### 1.2 通用状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 客户端请求错误（参数错误、业务规则校验失败等） |
| 401 | 未认证/登录失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 1.3 日期时间格式

| 类型 | 格式 | 示例 |
|------|------|------|
| 日期 | yyyy-MM-dd | 2026-02-17 |
| 日期时间 | yyyy-MM-dd HH:mm:ss | 2026-02-17 14:30:00 |

### 1.4 接口说明

- 客户端接口路径均以 `/client/*` 开头
- 当前版本**无需登录认证**即可访问
- 分页查询默认 `page=1`，`pageSize=10`
- 客户端接口会自动过滤**草稿、已取消、已结束**等无效数据

---

## 2. 演出相关接口

### 2.1 演出分页查询

**接口地址**: `GET /client/events`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（演出名称、艺人） |
| city | string | 否 | 城市筛选 |
| type | string | 否 | 演出类型筛选（参考[数据字典](#6-数据字典)） |
| status | string | 否 | 状态筛选，不传则显示有效状态 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "周杰伦2026嘉年华世界巡回演唱会",
        "type": "concert",
        "artist": "周杰伦",
        "city": "上海",
        "venueId": 1,
        "subtitle": "地表最强",
        "eventStartDate": "2026-04-01",
        "eventEndDate": "2026-04-03",
        "duration": 180,
        "description": "演唱会简介...",
        "coverImage": "https://example.com/cover.jpg",
        "images": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "status": "on_sale",
        "saleStartTime": "2026-02-01 10:00:00",
        "saleEndTime": "2026-03-31 23:59:59",
        "tags": ["热门", "实名制"],
        "tips": "温馨提示内容",
        "refundPolicy": "开演前48小时可退票",
        "ticketTiers": [
          {
            "id": 1,
            "name": "VIP",
            "price": 1888,
            "color": "#FFD700",
            "maxPurchase": 2,
            "description": "VIP区域，含周边礼包"
          },
          {
            "id": 2,
            "name": "看台",
            "price": 888,
            "color": "#C0C0C0",
            "maxPurchase": 4,
            "description": "看台区域"
          }
        ],
        "createdAt": "2026-01-15 10:00:00",
        "updatedAt": "2026-01-20 15:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1739080800000
}
```

---

### 2.2 演出详情查询

**接口地址**: `GET /client/events/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 演出ID |

**响应示例**: 同 [2.1 演出分页查询](#21-演出分页查询) 中的单个演出对象

---

### 2.3 查询演出的场次列表

**接口地址**: `GET /client/events/{eventId}/sessions`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| eventId | long | 是 | 演出ID |

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | 状态筛选 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

**响应示例**: 同 [3.1 场次分页查询](#31-场次分页查询)

---

## 3. 场次相关接口

### 3.1 场次分页查询

**接口地址**: `GET /client/sessions`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（场次名称） |
| eventId | long | 否 | 演出ID筛选 |
| venueId | long | 否 | 场馆ID筛选 |
| status | string | 否 | 状态筛选，不传则显示有效状态 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "id": 1,
        "eventId": 1,
        "eventName": "周杰伦2026嘉年华世界巡回演唱会",
        "sessionName": "第1场",
        "startTime": "2026-04-01 19:30:00",
        "endTime": "2026-04-01 22:30:00",
        "venueId": 1,
        "venueName": "上海体育场",
        "hallName": "主体育场",
        "address": "上海市徐汇区天钥桥路666号",
        "totalSeats": 50000,
        "availableSeats": 12345,
        "soldSeats": 37655,
        "lockedSeats": 0,
        "status": "on_sale",
        "ticketTiers": [
          {
            "id": 1,
            "name": "VIP",
            "price": 1888,
            "color": "#FFD700",
            "seatCount": 1000,
            "availableSeats": 200,
            "maxPurchase": 2,
            "enabled": true
          },
          {
            "id": 2,
            "name": "看台",
            "price": 888,
            "color": "#C0C0C0",
            "seatCount": 49000,
            "availableSeats": 12145,
            "maxPurchase": 4,
            "enabled": true
          }
        ],
        "metadata": {
          "duration": 180,
          "saleStartTime": "2026-02-01 10:00:00",
          "saleEndTime": "2026-03-31 23:59:59",
          "seatSelectionMode": "select",
          "requireRealName": true,
          "limitOnePerPerson": false,
          "noRefund": false,
          "sortOrder": 1,
          "remark": "备注信息"
        },
        "createdAt": "2026-01-15 10:00:00",
        "updatedAt": "2026-01-20 15:30:00"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5
  },
  "timestamp": 1739080800000
}
```

---

### 3.2 场次详情查询

**接口地址**: `GET /client/sessions/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 场次ID |

**响应示例**: 同 [3.1 场次分页查询](#31-场次分页查询) 中的单个场次对象

---

## 4. 场馆相关接口

### 4.1 场馆分页查询

**接口地址**: `GET /client/venues`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（场馆名称） |
| city | string | 否 | 城市筛选 |
| district | string | 否 | 区域筛选 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "上海体育场",
        "city": "上海",
        "district": "徐汇区",
        "address": "上海市徐汇区天钥桥路666号",
        "latitude": 31.187,
        "longitude": 121.438,
        "capacity": 50000,
        "facilities": [
          "停车场",
          "地铁站直达",
          "餐饮服务",
          "无障碍通道"
        ],
        "description": "上海体育场是上海最大的体育场馆...",
        "images": [
          "https://example.com/venue1.jpg",
          "https://example.com/venue2.jpg"
        ],
        "createdAt": "2026-01-10 10:00:00",
        "updatedAt": "2026-01-10 10:00:00"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1739080800000
}
```

---

### 4.2 场馆详情查询

**接口地址**: `GET /client/venues/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 场馆ID |

**响应示例**: 同 [4.1 场馆分页查询](#41-场馆分页查询) 中的单个场馆对象

---

## 5. 数据模型说明

### 5.1 演出对象 (EventResponse)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 演出ID |
| name | string | 演出名称 |
| type | string | 演出类型 |
| artist | string | 艺人/主办方 |
| city | string | 城市 |
| venueId | long | 场馆ID |
| subtitle | string | 副标题 |
| eventStartDate | string | 演出开始日期 |
| eventEndDate | string | 演出结束日期 |
| duration | int | 演出时长（分钟） |
| description | string | 演出简介 |
| coverImage | string | 封面图片URL |
| images | string[] | 图片URL列表 |
| status | string | 状态 |
| saleStartTime | string | 开售时间 |
| saleEndTime | string | 停售时间 |
| tags | string[] | 标签列表 |
| tips | string | 温馨提示 |
| refundPolicy | string | 退换票政策 |
| ticketTiers | TicketTierDTO[] | 票档列表 |

### 5.2 场次对象 (SessionResponse)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 场次ID |
| eventId | long | 演出ID |
| eventName | string | 演出名称（自动填充） |
| sessionName | string | 场次名称 |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| venueId | long | 场馆ID |
| venueName | string | 场馆名称（自动填充） |
| hallName | string | 馆厅名称 |
| address | string | 详细地址 |
| totalSeats | int | 总座位数 |
| availableSeats | int | 可售座位数 |
| soldSeats | int | 已售座位数 |
| lockedSeats | int | 锁定座位数 |
| status | string | 状态 |
| ticketTiers | TicketTierInfo[] | 票档列表 |
| metadata | SessionMetadata | 扩展配置 |

### 5.3 场馆对象 (VenueResponse)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 场馆ID |
| name | string | 场馆名称 |
| city | string | 所在城市 |
| district | string | 所在区域 |
| address | string | 详细地址 |
| latitude | decimal | 纬度 |
| longitude | decimal | 经度 |
| capacity | int | 容纳人数 |
| facilities | string[] | 设施数组 |
| description | string | 场馆介绍 |
| images | string[] | 场馆图片URL列表 |

---

## 6. 数据字典

### 6.1 演出状态 (event.status)

| 值 | 说明 | 客户端可见 |
|----|------|------------|
| draft | 草稿 | ❌ |
| on_sale | 在售 | ✅ |
| sold_out | 售罄 | ✅ |
| cancelled | 已取消 | ❌ |
| ended | 已结束 | ❌ |

### 6.2 演出类型 (event.type)

| 值 | 说明 |
|----|------|
| concert | 演唱会 |
| drama | 话剧 |
| musical | 音乐剧 |
| opera | 歌剧 |
| dance | 舞蹈 |
| exhibition | 展览 |
| sports | 体育赛事 |

### 6.3 场次状态 (session.status)

| 值 | 说明 | 客户端可见 |
|----|------|------------|
| not_started | 未开始 | ✅ |
| on_sale | 在售 | ✅ |
| sold_out | 售罄 | ✅ |
| selling_soon | 即将开售 | ✅ |
| ongoing | 进行中 | ✅ |
| ended | 已结束 | ❌ |
| cancelled | 已取消 | ❌ |

### 6.4 选座方式 (metadata.seatSelectionMode)

| 值 | 说明 |
|----|------|
| select | 自选座 |
| auto | 系统自动选座 |

---

## 7. 接口调用示例

### 7.1 获取演出列表

```javascript
// GET /client/events?page=1&pageSize=10&city=上海
fetch('/api/client/events?page=1&pageSize=10&city=上海')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('演出列表:', data.data.list);
      console.log('总数:', data.data.total);
    }
  });
```

### 7.2 获取演出详情

```javascript
// GET /client/events/1
fetch('/api/client/events/1')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('演出详情:', data.data);
    }
  });
```

### 7.3 获取演出场次

```javascript
// GET /client/events/1/sessions
fetch('/api/client/events/1/sessions?page=1&pageSize=10')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('场次列表:', data.data.list);
    }
  });
```

---

## 8. 错误处理

### 8.1 错误响应示例

```json
{
  "code": 404,
  "msg": "演出不存在",
  "data": null,
  "timestamp": 1739080800000
}
```

### 8.2 常见错误

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数格式 |
| 404 | 资源不存在 | 检查ID是否正确 |
| 500 | 服务器错误 | 稍后重试或联系技术支持 |

---

## 9. 在线文档

访问 http://localhost:8080/doc.html 查看完整的 Knife4j API 文档（含在线调试功能）

---

## 10. 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2026-02-09 | 初始版本 |
| v1.1.0 | 2026-02-17 | 更新接口实现状态，添加客户端特性说明 |
