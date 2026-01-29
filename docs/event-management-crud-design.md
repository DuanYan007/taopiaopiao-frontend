# 演出管理增删改查方案设计

## 一、页面功能分析

**当前页面状态（admin-events.html）：**
- ✅ 有演出列表表格（展示8条静态数据）
- ✅ 有搜索栏（演出名称、状态筛选、类型筛选）
- ✅ 有新建按钮（跳转到编辑页）
- ✅ 有操作按钮（查看、编辑、下架）
- ❌ 无任何JavaScript交互逻辑
- ❌ 未连接后端API
- ❌ 分页功能未实现

**当前页面状态（admin-event-edit.html）：**
- ✅ 有完整的表单（基本信息、时间、票档、详情等）
- ✅ 有表单提交按钮（保存草稿、预览、发布）
- ❌ 无JavaScript表单处理逻辑
- ❌ 未连接后端API
- ❌ 无编辑模式数据加载
- ❌ 无查看模式只读控制

---

## 二、功能设计方案

### 1. 查询功能（列表页面）

**功能描述：**
- 页面加载时自动获取演出列表（支持分页）
- 支持按演出名称搜索（艺人/主办方名称）
- 支持按状态筛选（上架/下架/草稿/已售罄）
- 支持按类型筛选（演唱会/话剧歌剧/展览休闲/体育等）
- 支持分页查询

**涉及的HTML元素：**
```html
<!-- 搜索栏 -->
<input class="search-input" id="searchInput" placeholder="搜索演出名称、艺人...">
<select class="form-select" id="statusSelect">
    <option value="">全部状态</option>
    <option value="on_sale">上架</option>
    <option value="off_sale">下架</option>
    <option value="draft">草稿</option>
    <option value="sold_out">已售罄</option>
</select>
<select class="form-select" id="typeSelect">
    <option value="">全部类型</option>
    <option value="concert">演唱会</option>
    <option value="theatre">话剧歌剧</option>
    <option value="exhibition">展览休闲</option>
    <option value="sports">体育</option>
</select>
<button class="btn btn-primary" id="searchBtn">搜索</button>

<!-- 列表表格 -->
<table><tbody id="eventTableBody">动态渲染数据</tbody></table>

<!-- 分页信息 -->
<div id="totalCount">共 0 条记录</div>
<div id="pageInfo">显示 0-0 条，共 0 条</div>
<div id="paginationBtns">分页按钮</div>
```

**后端接口：**
```
GET /api/admin/events?keyword={关键词}&status={状态}&type={类型}&page={页码}&pageSize={每页条数}
Authorization: Bearer {token}
```

**数据结构：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "type": "concert",
        "artist": "周杰伦",
        "city": "上海",
        "status": "on_sale",
        "priceRange": "¥380 - ¥2580",
        "createTime": "2025-01-15 10:30:00"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**状态映射：**
```javascript
const statusMap = {
    'draft': { text: '草稿', class: 'badge-secondary' },
    'on_sale': { text: '上架', class: 'badge-success' },
    'off_sale': { text: '下架', class: 'badge-danger' },
    'sold_out': { text: '已售罄', class: 'badge-dark' },
    'coming_soon': { text: '即将开售', class: 'badge-warning' }
};
```

---

### 2. 新增功能（跳转到编辑页）

**功能描述：**
- 点击"新建演出"按钮跳转到 `admin-event-edit.html`
- 编辑页表单为空，默认状态为"草稿"
- 提交表单调用创建接口

**后端接口：**
```
POST /api/admin/events
Content-Type: application/json
Authorization: Bearer {token}
```

**请求数据：**
```json
{
  "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
  "type": "concert",
  "artist": "周杰伦",
  "city": "上海",
  "venueId": 2,
  "subtitle": "嘉年华世界巡回演唱会-上海站",
  "eventStartDate": "2025-03-15",
  "eventEndDate": "2025-03-15",
  "duration": 180,
  "saleStartTime": "2025-02-01 10:00:00",
  "saleEndTime": "2025-03-15 19:30:00",
  "coverImage": "https://example.com/image.jpg",
  "images": "url1,url2,url3",
  "description": "演出简介",
  "ticketTiers": [
    {
      "name": "VIP",
      "price": 2580,
      "color": "#FF5722",
      "maxPurchase": 4,
      "description": "含周边礼包"
    },
    {
      "name": "一等座",
      "price": 1680,
      "color": "#2196F3",
      "maxPurchase": 4,
      "description": ""
    }
  ],
  "metadata": {
    "tips": "儿童入场提示",
    "refundPolicy": "退换票政策"
  },
  "status": "draft",
  "tags": ["recommended", "hot"]
}
```

**响应：**
```json
{
  "code": 200,
  "msg": "创建成功",
  "data": {
    "id": 1001
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 3. 编辑功能

**功能描述：**
- 点击列表中的"编辑"按钮
- 跳转到 `admin-event-edit.html?id={演出ID}`
- 编辑页根据ID加载演出数据并回填表单
- 提交表单调用更新接口

**后端接口：**

**获取详情：**
```
GET /api/admin/events/{id}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1001,
    "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
    "type": "concert",
    "artist": "周杰伦",
    "city": "上海",
    "venueId": 2,
    "subtitle": "嘉年华世界巡回演唱会-上海站",
    "eventStartDate": "2025-03-15",
    "eventEndDate": "2025-03-15",
    "duration": 180,
    "saleStartTime": "2025-02-01 10:00:00",
    "saleEndTime": "2025-03-15 19:30:00",
    "coverImage": "https://example.com/image.jpg",
    "images": "url1,url2",
    "description": "演出简介",
    "ticketTiers": [
      {
        "id": 1,
        "name": "VIP",
        "price": 2580,
        "color": "#FF5722",
        "maxPurchase": 4,
        "description": "含周边礼包"
      }
    ],
    "metadata": {
      "tips": "儿童入场提示",
      "refundPolicy": "退换票政策"
    },
    "status": "on_sale",
    "tags": ["recommended", "hot"],
    "createTime": "2025-01-15 10:30:00"
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**更新：**
```
PUT /api/admin/events/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

**请求数据：**（与创建相同）

**响应：**
```json
{
  "code": 200,
  "msg": "更新成功",
  "data": null,
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 4. 删除/下架功能

**功能描述：**
- 点击列表中的"下架"按钮
- 弹出确认对话框
- 确认后调用下架接口（或删除接口）
- 成功后刷新列表

**后端接口：**

**下架（推荐）：**
```
PUT /api/admin/events/{id}/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "off_sale"
}
```

**删除（物理删除）：**
```
DELETE /api/admin/events/{id}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null,
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 5. 查看功能

**功能描述：**
- 点击列表中的"查看"按钮
- 以只读模式展示演出详情
- 通过编辑页实现（禁用所有输入框）

**实现方式：**
```javascript
// 跳转到编辑页（只读模式）
window.location.href = `admin-event-edit.html?id=${eventId}&readonly=true`;
```

---

### 6. 票档动态管理

**功能描述：**
- 支持添加多个票档
- 支持删除票档
- 每个票档包含：名称、价格、颜色、限购数量、说明

**实现方式：**
```javascript
// 添加票档
function addTicketTier() {
    const container = document.getElementById('ticketTiersContainer');
    const index = container.children.length;
    // 动态添加票档HTML
}

// 删除票档
function removeTicketTier(index) {
    // 移除对应票档
}

// 收集票档数据
function collectTicketTiers() {
    const tiers = [];
    document.querySelectorAll('[name^="ticket_tiers["]').forEach(element => {
        // 解析票档数据
    });
    return tiers;
}
```

---

## 三、数据流程图

```
用户操作                    前端逻辑                          后端接口
─────────────────────────────────────────────────────────────────────
访问列表页              → loadEvents()               → GET /api/admin/events
点击搜索                → loadEvents(keyword, status, type) → GET /api/admin/events?...
点击分页                → loadEvents(page)           → GET /api/admin/events?page=2
点击新建                → 跳转编辑页(无ID)            → -
点击编辑                → 跳转编辑页(有ID)            → GET /api/admin/events/{id}
点击下架                → changeEventStatus(id)      → PUT /api/admin/events/{id}/status
点击查看                → 跳转编辑页(只读模式)         → GET /api/admin/events/{id}

编辑页提交              → handleFormSubmit()          → POST /api/admin/events (新建)
                                                  → PUT /api/admin/events/{id} (更新)
添加票档                → addTicketTier()             → -
删除票档                → removeTicketTier()          → -
```

---

## 四、分页实现

**全局变量：**
```javascript
let currentPage = 1;
const pageSize = 10;
let totalRecords = 0;
let totalPages = 0;
```

**分页函数：**
```javascript
function renderPagination() {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalRecords);

    // 更新分页信息
    document.getElementById('pageInfo').textContent =
        `显示 ${start}-${end} 条，共 ${totalRecords} 条`;

    const paginationContainer = document.getElementById('paginationBtns');

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let buttons = '';

    // 上一页
    buttons += `<button class="btn btn-secondary btn-small"
        ${currentPage === 1 ? 'disabled' : ''}
        onclick="goToPage(${currentPage - 1})">上一页</button>`;

    // 页码
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)) {
            buttons += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-small"
                onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            buttons += `<span style="padding: 0 4px;">...</span>`;
        }
    }

    // 下一页
    buttons += `<button class="btn btn-secondary btn-small"
        ${currentPage === totalPages ? 'disabled' : ''}
        onclick="goToPage(${currentPage + 1})">下一页</button>`;

    paginationContainer.innerHTML = buttons;
}
```

---

## 五、错误处理

所有API调用都需要使用 `try-catch` 捕获错误：
- **网络错误**：提示"网络错误，请稍后重试"
- **401错误**：自动跳转登录页（api.js已处理）
- **403错误**：提示"权限不足"
- **业务错误**：显示后端返回的 `msg`

---

## 六、用户体验优化

1. **加载状态**：按钮显示"加载中..."
2. **成功提示**：使用alert或toast提示
3. **错误提示**：显示具体错误信息
4. **删除确认**：删除/下架前弹出确认对话框
5. **表单验证**：必填字段验证
6. **只读模式**：查看模式下禁用所有输入
7. **状态徽章**：不同状态显示不同颜色的徽章
8. **票档颜色**：票档列表支持颜色选择器，便于视觉区分

---

## 七、表单字段说明

### 基本信息
- `name` (必填): 演出名称
- `type` (必填): 演出类型（演唱会/话剧歌剧/展览休闲/体育/儿童亲子等）
- `artist` (必填): 艺人/主办方
- `city` (必填): 城市
- `venueId` (必填): 默认场馆ID
- `subtitle`: 副标题

### 时间信息
- `eventStartDate`: 演出开始日期
- `eventEndDate`: 演出结束日期
- `duration`: 演出时长（分钟）

### 预售时间
- `saleStartTime` (必填): 开售时间
- `saleEndTime`: 停售时间

### 票档设置
- `ticketTiers[]`: 票档数组
  - `name` (必填): 票档名称
  - `price` (必填): 价格
  - `color`: 座位颜色（十六进制）
  - `maxPurchase`: 每人限购数量
  - `description`: 票档说明

### 演出详情
- `coverImage`: 演出海报URL
- `images`: 演出图片URL，多个用逗号分隔
- `description`: 演出简介
- `metadata.tips`: 温馨提示
- `metadata.refundPolicy`: 购票须知

### 状态设置
- `status`: 上架状态（draft/on_sale/off_sale）
- `tags[]`: 标签数组（recommended/hot/coming_soon）

---

## 八、需要创建的JavaScript文件

1. **`assets/js/event-list.js`** - 演出列表页面逻辑
   - 分页查询
   - 搜索筛选
   - 状态切换
   - 删除/下架

2. **`assets/js/event-edit.js`** - 演出编辑页面逻辑
   - 表单提交
   - 数据回填
   - 只读模式
   - 票档动态管理
