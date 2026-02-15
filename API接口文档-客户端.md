# 淘票票客户端 API 接口文档

> **版本**: v1.0.0
> **更新时间**: 2026-02-09
> **Base URL**: `http://localhost:8080`

---

## 目录

- [1. 通用说明](#1-通用说明)
- [2. 演出相关接口](#2-演出相关接口)
- [3. 场次相关接口](#3-场次相关接口)
- [4. 场馆相关接口](#4-场馆相关接口)
- [5. 数据字典](#5-数据字典)

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
| 日期 | yyyy-MM-dd | 2026-02-09 |
| 日期时间 | yyyy-MM-dd HH:mm:ss | 2026-02-09 14:30:00 |

### 1.4 接口说明

- 客户端接口路径均以 `/client/*` 开头
- 当前版本**无需登录认证**即可访问
- 分页查询默认 `page=1`，`pageSize=10`

---

## 2. 演出相关接口

### 2.1 演出分页查询

**接口地址**: `GET /client/events`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（演出名称、艺人） |
| city | string | 否 | 城市筛选 |
| type | string | 否 | 演出类型筛选（参考[数据字典](#52-演出类型)） |
| status | string | 否 | 状态筛选（参考[数据字典](#51-演出状态)） |
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

## 3. 场次相关接口

### 3.1 场次分页查询

**接口地址**: `GET /client/sessions`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 关键词搜索（场次名称） |
| eventId | long | 否 | 演出ID筛选 |
| venueId | long | 否 | 场馆ID筛选 |
| status | string | 否 | 状态筛选（参考[数据字典](#53-场次状态)） |
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

### 3.3 查询演出的所有场次

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

**响应示例**: 同 [4.1 场馆分页查询](#41-场馆分页查询) 中的单个场次对象

---

## 5. 数据字典

### 5.1 演出状态 (status)

| 值 | 说明 | 备注 |
|----|------|------|
| draft | 草稿 | 未发布 |
| on_sale | 在售 | 可购票 |
| sold_out | 售罄 | 已售完 |
| cancelled | 已取消 | 演出取消 |
| ended | 已结束 | 演出结束 |

### 5.2 演出类型 (type)

| 值 | 说明 |
|----|------|
| concert | 演唱会 |
| drama | 话剧 |
| musical | 音乐剧 |
| opera | 歌剧 |
| dance | 舞蹈 |
| exhibition | 展览 |
| sports | 体育赛事 |

### 5.3 场次状态 (status)

| 值 | 说明 | 备注 |
|----|------|------|
| not_started | 未开始 | 尚未到开售时间 |
| on_sale | 在售 | 可购票 |
| sold_out | 售罄 | 已售完 |
| selling_soon | 即将开售 | 即将开始售票 |
| ongoing | 进行中 | 演出进行中 |
| ended | 已结束 | 场次已结束 |
| cancelled | 已取消 | 场次取消 |

### 5.4 选座方式 (seatSelectionMode)

| 值 | 说明 |
|----|------|
| select | 自选座 |
| auto | 系统自动选座 |

---

## 6. 页面交互建议

### 6.1 演出列表页

1. 顶部显示城市选择、类型筛选
2. 列表展示演出封面、名称、艺人、时间、价格区间
3. 点击进入演出详情页

### 6.2 演出详情页

1. 展示演出完整信息（封面、图片、简介、票档等）
2. 显示该演出下的所有场次列表
3. 点击场次进入场次详情/选座页

### 6.3 场次详情/选座页

1. 展示场次时间、场馆信息
2. 展示各票档价格及可售座位数
3. 根据选座方式展示选座UI（自选座/自动选座）
4. 显示限购规则、实名制要求等

---

## 7. 在线文档

访问 http://localhost:8080/doc.html 查看完整的 Knife4j API 文档（含调试功能）

---

**文档更新记录**:

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2026-02-09 | 初始版本，包含演出、场次、场馆基础查询接口 |
