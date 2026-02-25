
# 座位模板服务 API 接口文档

> **版本**: v1.0.0
> **更新时间**: 2026-02-23
> **服务端口**: 8085
>
> **Base URL**:
> - 直连服务: `http://localhost:8085`
> - 通过网关: `http://localhost:8080`
> - 通过 Nginx: `http://localhost/api/`（推荐）

---

## 快速导航

| 模块 | 接口数 | 路径前缀 |
|------|--------|----------|
| 管理端-座位模板 | 6个 | `/admin/seat-templates` |
| 客户端-座位布局 | 1个 | `/client/seat-templates` |

---

## 1. 通用说明

### 1.1 Nginx 代理配置

所有 API 请求均通过 Nginx 代理到后端网关：

```nginx
location /api/ {
    proxy_pass http://localhost:8080/;
}
```

因此，前端调用 API 时需要添加 `/api/` 前缀，例如：
- 后端接口: `/admin/seat-templates`
- 前端调用: `/api/admin/seat-templates`

### 1.2 统一响应格式

所有接口返回格式均为：

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {},
  "timestamp": 1740307200000
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | int | 状态码，200表示成功，其他表示失败 |
| msg | string | 响应消息 |
| data | object/array | 业务数据 |
| timestamp | long | 服务器时间戳（毫秒） |

### 1.3 通用状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 操作成功 |
| 400 | 客户端请求错误（参数错误、业务规则校验失败等） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 2. 管理端接口

### 2.1 分页查询座位模板

**接口地址**: `GET /api/admin/seat-templates`

**后端路由**: `/admin/seat-templates`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 模板名称（模糊查询） |
| venueId | long | 否 | 场馆ID筛选 |
| templateCode | string | 否 | 模板编码 |
| layoutType | int | 否 | 布局类型筛选（1=普通, 2=VIP分区, 3=混合, 4=自定义） |
| status | int | 否 | 状态筛选（0=禁用, 1=启用） |
| pageNum | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认10 |

**响应示例**:

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
        "layoutData": "{\"areas\":[...]}",
        "status": 1,
        "createdAt": "2026-02-23T10:00:00",
        "updatedAt": "2026-02-23T10:00:00"
      }
    ]
  },
  "timestamp": 1740307200000
}
```

---

### 2.2 查询座位模板详情

**接口地址**: `GET /api/admin/seat-templates/{id}`

**后端路由**: `/admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 模板ID |

**响应示例**: 同 [2.1 分页查询](#21-分页查询座位模板) 中的单个模板对象

---

### 2.3 创建座位模板

**接口地址**: `POST /api/admin/seat-templates`

**后端路由**: `/admin/seat-templates`

**请求体**:

```json
{
  "name": "大剧院标准模板",
  "venueId": 1,
  "templateCode": "THEATER_STD_001",
  "totalRows": 10,
  "totalSeats": 200,
  "layoutType": 1,
  "layoutData": "{\"areas\":[{\"areaCode\":\"A\",\"areaName\":\"A区\",\"rows\":[...]}]}"
}
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| venueId | long | 是 | 关联场馆ID |
| templateCode | string | 是 | 模板编码（唯一） |
| totalRows | int | 是 | 总行数 |
| totalSeats | int | 是 | 总座位数 |
| layoutType | int | 是 | 布局类型（1=普通, 2=VIP分区, 3=混合, 4=自定义） |
| layoutData | string | 是 | 座位布局数据（JSON字符串，见下文结构说明） |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 1,
  "timestamp": 1740307200000
}
```

---

### 2.4 更新座位模板

**接口地址**: `PUT /api/admin/seat-templates/{id}`

**后端路由**: `/admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 模板ID |

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

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null,
  "timestamp": 1740307200000
}
```

---

### 2.5 删除座位模板

**接口地址**: `DELETE /api/admin/seat-templates/{id}`

**后端路由**: `/admin/seat-templates/{id}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | long | 是 | 模板ID |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null,
  "timestamp": 1740307200000
}
```

---

### 2.6 根据场馆ID查询模板列表

**接口地址**: `GET /api/admin/seat-templates/venue/{venueId}`

**后端路由**: `/admin/seat-templates/venue/{venueId}`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| venueId | long | 是 | 场馆ID |

**响应示例**:

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
  "timestamp": 1740307200000
}
```

---

## 3. 客户端接口

### 3.1 获取座位布局

**接口地址**: `GET /api/client/seat-templates/{templateId}/layout`

**后端路由**: `/client/seat-templates/{templateId}/layout`

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| templateId | long | 是 | 模板ID |

**响应示例**:

```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "templateId": 1,
    "templateName": "大剧院标准模板",
    "venueId": 1,
    "layoutType": 1,
    "layoutData": "{...}"
  },
  "timestamp": 1740307200000
}
```

---

## 4. 数据模型说明

### 4.1 座位模板对象 (SeatTemplateResponse)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | long | 模板ID |
| name | string | 模板名称 |
| venueId | long | 关联场馆ID |
| venueName | string | 场馆名称（可能为空） |
| templateCode | string | 模板编码 |
| totalRows | int | 总行数 |
| totalSeats | int | 总座位数 |
| layoutType | int | 布局类型 |
| layoutTypeName | string | 布局类型名称 |
| layoutData | string | 座位布局数据（JSON字符串） |
| status | int | 状态（0=禁用, 1=启用） |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

### 4.2 布局数据结构 (layoutData)

`layoutData` 是一个 JSON 字符串，结构如下：

```json
{
  "version": "1.0",
  "areas": [
    {
      "areaCode": "A",
      "areaName": "A区",
      "tierId": 1,
      "price": 280.00,
      "color": "#FF6B6B",
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

#### layoutData 字段说明

| 一级字段 | 类型 | 说明 |
|---------|------|------|
| version | string | 布局版本 |
| areas | array | 区域列表 |
| stage | object | 舞台信息（可选） |

#### 区域对象 (areas[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| areaCode | string | 区域编码（如 "A", "VIP"） |
| areaName | string | 区域名称 |
| tierId | long | 关联票档ID（可选） |
| price | decimal | 区域价格（可选） |
| color | string | 展示颜色（如 "#FF6B6B"） |
| rows | array | 行列表 |

#### 行对象 (rows[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| rowNum | int | 行号 |
| rowLabel | string | 行标签（如 "1排"） |
| startSeat | int | 起始座位号 |
| endSeat | int | 结束座位号 |
| seatGap | int | 座位间隔（0=无间隔） |
| seats | array | 座位明细列表（可选） |

#### 座位对象 (seats[i])

| 字段 | 类型 | 说明 |
|------|------|------|
| seatNum | int | 座位号 |
| seatLabel | string | 座位标签（如 "1排1座"） |
| available | boolean | 是否可用 |
| type | string | 座位类型（normal/vip/loveseat） |

#### 舞台对象 (stage)

| 字段 | 类型 | 说明 |
|------|------|------|
| type | string | 舞台类型（standard/thrust/arena） |
| position | string | 舞台位置（top/bottom/left/right） |

---

## 5. 数据字典

### 5.1 布局类型 (layoutType)

| 值 | 说明 |
|----|------|
| 1 | 普通：全场统一价或简单分区 |
| 2 | VIP分区：明确的VIP/普通区域划分 |
| 3 | 混合：多种票档混合布局 |
| 4 | 自定义：完全自定义座位布局 |

### 5.2 状态 (status)

| 值 | 说明 |
|----|------|
| 0 | 禁用 |
| 1 | 启用 |

---

## 6. 前端开发指南

### 6.1 座位布局数据解析

前端需要解析 `layoutData` JSON 字符串：

```javascript
// 响应数据中 layoutData 是字符串
const layoutData = JSON.parse(response.layoutData);

// 遍历区域
layoutData.areas.forEach(area => {
  console.log('区域:', area.areaName);

  // 遍历行
  area.rows.forEach(row => {
    console.log('行:', row.rowLabel, '座位数:', row.endSeat - row.startSeat + 1);
  });
});
```

### 6.2 渲染座位图

前端根据 `layoutData` 渲染座位图：

```javascript
function renderSeatLayout(layoutData) {
  const layout = JSON.parse(layoutData);
  const container = document.getElementById('seat-container');

  layout.areas.forEach(area => {
    const areaDiv = document.createElement('div');
    areaDiv.style.borderColor = area.color;

    area.rows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';
      rowDiv.dataset.row = row.rowNum;

      for (let i = row.startSeat; i <= row.endSeat; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.dataset.row = row.rowNum;
        seat.dataset.seat = i;
        seat.textContent = i;
        rowDiv.appendChild(seat);
      }

      areaDiv.appendChild(rowDiv);
    });

    container.appendChild(areaDiv);
  });
}
```

### 6.3 选座交互

用户点击座位时记录选中状态：

```javascript
const selectedSeats = [];

document.querySelectorAll('.seat').forEach(seat => {
  seat.addEventListener('click', function() {
    const rowNum = this.dataset.row;
    const seatNum = this.dataset.seat;

    if (this.classList.contains('selected')) {
      // 取消选择
      this.classList.remove('selected');
      const index = selectedSeats.findIndex(s => s.row === rowNum && s.seat === seatNum);
      if (index > -1) selectedSeats.splice(index, 1);
    } else {
      // 选择座位
      this.classList.add('selected');
      selectedSeats.push({ row: rowNum, seat: seatNum });
    }
  });
});
```

---

## 7. 错误处理

### 7.1 错误响应示例

```json
{
  "code": 404,
  "msg": "座位模板不存在",
  "data": null,
  "timestamp": 1740307200000
}
```

### 7.2 常见错误

| 错误码 | 说明 | 处理建议 |
|--------|------|----------|
| 400 | 参数错误 | 检查请求参数格式 |
| 404 | 模板不存在 | 检查模板ID是否正确 |
| 500 | 服务器错误 | 稍后重试或联系技术支持 |

---

## 9. 在线文档

访问以下地址查看完整的 Knife4j API 文档（含在线调试功能）：

| 访问方式 | 地址 |
|---------|------|
| 直连服务 | http://localhost:8085/doc.html |
| 通过网关 | http://localhost:8080/doc.html |
| 通过 Nginx | http://localhost/api/doc.html |

---

## 10. 前端开发指南（原生 JavaScript）

### 10.1 Nginx 配置说明

```nginx
server {
    listen 80;

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
    }

    # 管理端前端
    location /admin/ {
        alias html/admin/;
        index admin-index.html;
        try_files $uri $uri/ admin-index.html;
    }

    # 客户端前端
    location /client/ {
        alias html/client/;
        try_files $uri $uri/ client-index.html;
    }

    # 静态资源
    location /assets/ {
        root html;
    }
}
```

### 10.2 API 地址映射

由于 Nginx 配置，前端 API 调用需要遵循以下规则：

| 后端接口 | 前端调用地址 |
|---------|-------------|
| `/admin/seat-templates` | `/api/admin/seat-templates` |
| `/admin/seat-templates/{id}` | `/api/admin/seat-templates/{id}` |
| `/client/seat-templates/{id}/layout` | `/api/client/seat-templates/{id}/layout` |

### 10.3 原生 JavaScript 请求示例

```javascript
// 使用 fetch API
const API_BASE = '/api/';

// 获取模板列表
fetch(API_BASE + 'admin/seat-templates?pageNum=1&pageSize=10')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      console.log('模板列表:', data.data.records);
    }
  });

// 获取座位布局
fetch(API_BASE + 'client/seat-templates/1/layout')
  .then(res => res.json())
  .then(data => {
    if (data.code === 200) {
      const layoutData = JSON.parse(data.data.layoutData);
      renderSeatLayout(layoutData);
    }
  });

// 创建模板
fetch(API_BASE + 'admin/seat-templates', {
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
    layoutData: '{"areas":[...]}'
  })
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('创建成功，模板ID:', data.data);
  }
});

// 更新模板
fetch(API_BASE + 'admin/seat-templates/1', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: '大剧院标准模板V2',
    status: 1
  })
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('更新成功');
  }
});

// 删除模板
fetch(API_BASE + 'admin/seat-templates/1', {
  method: 'DELETE'
})
.then(res => res.json())
.then(data => {
  if (data.code === 200) {
    console.log('删除成功');
  }
});
```

### 10.4 封装请求工具示例

```javascript
// api.js - 请求工具封装
const API_BASE = '/api/';

function request(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  return fetch(API_BASE + url, config)
    .then(res => res.json())
    .then(data => {
      if (data.code !== 200) {
        throw new Error(data.msg || '请求失败');
      }
      return data;
    });
}

// GET 请求
function get(url, params) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return request(url + query, { method: 'GET' });
}

// POST 请求
function post(url, data) {
  return request(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// PUT 请求
function put(url, data) {
  return request(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// DELETE 请求
function del(url) {
  return request(url, { method: 'DELETE' });
}

// 使用示例
get('admin/seat-templates', { pageNum: 1, pageSize: 10 })
  .then(res => console.log(res.data));

post('admin/seat-templates', {
  name: '大剧院标准模板',
  venueId: 1,
  // ...其他字段
}).then(res => console.log('创建成功:', res.data));
```

---

## 11. 更新记录

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0.0 | 2026-02-23 | 初始版本，座位模板服务上线 |
| v1.0.1 | 2026-02-23 | 适配 Nginx 代理配置，添加 /api/ 前缀说明 |
