# 淘票票系统 - 演出与场次模块反向建模报告

> 基于前端页面 `admin-events.html` 和 `admin-sessions.html` 反向推导

---

## 一、系统概览

### 系统名称
淘票票 - 演出票务管理系统

### 系统类型
票务电商系统 + 演出活动管理平台

### 核心业务流程

```
1. 管理员创建演出（Event）
   ├── 填写演出基本信息（名称、类型、艺人、城市、描述等）
   ├── 配置票档价格（VIP、普通、学生票等）
   └── 设置状态（草稿/上架/下架）

2. 管理员为演出添加场次（Session）
   ├── 选择所属演出
   ├── 设置场次时间（开始时间、结束时间）
   ├── 指定场馆
   ├── 配置座位图和票档映射
   └── 设置销售状态（未开始/销售中/已结束/已下架）

3. 用户浏览并购票
   ├── 查看演出列表（按类型、城市筛选）
   ├── 选择场次
   ├── 选择座位
   └── 创建订单并支付

4. 场次销售监控
   ├── 实时统计可售/已售座位
   ├── 自动更新状态（售罄、即将售罄）
   └── 支持批量操作
```

---

## 二、核心业务实体

### 1. Event（演出）
- **业务含义**: 演出活动的基本信息抽象，一个演出可以有多个场次
- **关系**:
  - 1:N → Session（一个演出有多个场次）
  - 1:N → TicketTier（一个演出有多个票档）
  - 1:N → Order（一个演出产生多个订单）
  - 1:N → Favorite（一个演出可被多个用户收藏）

### 2. Session（场次）
- **业务含义**: 演出的具体安排，包含时间、场馆、座位信息
- **关系**:
  - N:1 → Event（多个场次属于一个演出）
  - 1:N → Seat（一个场次有多个座位）
  - 1:N → OrderItem（一个场次包含多个订单项）
  - N:1 → Venue（多个场次可以在同一场馆）

### 3. TicketTier（票档）
- **业务含义**: 演出的票价等级（如：VIP内场、看台一等、学生票）
- **关系**:
  - N:1 → Event（多个票档属于一个演出）
  - 1:N → Seat（一个票档对应多个座位）

### 4. Seat（座位）
- **业务含义**: 具体的物理座位，包含状态（可售/已售/锁定）
- **关系**:
  - N:1 → Session（多个座位属于一个场次）
  - N:1 → TicketTier（多个座位对应一个票档）
  - 1:1 → OrderItem（一个座位对应一个订单项）

### 5. Venue（场馆）
- **业务含义**: 演出举办的物理场所
- **关系**:
  - 1:N → Session（一个场馆举办多场次）

---

## 三、数据库设计

### 3.1 events（演出表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | BIGINT | ✅ | 主键，自增 |
| name | VARCHAR(200) | ✅ | 演出名称 |
| subtitle | VARCHAR(200) | ❌ | 副标题/描述 |
| type | ENUM | ✅ | 演出类型：concert（演唱会）、theatre（话剧歌剧）、exhibition（展览休闲）、sports（体育）、music（音乐会）、kids（儿童亲子） |
| artist | VARCHAR(100) | ❌ | 艺人/主办方 |
| city | VARCHAR(50) | ✅ | 城市 |
| venue_id | BIGINT | ❌ | 默认场馆ID（外键 → venues.id） |
| description | TEXT | ❌ | 演出详情描述 |
| cover_image | VARCHAR(500) | ❌ | 封面图片URL |
| images | JSON | ❌ | 图片数组（多图） |
| min_price | DECIMAL(10,2) | ❌ | 最低票价（冗余字段，便于查询） |
| max_price | DECIMAL(10,2) | ❌ | 最高票价（冗余字段） |
| status | ENUM | ✅ | 状态：draft（草稿）、on_sale（上架）、off_sale（下架）、sold_out（已售罄） |
| created_at | DATETIME | ✅ | 创建时间 |
| updated_at | DATETIME | ✅ | 更新时间 |
| created_by | BIGINT | ❌ | 创建人ID（外键 → admin_users.id） |

**主键**: `id`
**索引**:
- `idx_type` (type)
- `idx_city` (city)
- `idx_status` (status)
- `idx_artist` (artist)
- `idx_created_at` (created_at)

---

### 3.2 sessions（场次表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | BIGINT | ✅ | 主键，自增 |
| event_id | BIGINT | ✅ | 所属演出ID（外键 → events.id） |
| session_name | VARCHAR(200) | ❌ | 场次名称（可自定义） |
| start_time | DATETIME | ✅ | 场次开始时间 |
| end_time | DATETIME | ❌ | 场次结束时间 |
| venue_id | BIGINT | ✅ | 场馆ID（外键 → venues.id） |
| hall_name | VARCHAR(100) | ❌ | 馆厅名称（如：主馆、副馆） |
| address | VARCHAR(500) | ❌ | 详细地址 |
| total_seats | INT | ✅ | 总座位数 |
| available_seats | INT | ✅ | 可售座位数 |
| sold_seats | INT | ✅ | 已售座位数（冗余，便于查询） |
| locked_seats | INT | ✅ | 锁定座位数（占用中） |
| min_price | DECIMAL(10,2) | ❌ | 本场次最低价 |
| max_price | DECIMAL(10,2) | ❌ | 本场次最高价 |
| status | ENUM | ✅ | 状态：not_started（未开始）、on_sale（销售中）、sold_out（已售罄）、ended（已结束）、off_sale（已下架） |
| seat_map_config | JSON | ❌ | 座位图配置（布局、行数、列数等） |
| ticket_tier_config | JSON | ❌ | 票档配置（本场的票档及价格） |
| metadata | JSON | ❌ | 扩展字段 |
| created_at | DATETIME | ✅ | 创建时间 |
| updated_at | DATETIME | ✅ | 更新时间 |

**主键**: `id`
**外键**:
- `event_id` → `events.id`
- `venue_id` → `venues.id`

**索引**:
- `idx_event_id` (event_id)
- `idx_start_time` (start_time)
- `idx_status` (status)
- `idx_venue_id` (venue_id)

---

### 3.3 ticket_tiers（票档表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | BIGINT | ✅ | 主键，自增 |
| event_id | BIGINT | ✅ | 所属演出ID（外键 → events.id） |
| name | VARCHAR(50) | ✅ | 票档名称（如：VIP内场、看台一等） |
| price | DECIMAL(10,2) | ✅ | 票价 |
| color | VARCHAR(20) | ❌ | 座位图显示颜色（如：#FF5722） |
| description | VARCHAR(200) | ❌ | 说明（如：含周边礼包） |
| sort_order | INT | ✅ | 排序序号（越小越靠前） |
| max_purchase | INT | ❌ | 每单限购数量 |
| is_active | BOOLEAN | ✅ | 是否启用 |
| metadata | JSON | ❌ | 扩展字段 |
| created_at | DATETIME | ✅ | 创建时间 |

**主键**: `id`
**外键**:
- `event_id` → `events.id`

**索引**:
- `idx_event_id` (event_id)

---

### 3.4 venues（场馆表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | BIGINT | ✅ | 主键，自增 |
| name | VARCHAR(100) | ✅ | 场馆名称 |
| city | VARCHAR(50) | ✅ | 所在城市 |
| district | VARCHAR(50) | ❌ | 所在区域 |
| address | VARCHAR(500) | ✅ | 详细地址 |
| latitude | DECIMAL(10,6) | ❌ | 纬度 |
| longitude | DECIMAL(10,6) | ❌ | 经度 |
| capacity | INT | ❌ | 容纳人数 |
| facilities | JSON | ❌ | 设施数组（如：["停车场", "地铁"]） |
| description | TEXT | ❌ | 场馆介绍 |
| images | JSON | ❌ | 场馆图片 |
| metadata | JSON | ❌ | 扩展字段 |
| created_at | DATETIME | ✅ | 创建时间 |
| updated_at | DATETIME | ✅ | 更新时间 |

**主键**: `id`
**索引**:
- `idx_city` (city)

---

### 3.5 seats（座位表）

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | BIGINT | ✅ | 主键，自增 |
| session_id | BIGINT | ✅ | 所属场次ID（外键 → sessions.id） |
| ticket_tier_id | BIGINT | ❌ | 票档ID（外键 → ticket_tiers.id） |
| seat_row | VARCHAR(20) | ✅ | 行号（如：1排、A排） |
| seat_column | VARCHAR(20) | ✅ | 列号（如：5号、12座） |
| seat_number | VARCHAR(50) | ✅ | 完整座位号（如：1排5号） |
| area | VARCHAR(50) | ❌ | 区域（如：内场、看台） |
| price | DECIMAL(10,2) | ✅ | 本座位价格 |
| status | ENUM | ✅ | 状态：available（可售）、sold（已售）、locked（锁定）、unavailable（不可用） |
| locked_by | BIGINT | ❌ | 锁定者（订单ID或用户ID） |
| locked_until | DATETIME | ❌ | 锁定过期时间 |
| order_id | BIGINT | ❌ | 订单ID（已售时） |
| metadata | JSON | ❌ | 扩展字段 |
| created_at | DATETIME | ✅ | 创建时间 |
| updated_at | DATETIME | ✅ | 更新时间 |

**主键**: `id`
**外键**:
- `session_id` → `sessions.id`
- `ticket_tier_id` → `ticket_tiers.id`
- `order_id` → `orders.id`

**索引**:
- `idx_session_id` (session_id)
- `idx_status` (status)
- `idx_seat_number` (seat_number)
- `idx_locked_until` (locked_until)

---

## 四、API 接口设计（RESTful）

### 4.1 演出管理接口

#### `GET /api/admin/events`
**描述**: 获取演出列表（分页、筛选）

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | INT | ❌ | 页码，默认1 |
| page_size | INT | ❌ | 每页数量，默认20 |
| keyword | STRING | ❌ | 搜索关键词（演出名称、艺人） |
| type | ENUM | ❌ | 演出类型 |
| city | STRING | ❌ | 城市 |
| status | ENUM | ❌ | 状态（draft/on_sale/off_sale/sold_out） |
| sort_by | STRING | ❌ | 排序字段（created_at/min_price） |
| sort_order | STRING | ❌ | 排序方向（asc/desc） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 8,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "id": 1001,
        "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "subtitle": "嘉年华世界巡回演唱会",
        "type": "concert",
        "artist": "周杰伦",
        "city": "上海",
        "status": "on_sale",
        "min_price": 380.00,
        "max_price": 2580.00,
        "cover_image": "https://...",
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

#### `POST /api/admin/events`
**描述**: 创建新演出

**请求体**:
```json
{
  "name": "周杰伦演唱会",
  "subtitle": "嘉年华世界巡回演唱会-上海站",
  "type": "concert",
  "artist": "周杰伦",
  "city": "上海",
  "venue_id": 1,
  "description": "演出详情...",
  "cover_image": "https://...",
  "images": ["https://...", "https://..."],
  "sale_start_time": "2025-02-01T10:00:00Z",
  "sale_end_time": "2025-03-15T23:59:59Z",
  "tags": ["热门", "推荐"],
  "ticket_tiers": [
    {
      "name": "VIP内场",
      "price": 2580.00,
      "color": "#FF5722",
      "description": "含周边礼包",
      "max_purchase": 4
    },
    {
      "name": "看台一等",
      "price": 1880.00,
      "color": "#2196F3"
    }
  ]
}
```

**响应**:
```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": 1009,
    "created_at": "2025-01-26T10:00:00Z"
  }
}
```

---

#### `GET /api/admin/events/{id}`
**描述**: 获取演出详情

**路径参数**:
- `id`: 演出ID

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1001,
    "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
    "type": "concert",
    "artist": "周杰伦",
    "city": "上海",
    "venue": {
      "id": 1,
      "name": "国家体育场（鸟巢）",
      "address": "北京市朝阳区国家体育场南路1号"
    },
    "ticket_tiers": [
      {
        "id": 1,
        "name": "VIP内场",
        "price": 2580.00,
        "color": "#FF5722"
      }
    ],
    "sessions": [
      {
        "id": 1,
        "start_time": "2025-03-15T19:30:00Z",
        "status": "on_sale"
      }
    ],
    "statistics": {
      "total_sessions": 3,
      "total_sold": 15234,
      "total_amount": 25800000.00
    }
  }
}
```

---

#### `PUT /api/admin/events/{id}`
**描述**: 更新演出信息

**请求体**: 同 `POST /api/admin/events`（全部或部分字段）

**响应**:
```json
{
  "code": 0,
  "message": "更新成功"
}
```

---

#### `PATCH /api/admin/events/{id}/status`
**描述**: 修改演出状态（上架/下架）

**请求体**:
```json
{
  "status": "off_sale",
  "reason": "演出延期"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "状态修改成功"
}
```

---

#### `DELETE /api/admin/events/{id}`
**描述**: 删除演出（软删除）

**响应**:
```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

### 4.2 场次管理接口

#### `GET /api/admin/sessions`
**描述**: 获取场次列表

**Query参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | INT | ❌ | 页码 |
| page_size | INT | ❌ | 每页数量 |
| event_id | BIGINT | ❌ | 所属演出ID |
| keyword | STRING | ❌ | 搜索关键词 |
| status | ENUM | ❌ | 状态（not_started/on_sale/sold_out/ended/off_sale） |
| date_from | DATE | ❌ | 开始日期筛选 |
| date_to | DATE | ❌ | 结束日期筛选 |
| venue_id | BIGINT | ❌ | 场馆ID |

**响应示例**:
```json
{
  "code": 0,
  "data": {
    "total": 156,
    "items": [
      {
        "id": 1,
        "event": {
          "id": 1001,
          "name": "周杰伦演唱会",
          "subtitle": "嘉年华世界巡回演唱会"
        },
        "start_time": "2025-03-15T19:30:00Z",
        "venue": {
          "id": 1,
          "name": "国家体育场（鸟巢）"
        },
        "min_price": 380.00,
        "max_price": 2580.00,
        "total_seats": 8560,
        "available_seats": 2326,
        "sold_seats": 6234,
        "status": "on_sale"
      }
    ]
  }
}
```

---

#### `POST /api/admin/sessions`
**描述**: 创建新场次

**请求体**:
```json
{
  "event_id": 1001,
  "start_time": "2025-03-15T19:30:00Z",
  "end_time": "2025-03-15T22:30:00Z",
  "venue_id": 1,
  "hall_name": "主馆",
  "ticket_tier_config": [
    {
      "tier_id": 1,
      "price": 2580.00,
      "seat_count": 500
    }
  ],
  "seat_map_config": {
    "rows": 50,
    "columns": 100,
    "areas": ["内场", "看台一等", "看台二等"]
  }
}
```

**响应**:
```json
{
  "code": 0,
  "message": "场次创建成功",
  "data": {
    "id": 157,
    "total_seats": 8560
  }
}
```

---

#### `GET /api/admin/sessions/{id}`
**描述**: 获取场次详情（含座位图）

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "event": {
      "id": 1001,
      "name": "周杰伦演唱会"
    },
    "start_time": "2025-03-15T19:30:00Z",
    "venue": {
      "id": 1,
      "name": "国家体育场（鸟巢）",
      "address": "北京市朝阳区国家体育场南路1号"
    },
    "seat_map": {
      "layout": "grid",
      "rows": 50,
      "columns": 100,
      "seats": [
        {
          "row": "1",
          "column": "5",
          "tier": "VIP内场",
          "price": 2580.00,
          "status": "available"
        }
      ]
    },
    "statistics": {
      "total_seats": 8560,
      "available_seats": 2326,
      "sold_seats": 6234,
      "locked_seats": 0
    }
  }
}
```

---

#### `PUT /api/admin/sessions/{id}`
**描述**: 更新场次信息

**请求体**: 同 `POST /api/admin/sessions`

**响应**:
```json
{
  "code": 0,
  "message": "场次更新成功"
}
```

---

#### `PATCH /api/admin/sessions/{id}/status`
**描述**: 修改场次状态

**请求体**:
```json
{
  "status": "off_sale",
  "reason": "天气原因"
}
```

---

#### `GET /api/admin/events/{event_id}/sessions`
**描述**: 获取指定演出的所有场次

**路径参数**:
- `event_id`: 演出ID

**响应**:
```json
{
  "code": 0,
  "data": {
    "event_id": 1001,
    "sessions": [
      {
        "id": 1,
        "start_time": "2025-03-15T19:30:00Z",
        "venue": "国家体育场（鸟巢）",
        "status": "on_sale"
      }
    ]
  }
}
```

---

#### `POST /api/admin/sessions/batch-update`
**描述**: 批量更新场次状态

**请求体**:
```json
{
  "session_ids": [1, 2, 3],
  "action": "off_sale",
  "reason": "批量下架"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "成功更新3个场次",
  "data": {
    "success_count": 3,
    "failed_ids": []
  }
}
```

---

#### `DELETE /api/admin/sessions/{id}`
**描述**: 删除场次（软删除）

---

### 4.3 统计分析接口

#### `GET /api/admin/events/{id}/statistics`
**描述**: 获取演出统计数据

**响应**:
```json
{
  "code": 0,
  "data": {
    "event_id": 1001,
    "total_sessions": 3,
    "total_sold": 15234,
    "total_amount": 25800000.00,
    "avg_price": 1693.50,
    "sell_rate": 0.72,
    "daily_sales": [
      {
        "date": "2025-01-25",
        "sold": 234,
        "amount": 396000.00
      }
    ]
  }
}
```

---

#### `GET /api/admin/sessions/{id}/seats-status`
**描述**: 获取场次座位状态统计

**响应**:
```json
{
  "code": 0,
  "data": {
    "session_id": 1,
    "total_seats": 8560,
    "available_seats": 2326,
    "sold_seats": 6234,
    "locked_seats": 0,
    "by_tier": [
      {
        "tier_name": "VIP内场",
        "total": 500,
        "available": 120,
        "sold": 380,
        "locked": 0
      }
    ]
  }
}
```

---

## 五、业务规则与约束

### 5.1 状态机规则

**演出状态**:
```
draft（草稿） → on_sale（上架） → off_sale（下架） / sold_out（已售罄）
           ↑                      ↓
           └──────────────────────┘
```

**场次状态**:
```
not_started（未开始） → on_sale（销售中） → sold_out（已售罄） / ended（已结束）
                      ↓
                      off_sale（已下架）
```

### 5.2 数据约束

1. **演出必须至少有一个票档**
2. **场次必须关联到已存在的演出**
3. **座位数 = 可售 + 已售 + 锁定 + 不可用**
4. **已售座位的订单ID不能为空**
5. **锁定的座位必须有锁定过期时间**

### 5.3 价格逻辑

- 演出的 `min_price` / `max_price` 由其所有票档价格计算得出
- 场次的 `min_price` / `max_price` 可独立配置（覆盖演出的价格）
- 座位价格 = 票档价格（可特殊调整）

---

## 六、扩展性设计

### 6.1 metadata 字段用途

**events.metadata**:
```json
{
  "age_limit": "18+",
  "refund_policy": "不支持退换",
  "special_note": "演出前2小时停止入场",
  "custom_fields": {
    "producer": "某某制作公司",
    "duration": "120分钟"
  }
}
```

**sessions.metadata**:
```json
{
  "entrance": "A入口",
  "parking_info": "地下停车场B2层",
  "checkin_time": "18:30",
  "forbidden_items": ["相机", "专业摄录设备"]
}
```

### 6.2 未来可扩展功能

1. **演出审核工作流**: 增加 `review_status` 字段
2. **动态定价**: 增加 `dynamic_pricing` 配置
3. **会员折扣**: 在 `ticket_tiers` 增加会员价字段
4. **场次延迟**: 支持修改场次时间并通知用户
5. **座位推荐**: 基于用户偏好的智能推荐

---

## 七、技术实现建议

### 7.1 数据库优化

1. **索引优化**: 为高频查询字段（status、city、type）建立复合索引
2. **分区表**: sessions 表按 `start_time` 分区（按月）
3. **读写分离**: 统计查询走从库，写操作走主库
4. **缓存策略**: Redis缓存热门演出的场次信息

### 7.2 并发控制

1. **座位锁定**: 使用 Redis 实现分布式锁，防止超卖
2. **库存扣减**: 使用数据库乐观锁或队列方式
3. **状态机**: 使用状态模式确保状态变更的原子性

### 7.3 API 性能优化

1. **分页**: 默认 page_size=20，最大100
2. **字段过滤**: 支持请求参数 `fields=name,status,price`
3. **批量接口**: 支持批量查询演出/场次信息
4. **GraphQL**: 考虑未来引入 GraphQL 替代 RESTful

---

## 八、与前端页面的映射关系

### admin-events.html 页面需求

| 前端元素 | 对应数据/接口 |
|---------|--------------|
| 搜索框 | `GET /api/admin/events?keyword=` |
| 状态筛选 | `GET /api/admin/events?status=` |
| 类型筛选 | `GET /api/admin/events?type=` |
| 列表数据 | `GET /api/admin/events` |
| "新建演出"按钮 | `POST /api/admin/events` |
| 查看按钮 | `GET /api/admin/events/{id}` |
| 编辑按钮 | `PUT /api/admin/events/{id}` |
| 下架按钮 | `PATCH /api/admin/events/{id}/status` |
| 价格区间 | `events.min_price`, `events.max_price` |

### admin-sessions.html 页面需求

| 前端元素 | 对应数据/接口 |
|---------|--------------|
| 演出筛选 | `GET /api/admin/sessions?event_id=` |
| 状态筛选 | `GET /api/admin/sessions?status=` |
| 列表数据 | `GET /api/admin/sessions` |
| "新增场次"按钮 | `POST /api/admin/sessions` |
| 场次时间 | `sessions.start_time` |
| 可售/已售座位 | `sessions.available_seats`, `sessions.sold_seats` |
| 票价范围 | `sessions.min_price`, `sessions.max_price` |
| 批量操作 | `POST /api/admin/sessions/batch-update` |

---

## 九、总结

本反向建模报告基于两个前端管理页面（演出管理、场次管理），完整推导出了：

1. **5个核心业务实体**: Event、Session、TicketTier、Venue、Seat
2. **5个数据库表设计**: 包含完整的字段定义、索引、外键关系
3. **20+个RESTful API接口**: 覆盖CRUD、筛选、统计、批量操作
4. **业务规则与约束**: 状态机、数据约束、价格逻辑
5. **扩展性设计**: metadata字段、未来功能预留
6. **技术实现建议**: 性能优化、并发控制

该设计可直接用于后端开发，支持票务系统的核心业务流程。

---

**生成时间**: 2025-01-26
**分析文件**: admin-events.html, admin-sessions.html
**系统**: 淘票票票务管理平台
