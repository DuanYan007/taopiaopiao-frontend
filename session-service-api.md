    # Session-Service（场次服务）API 文档

> **版本**: v1.0.0
> **更新时间**: 2026-02-24
> **服务端口**: 8083
>
> **Base URL**:
> - 直连服务: `http://localhost:8083`
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

## 1. 分页查询场次列表

**接口**: `GET /admin/sessions`

**请求参数** (`QueryParams`):

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| keyword | String | 否 | 关键词搜索（场次名称） | "19:30" |
| eventId | Long | 否 | 演出ID筛选 | 18 |
| status | String | 否 | 状态筛选 | "on_sale" |
| page | Integer | 否 | 页码，默认1 | 1 |
| pageSize | Integer | 否 | 每页条数，默认10 | 10 |

**响应数据** `Result<SessionPageResponse>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "list": [
      {
        "id": 1,
        "eventId": 18,
        "eventName": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "sessionName": "2025-03-15 19:30场",
        "startTime": "2025-03-15 19:30:00",
        "endTime": "2025-03-15 22:30:00",
        "seatTemplateId": 1,
        "address": "上海市黄浦区XXX路",
        "availableSeats": 1000,
        "soldSeats": 500,
        "lockedSeats": 50,
        "status": "on_sale",
        "metadata": {
          "duration": 180,
          "saleStartTime": "2025-02-01 10:00:00",
          "saleEndTime": "2025-03-15 17:30:00",
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
    "total": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  },
  "timestamp": 1706745600000
}
```

---

## 2. 查询场次详情

**接口**: `GET /admin/sessions/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 场次ID |

**响应数据** `Result<SessionResponse>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "eventId": 18,
    "eventName": "周杰伦2025嘉年华世界巡回演唱会-上海站",
    "sessionName": "2025-03-15 19:30场",
    "startTime": "2025-03-15 19:30:00",
    "endTime": "2025-03-15 22:30:00",
    "seatTemplateId": 1,
    "address": "上海市黄浦区XXX路",
    "availableSeats": 1000,
    "soldSeats": 500,
    "lockedSeats": 50,
    "status": "on_sale",
    "metadata": {
      "duration": 180,
      "saleStartTime": "2025-02-01 10:00:00",
      "saleEndTime": "2025-03-15 17:30:00",
      "seatSelectionMode": "online",
      "requireRealName": true,
      "limitOnePerPerson": false,
      "noRefund": false,
      "sortOrder": 100,
      "remark": ""
    },
    "createdAt": "2025-01-01 10:00:00",
    "updatedAt": "2025-01-01 10:00:00"
  },
  "timestamp": 1706745600000
}
```

---

## 3. 创建场次

**接口**: `POST /admin/sessions`

**请求体** `SessionCreateRequest`:

```json
{
  "eventId": 18,
  "sessionName": "2025-03-15 19:30场",
  "startTime": "2025-03-15T19:30:00",
  "endTime": "2025-03-15T22:30:00",
  "address": "上海市黄浦区XXX路",
  "seatTemplateId": 1,
  "status": "not_started",
  "metadata": {
    "duration": 180,
    "saleStartTime": "2025-02-01T10:00:00",
    "saleEndTime": "2025-03-15T17:30:00",
    "seatSelectionMode": "online",
    "requireRealName": true,
    "limitOnePerPerson": false,
    "noRefund": false,
    "sortOrder": 100,
    "remark": ""
  }
}
```

**字段说明**:

| 字段 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| eventId | Long | 是 | 所属演出ID | 18 |
| sessionName | String | 是 | 场次名称 | "2025-03-15 19:30场" |
| startTime | LocalDateTime | 是 | 场次开始时间 | "2025-03-15T19:30:00" |
| endTime | LocalDateTime | 是 | 场次结束时间 | "2025-03-15T22:30:00" |
| address | String | 否 | 详细地址 | "上海市黄浦区XXX路" |
| seatTemplateId | Long | 是 | 座位模板ID | 1 |
| status | String | 是 | 状态 | "not_started" |
| metadata | Object | 否 | 扩展配置 | 见下方 |

**metadata 扩展配置说明**:

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| duration | Integer | 演出时长（分钟） | 180 |
| saleStartTime | LocalDateTime | 开售时间 | "2025-02-01T10:00:00" |
| saleEndTime | LocalDateTime | 停售时间 | "2025-03-15T17:30:00" |
| seatSelectionMode | String | 选座方式 | "online" |
| requireRealName | Boolean | 是否实名制购票 | true |
| limitOnePerPerson | Boolean | 每人限购1张 | false |
| noRefund | Boolean | 禁止退票 | false |
| sortOrder | Integer | 排序权重 | 100 |
| remark | String | 备注 | "" |

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

## 4. 更新场次

**接口**: `PUT /admin/sessions/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 场次ID |

**请求体** `SessionUpdateRequest`:

```json
{
  "eventId": 18,
  "sessionName": "2025-03-15 19:30场",
  "startTime": "2025-03-15T19:30:00",
  "endTime": "2025-03-15T22:30:00",
  "address": "上海市黄浦区XXX路",
  "seatTemplateId": 1,
  "status": "on_sale",
  "metadata": {
    "duration": 180,
    "saleStartTime": "2025-02-01T10:00:00",
    "saleEndTime": "2025-03-15T17:30:00",
    "seatSelectionMode": "online",
    "requireRealName": true,
    "limitOnePerPerson": false,
    "noRefund": false,
    "sortOrder": 100,
    "remark": ""
  }
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

## 5. 删除场次

**接口**: `DELETE /admin/sessions/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 场次ID |

**业务规则**:
- 已有订单的场次无法删除（soldSeats > 0）
- 已结束的场次不允许删除（status = ended）

**响应数据** `Result<Void>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 6. 更新场次状态

**接口**: `PUT /admin/sessions/{id}/status`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | 是 | 场次ID |

**请求体**:

```json
{
  "status": "on_sale"
}
```

**请求参数**:

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| status | String | 是 | 状态值 | "on_sale" |

**响应数据** `Result<Void>`:

```json
{
  "code": 200,
  "msg": "操作成功",
  "timestamp": 1706745600000
}
```

---

## 枚举类型说明

### 场次状态 (status)

| 值 | 说明 |
|----|------|
| not_started | 未开始 |
| on_sale | 在售 |
| sold_out | 已售完 |
| ended | 已结束 |
| off_sale | 停售 |

### 选座方式 (seatSelectionMode)

| 值 | 说明 |
|----|------|
| online | 在线选座 |
| auto | 自动排座 |

---

## SessionResponse 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 场次ID |
| eventId | Long | 演出ID |
| eventName | String | 演出名称（关联查询） |
| sessionName | String | 场次名称 |
| startTime | String | 场次开始时间 |
| endTime | String | 场次结束时间 |
| seatTemplateId | Long | 座位模板ID |
| address | String | 详细地址 |
| availableSeats | Integer | 可售座位数 |
| soldSeats | Integer | 已售座位数 |
| lockedSeats | Integer | 锁定座位数 |
| status | String | 状态 |
| metadata | Object | 扩展配置 |
| createdAt | String | 创建时间 |
| updatedAt | String | 更新时间 |

---

## 错误码说明

| 错误码 | 说明 | 示例 |
|--------|------|------|
| 200 | 操作成功 | 创建/更新/删除成功 |
| 400 | 请求错误 | 参数错误、业务规则校验失败 |
| 404 | 资源不存在 | 场次不存在 |
| 500 | 服务器错误 | 内部错误 |

---

## 前端调用示例

### 1. 分页查询场次列表

```javascript
// 使用 fetch API
fetch('/admin/sessions?eventId=18&status=on_sale&page=1&pageSize=10')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('场次列表:', data.data.list);
      console.log('总数:', data.data.total);
    }
  });
```

### 2. 创建场次

```javascript
fetch('/admin/sessions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventId: 18,
    sessionName: '2025-03-15 19:30场',
    startTime: '2025-03-15T19:30:00',
    endTime: '2025-03-15T22:30:00',
    seatTemplateId: 1,
    status: 'not_started',
    metadata: {
      duration: 180,
      saleStartTime: '2025-02-01T10:00:00',
      saleEndTime: '2025-03-15T17:30:00',
      seatSelectionMode: 'online'
    }
  })
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('创建成功，场次ID:', data.data);
  }
});
```

### 3. 更新场次状态

```javascript
fetch('/admin/sessions/1/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'on_sale'
  })
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('状态更新成功');
  }
});
```

### 4. 删除场次

```javascript
fetch('/admin/sessions/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('删除成功');
  } else if (data.code === 400) {
    alert(data.msg); // "该场次已有订单，无法删除" 或 "已结束的场次不允许删除"
  }
});
```
