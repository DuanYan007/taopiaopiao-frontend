# Seat-Template-Service（座位模板服务）API 文档

> **版本**: v1.0.0
> **更新时间**: 2026-02-24
> **服务端口**: 8085
>
> **Base URL**:
> - 直连服务: `http://localhost:8085`
> - 通过网关: `http://localhost:8080`

---

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

## 快速导航

| 模块 | 接口数 | 路径前缀 |
|------|--------|----------|
| 管理端-座位模板 | 6个 | `/admin/seat-templates` |
| 客户端-座位布局 | 1个 | `/client/seat-templates` |

---

# 管理端接口

## 1. 分页查询座位模板列表

**接口**: `GET /admin/seat-templates`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| name | String | 否 | 模板名称（模糊查询） | "大剧院" |
| venueId | Long | 否 | 场馆ID筛选 | 1 |
| templateCode | String | 否 | 模板编码 | "THEATER_STD_001" |
| layoutType | Integer | 否 | 布局类型筛选 | 1 |
| status | Integer | 否 | 状态筛选（0=禁用, 1=启用） | 1 |
| pageNum | Integer | 否 | 页码，默认1 | 1 |
| pageSize | Integer | 否 | 每页条数，默认10 | 10 |

**响应数据** `Result<SeatTemplatePageResponse>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "total": 10,
    "pageNum": 1,
    "pageSize": 10,
    "records": [
      {
        "id": 1,
        "name": "大剧院标准模板",
        "venueId": 1,
        "venueName": "北京大剧院",
        "templateCode": "THEATER_STD_001",
        "totalRows": 10,
        "totalSeats": 200,
        "layoutType": 1,
        "layoutTypeName": "普通",
        "layoutData": "{\"version\":\"1.0\",\"areas\":[...]}",
        "status": 1,
        "createdAt": "2026-02-24T10:00:00",
        "updatedAt": "2026-02-24T10:00:00"
      }
    ]
  },
  "timestamp": 1706745600000
}
```

---

## 2. 查询座位模板详情

**接口**: `GET /admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 模板ID |

**响应数据** `Result<SeatTemplateResponse>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "name": "大剧院标准模板",
    "venueId": 1,
    "venueName": "北京大剧院",
    "templateCode": "THEATER_STD_001",
    "totalRows": 10,
    "totalSeats": 200,
    "layoutType": 1,
    "layoutTypeName": "普通",
    "layoutData": "{\"version\":\"1.0\",\"areas\":[...]}",
    "status": 1,
    "createdAt": "2026-02-24T10:00:00",
    "updatedAt": "2026-02-24T10:00:00"
  },
  "timestamp": 1706745600000
}
```

---

## 3. 创建座位模板

**接口**: `POST /admin/seat-templates`

**请求体**:

```json
{
  "name": "大剧院标准模板",
  "venueId": 1,
  "templateCode": "THEATER_STD_001",
  "totalRows": 10,
  "totalSeats": 200,
  "layoutType": 1,
  "layoutData": "{\"version\":\"1.0\",\"areas\":[{\"areaCode\":\"A\",\"areaName\":\"A区\",\"rows\":[...]}]}"
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| name | String | 是 | 模板名称 | "大剧院标准模板" |
| venueId | Long | 是 | 关联场馆ID | 1 |
| templateCode | String | 是 | 模板编码（唯一） | "THEATER_STD_001" |
| totalRows | Integer | 是 | 总行数 | 10 |
| totalSeats | Integer | 是 | 总座位数 | 200 |
| layoutType | Integer | 是 | 布局类型（1-4） | 1 |
| layoutData | String | 是 | 座位布局数据（JSON字符串） | 见下方 |

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

## 4. 更新座位模板

**接口**: `PUT /admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 模板ID |

**请求体**（所有字段可选）:

```json
{
  "name": "大剧院标准模板V2",
  "totalRows": 12,
  "totalSeats": 240,
  "layoutType": 2,
  "layoutData": "{...}",
  "status": 1
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

## 5. 删除座位模板

**接口**: `DELETE /admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 模板ID |

**响应数据** `Result<Void>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 6. 根据场馆ID查询模板列表

**接口**: `GET /admin/seat-templates/venue/{venueId}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| venueId | Long | 是 | 场馆ID |

**业务规则**:
- 仅返回启用状态的模板（status = 1）
- 按创建时间升序排序

**响应数据** `Result<List<SeatTemplateResponse>>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": [
    {
      "id": 1,
      "name": "大剧院标准模板",
      "venueId": 1,
      "templateCode": "THEATER_STD_001",
      ...
    }
  ],
  "timestamp": 1706745600000
}
```

---

# 客户端接口

## 7. 获取座位布局

**接口**: `GET /client/seat-templates/{templateId}/layout`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| templateId | Long | 是 | 模板ID |

**响应数据** `Result<SeatLayoutResponse>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "templateId": 1,
    "templateName": "大剧院标准模板",
    "venueId": 1,
    "layoutType": 1,
    "layoutData": "{\"version\":\"1.0\",\"areas\":[...]}"
  },
  "timestamp": 1706745600000
}
```

---

# 数据模型说明

## SeatTemplateResponse 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 模板ID |
| name | String | 模板名称 |
| venueId | Long | 关联场馆ID |
| venueName | String | 场馆名称（关联查询） |
| templateCode | String | 模板编码 |
| totalRows | Integer | 总行数 |
| totalSeats | Integer | 总座位数 |
| layoutType | Integer | 布局类型 |
| layoutTypeName | String | 布局类型名称 |
| layoutData | String | 座位布局数据（JSON字符串） |
| status | Integer | 状态（0=禁用, 1=启用） |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |

---

# 枚举类型说明

## 布局类型 (layoutType)

| 值 | 说明 |
|----|------|
| 1 | 普通：全场统一价或简单分区 |
| 2 | VIP分区：明确的VIP/普通区域划分 |
| 3 | 混合：多种票档混合布局 |
| 4 | 自定义：完全自定义座位布局 |

## 状态 (status)

| 值 | 说明 |
|----|------|
| 0 | 禁用 |
| 1 | 启用 |

---

# 座位布局数据结构 (layoutData)

`layoutData` 是一个 JSON 字符串，结构如下：

```json
{
  "version": "1.0",
  "areas": [
    {
      "areaCode": "A",
      "areaName": "A区",
      "rows": [
        {
          "rowNum": 1,
          "rowLabel": "1排",
          "startSeat": 1,
          "endSeat": 20,
          "seatGap": 0,
          "seats": [
            {
              "seatNum": 1,
              "seatLabel": "1排1座",
              "available": true,
              "type": "normal"
            }
          ]
        }
      ]
    }
  ],
  "stage": {
    "type": "standard",
    "position": "top"
  }
}
```

## layoutData 字段说明

### 一级字段

| 字段 | 类型 | 说明 |
|------|------|------|
| version | String | 布局版本 |
| areas | Array | 区域列表 |
| stage | Object | 舞台信息（可选） |

### 区域对象 (areas[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| areaCode | String | 区域编码（如 "A", "VIP"） |
| areaName | String | 区域名称 |
| rows | Array | 行列表 |

### 行对象 (rows[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| rowNum | Integer | 行号 |
| rowLabel | String | 行标签（如 "1排"） |
| startSeat | Integer | 起始座位号 |
| endSeat | Integer | 结束座位号 |
| seatGap | Integer | 座位间隔（0=无间隔） |
| seats | Array | 座位明细列表（可选） |

### 座位对象 (seats[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| seatNum | Integer | 座位号 |
| seatLabel | String | 座位标签（如 "1排1座"） |
| available | Boolean | 是否可用 |
| type | String | 座位类型（normal/vip/loveseat） |

### 舞台对象 (stage)

| 字段 | 类型 | 说明 |
|------|------|------|
| type | String | 舞台类型（standard/thrust/arena） |
| position | String | 舞台位置（top/bottom/left/right） |

---

# 前端调用示例

## 1. 分页查询座位模板

```javascript
fetch('/admin/seat-templates?venueId=1&status=1&pageNum=1&pageSize=10')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('模板列表:', data.data.records);
      console.log('总数:', data.data.total);
    }
  });
```

## 2. 创建座位模板

```javascript
fetch('/admin/seat-templates', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '大剧院标准模板',
    venueId: 1,
    templateCode: 'THEATER_STD_001',
    totalRows: 10,
    totalSeats: 200,
    layoutType: 1,
    layoutData: JSON.stringify({
      version: '1.0',
      areas: [
        {
          areaCode: 'A',
          areaName: 'A区',
          rows: [
            {
              rowNum: 1,
              rowLabel: '1排',
              startSeat: 1,
              endSeat: 20,
              seatGap: 0
            }
          ]
        }
      ]
    })
  })
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('创建成功，模板ID:', data.data);
  }
});
```

## 3. 获取座位布局（客户端）

```javascript
fetch('/client/seat-templates/1/layout')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      const layoutData = JSON.parse(data.data.layoutData);
      renderSeatLayout(layoutData);
    }
  });

function renderSeatLayout(layout) {
  layout.areas.forEach(area => {
    console.log('区域:', area.areaName);
    area.rows.forEach(row => {
      console.log('行:', row.rowLabel, '座位数:', row.endSeat - row.startSeat + 1);
    });
  });
}
```

## 4. 删除座位模板

```javascript
fetch('/admin/seat-templates/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('删除成功');
  }
});
```
