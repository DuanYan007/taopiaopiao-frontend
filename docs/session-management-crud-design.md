# 场次管理增删改查方案设计

## 一、页面功能分析

**当前页面状态（admin-sessions.html）：**
- ✅ 有场次列表表格（展示静态数据）
- ✅ 有搜索栏（演出名称、场次搜索、状态筛选）
- ✅ 有新建按钮（跳转到编辑页）
- ✅ 有操作按钮（查看、编辑、下架）
- ✅ 已实现JavaScript交互逻辑（session-list.js）
- ✅ 已连接后端API（待后端实现）
- ✅ 分页功能已实现

**当前页面状态（admin-session-edit.html）：**
- ✅ 有完整的表单（基本信息、座位设置、票档配置、销售设置等）
- ✅ 有表单提交按钮（取消、预览、发布场次）
- ✅ 已实现JavaScript表单处理逻辑（session-edit.js）
- ✅ 已连接后端API（待后端实现）
- ✅ 编辑模式数据加载已实现
- ✅ 查看模式只读控制已实现

---

## 二、功能设计方案

### 1. 查询功能（列表页面）

**功能描述：**
- 页面加载时自动获取场次列表（支持分页）
- 支持按关键词搜索（演出名称、场次名称）
- 支持按演出筛选（下拉框选择特定演出）
- 支持按状态筛选（未开始/销售中/已售罄/已结束/已下架）
- 支持分页查询

**涉及的HTML元素：**
```html
<!-- 搜索栏 -->
<input class="search-input" id="searchInput" placeholder="搜索演出名称、场次...">
<select class="form-select" id="eventSelect">
    <option value="">全部演出</option>
    <!-- 动态加载演出列表 -->
</select>
<select class="form-select" id="statusSelect">
    <option value="">全部状态</option>
    <option value="not_started">未开始</option>
    <option value="on_sale">销售中</option>
    <option value="sold_out">已售罄</option>
    <option value="ended">已结束</option>
    <option value="off_sale">已下架</option>
</select>
<button class="btn btn-primary" id="searchBtn">筛选</button>

<!-- 列表表格 -->
<table>
    <thead>
        <tr>
            <th>ID</th>
            <th>演出名称</th>
            <th>场次名称</th>
            <th>场次时间</th>
            <th>场馆</th>
            <th>票价范围</th>
            <th>座位情况</th>
            <th>状态</th>
            <th>操作</th>
        </tr>
    </thead>
    <tbody id="sessionTableBody">动态渲染数据</tbody>
</table>

<!-- 分页信息 -->
<div id="totalCount">共 0 条记录</div>
<div id="pageInfo">显示 0-0 条，共 0 条</div>
<div id="paginationBtns">分页按钮</div>
```

**后端接口：**
```
GET /api/admin/sessions?keyword={关键词}&status={状态}&eventId={演出ID}&page={页码}&pageSize={每页条数}
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
        "id": 1,
        "eventId": 123,
        "eventName": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "event": {
          "id": 123,
          "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
          "type": "concert",
          "artist": "周杰伦",
          "city": "上海"
        },
        "sessionName": "2025-03-15 19:30场",
        "startTime": "2025-03-15T19:30:00",
        "endTime": "2025-03-15T22:30:00",
        "venueId": 5,
        "venueName": "国家体育场（鸟巢）",
        "hallName": "主体育场",
        "totalSeats": 8560,
        "availableSeats": 2326,
        "soldSeats": 6234,
        "lockedSeats": 0,
        "status": "on_sale",
        "ticketTierConfig": [
          {
            "tierId": 1,
            "tierName": "VIP区",
            "price": 2580,
            "overridePrice": null,
            "seatCount": 560,
            "availableSeats": 120,
            "maxPurchase": 2,
            "enabled": true
          }
        ],
        "createdAt": "2025-01-15T10:30:00",
        "updatedAt": "2025-01-20T14:25:00"
      }
    ],
    "total": 156,
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
    'not_started': { text: '未开始', class: 'badge-info' },
    'on_sale': { text: '销售中', class: 'badge-success' },
    'sold_out': { text: '已售罄', class: 'badge-gray' },
    'ended': { text: '已结束', class: 'badge-dark' },
    'off_sale': { text: '已下架', class: 'badge-danger' }
};
```

**票价范围计算：**
```javascript
// 从 ticketTierConfig 中提取所有价格
const prices = session.ticketTierConfig
    .map(tier => tier.overridePrice || tier.price)
    .filter(p => p != null);

// 计算最小值和最大值
const minPrice = Math.min(...prices);
const maxPrice = Math.max(...prices);
const priceRange = minPrice === maxPrice ? `¥${minPrice}` : `¥${minPrice} - ¥${maxPrice}`;
```

**座位信息展示：**
```javascript
const totalSeats = session.totalSeats;
const soldSeats = session.soldSeats;
const availableSeats = session.availableSeats;
const soldPercent = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100) : 0;

// 显示格式
可售: 2,326
已售: 6,234 (73%)
总计: 8,560
```

---

### 2. 新增功能（跳转到编辑页）

**功能描述：**
- 点击"新增场次"按钮跳转到 `admin-session-edit.html?eventId={演出ID}`
- 如果是从场次列表页点击，需要先选择演出
- 如果是从演出详情页跳转，自动携带eventId
- 编辑页加载演出信息，显示继承的票档
- 提交表单调用创建接口

**后端接口：**
```
POST /api/admin/sessions
Content-Type: application/json
Authorization: Bearer {token}
```

**请求数据：**
```json
{
  "eventId": 123,
  "sessionName": "2025-03-15 19:30场",
  "startTime": "2025-03-15T19:30:00",
  "endTime": "2025-03-15T22:30:00",
  "venueId": 5,
  "hallName": "主体育场",
  "address": "北京市朝阳区国家体育场南路1号",
  "totalSeats": 8560,
  "availableSeats": 8560,
  "ticketTierConfig": [
    {
      "tierId": 1,
      "basePrice": 2580,
      "overridePrice": null,
      "seatCount": 560,
      "availableSeats": 560,
      "maxPurchase": 2,
      "enabled": true
    },
    {
      "tierId": 2,
      "basePrice": 1880,
      "overridePrice": null,
      "seatCount": 2000,
      "availableSeats": 2000,
      "maxPurchase": 4,
      "enabled": true
    },
    {
      "tierId": 3,
      "basePrice": 1280,
      "overridePrice": null,
      "seatCount": 3000,
      "availableSeats": 3000,
      "maxPurchase": 6,
      "enabled": true
    },
    {
      "tierId": 4,
      "basePrice": 680,
      "overridePrice": null,
      "seatCount": 3000,
      "availableSeats": 3000,
      "maxPurchase": 8,
      "enabled": true
    }
  ],
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
  },
  "status": "not_started"
}
```

**响应：**
```json
{
  "code": 200,
  "msg": "场次创建成功",
  "data": {
    "id": 1
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**关键业务逻辑：**
1. `totalSeats` 和 `availableSeats` 由前端根据 `ticketTierConfig` 自动计算
2. `ticketTierConfig` 是继承自演出的票档配置，每个场次可以调整：
   - `seatCount`: 该票档在本场次的座位分配数
   - `availableSeats`: 该票档的可售座位数
   - `maxPurchase`: 该票档的限购数
   - `overridePrice`: 自定义价格（可选，为null则使用演出价格）
   - `enabled`: 是否启用该票档
3. `metadata` 存储扩展配置，使用 JSON 格式

---

### 3. 编辑功能

**功能描述：**
- 点击列表中的"编辑"按钮
- 跳转到 `admin-session-edit.html?id={场次ID}&eventId={演出ID}`
- 编辑页根据ID加载场次数据并回填表单
- 提交表单调用更新接口

**后端接口：**

**获取详情：**
```
GET /api/admin/sessions/{id}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "eventId": 123,
    "eventName": "周杰伦2025嘉年华世界巡回演唱会-上海站",
    "event": {
      "id": 123,
      "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
      "type": "concert",
      "artist": "周杰伦",
      "city": "上海",
      "ticketTiers": [
        {
          "id": 1,
          "name": "VIP区",
          "price": 2580,
          "color": "#d32f2f",
          "maxSeats": 560,
          "maxPurchase": 2
        }
      ]
    },
    "sessionName": "2025-03-15 19:30场",
    "startTime": "2025-03-15T19:30:00",
    "endTime": "2025-03-15T22:30:00",
    "venueId": 5,
    "venueName": "国家体育场（鸟巢）",
    "venue": {
      "id": 5,
      "name": "国家体育场（鸟巢）",
      "city": "北京",
      "address": "北京市朝阳区国家体育场南路1号"
    },
    "hallName": "主体育场",
    "address": "北京市朝阳区国家体育场南路1号",
    "totalSeats": 8560,
    "availableSeats": 2326,
    "soldSeats": 6234,
    "lockedSeats": 0,
    "status": "on_sale",
    "ticketTierConfig": [
      {
        "tierId": 1,
        "basePrice": 2580,
        "overridePrice": null,
        "seatCount": 560,
        "availableSeats": 120,
        "maxPurchase": 2,
        "enabled": true
      }
    ],
    "metadata": {
      "duration": 180,
      "saleStartTime": "2025-02-01T10:00:00",
      "saleEndTime": "2025-03-15T17:30:00",
      "requireRealName": true,
      "limitOnePerPerson": false,
      "noRefund": false,
      "seatSelectionMode": "online",
      "sortOrder": 100,
      "remark": "热门场次"
    },
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-20T14:25:00"
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**更新：**
```
PUT /api/admin/sessions/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

**请求数据：**（与创建相同）

**响应：**
```json
{
  "code": 200,
  "msg": "场次更新成功",
  "data": null,
  "timestamp": 1769583457651,
  "success": true
}
```

**业务规则限制：**
- 如果场次已有销售（soldSeats > 0），不允许修改：
  - `totalSeats`
  - `ticketTierConfig` 中的 `seatCount`
- 如果修改 `startTime`，需要检查是否与同演出的其他场次时间冲突
- 修改 `ticketTierConfig` 会影响已有订单，需要二次确认

---

### 4. 删除/状态切换功能

**功能描述：**
- 点击列表中的"下架"或"上架"按钮
- 弹出确认对话框
- 确认后调用状态切换接口
- 成功后刷新列表

**后端接口：**

**状态切换：**
```
PUT /api/admin/sessions/{id}/status
Content-Type: application/json
Authorization: Bearer {token}

{
  "status": "on_sale"
}
```

**支持的状态流转：**
```
not_started → on_sale → sold_out → ended
                ↓
             off_sale
```

**状态流转说明：**
- `not_started` → `on_sale`: 草稿上架
- `on_sale` → `off_sale`: 销售中场次下架
- `off_sale` → `on_sale`: 下架场次重新上架
- `on_sale` → `sold_out`: 系统自动（所有座位售罄）
- `sold_out` → `ended`: 系统自动（演出时间已过）
- `on_sale` → `ended`: 系统自动（演出时间已过）

**删除（物理删除）：**
```
DELETE /api/admin/sessions/{id}
Authorization: Bearer {token}
```

**删除限制：**
- 只能删除状态为 `not_started` 或 `off_sale` 的场次
- 场次的 `soldSeats` 必须为 0（无订单）
- 已结束的场次不允许删除

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

**错误响应示例：**
```json
{
  "code": 400,
  "msg": "该场次已有订单，无法删除",
  "data": null,
  "timestamp": 1769583457651,
  "success": false
}
```

---

### 5. 查看功能

**功能描述：**
- 点击列表中的"查看"按钮
- 以只读模式展示场次详情
- 通过编辑页实现（禁用所有输入框）

**实现方式：**
```javascript
// 跳转到编辑页（只读模式）
window.location.href = `admin-session-edit.html?id=${sessionId}&eventId=${eventId}&readonly=true`;
```

**只读模式特点：**
- 所有输入框、下拉框、按钮全部禁用
- 隐藏"发布场次"按钮
- 保留"返回列表"按钮
- 保留"预览场次"按钮（如果已实现）

---

### 6. 票档继承模式（方案A）

**功能描述：**
- 场次继承所属演出的票档配置
- 场次可以为每个票档设置独立的参数
- 支持自定义价格覆盖演出价格

**继承模式数据结构：**
```javascript
// 演出的票档配置（ticket_tiers表）
event.ticketTiers = [
  {
    id: 1,
    name: "VIP区",
    price: 2580,
    color: "#d32f2f",
    maxPurchase: 2,
    maxSeats: 560
  },
  {
    id: 2,
    name: "一等座",
    price: 1880,
    color: "#f57c00",
    maxPurchase: 4,
    maxSeats: 2000
  }
];

// 场次的票档配置（sessions.ticket_tier_config JSON字段）
session.ticketTierConfig = [
  {
    tierId: 1,              // 引用演出票档ID
    basePrice: 2580,        // 演出基础价格（只读）
    overridePrice: null,    // 场次自定义价格（可选）
    seatCount: 560,         // 该场次分配的座位数
    availableSeats: 560,    // 该场次可售座位数
    maxPurchase: 2,         // 该票档限购数
    enabled: true           // 是否启用
  },
  {
    tierId: 2,
    basePrice: 1880,
    overridePrice: 1680,    // 自定义价格（覆盖演出价格）
    seatCount: 2000,
    availableSeats: 2000,
    maxPurchase: 4,
    enabled: true
  }
];
```

**前端实现逻辑：**
```javascript
// 1. 加载演出数据，获取票档列表
async function loadEventData() {
    const event = await get(`/api/admin/events/${eventId}`);
    renderInheritedTicketTiers(event.ticketTiers);
}

// 2. 渲染继承的票档列表
function renderInheritedTicketTiers(tiers) {
    tiers.forEach(tier => {
        // 显示票档名称和基础价格（只读）
        // 允许编辑：座位数、可售数、限购数、启用状态
        // 可选：自定义价格（勾选后显示输入框）
    });
}

// 3. 收集票档配置
function collectTicketTierConfig() {
    const config = [];
    document.querySelectorAll('[id^="tierRow_"]').forEach(row => {
        config.push({
            tierId: row.tierId,
            basePrice: row.basePrice,
            overridePrice: row.customPrice || null,
            seatCount: row.seatCount,
            availableSeats: row.availableSeats,
            maxPurchase: row.maxPurchase,
            enabled: row.enabled
        });
    });
    return config;
}
```

**自定义价格功能：**
```javascript
// 勾选"启用自定义价格"复选框
document.getElementById('useCustomPricing').addEventListener('change', function() {
    const isChecked = this.checked;
    document.querySelectorAll('.custom-price-input').forEach(input => {
        input.style.display = isChecked ? 'block' : 'none';
        if (!isChecked) input.value = ''; // 清空自定义价格
    });
});
```

---

## 三、数据流程图

```
用户操作                    前端逻辑                          后端接口
─────────────────────────────────────────────────────────────────────
访问列表页              → loadSessions()             → GET /api/admin/sessions
加载演出筛选列表        → loadEvents()               → GET /api/admin/events
点击筛选                → loadSessions(filters)      → GET /api/admin/sessions?...
点击分页                → loadSessions(page)         → GET /api/admin/sessions?page=2
点击新建                → 跳转编辑页(eventId)         → -
点击编辑                → 跳转编辑页(id, eventId)     → GET /api/admin/sessions/{id}
点击下架                → changeSessionStatus(id)     → PUT /api/admin/sessions/{id}/status
点击查看                → 跳转编辑页(只读模式)         → GET /api/admin/sessions/{id}

编辑页加载演出          → loadEventData()            → GET /api/admin/events/{eventId}
编辑页加载场次          → loadSessionData()          → GET /api/admin/sessions/{id}
编辑页提交              → handleFormSubmit()          → POST /api/admin/sessions (新建)
                                                  → PUT /api/admin/sessions/{id} (更新)
切换自定义价格          → toggleCustomPricing()       → -
重新加载票档            → loadEventData()             → GET /api/admin/events/{eventId}
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
    const start = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalRecords);

    // 更新分页信息
    document.getElementById('pageInfo').textContent =
        `显示 ${start}-${end} 条，共 ${totalRecords} 条`;

    const paginationContainer = document.getElementById('paginationBtns');

    if (totalRecords === 0 || totalPages <= 1) {
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
        // 显示：第一页、最后一页、当前页前后2页
        if (i === 1 || i === totalPages ||
            (i >= currentPage - 2 && i <= currentPage + 2)) {
            buttons += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-secondary'} btn-small"
                onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            buttons += `<span style="padding: 0 4px; color: #666;">...</span>`;
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

## 五、操作按钮控制逻辑

**根据场次状态显示不同的操作按钮：**

```javascript
function renderActionButtons(session) {
    const status = session.status;
    const soldSeats = session.soldSeats || 0;
    let buttons = '';

    // 所有状态都有"查看"按钮
    buttons += `<button onclick="viewSession(${session.id}, ${session.eventId})">查看</button>`;

    switch (status) {
        case 'not_started':
            // 草稿状态：编辑、上架、删除
            buttons += `<button onclick="editSession(${session.id}, ${session.eventId})">编辑</button>`;
            buttons += `<button onclick="changeSessionStatus(${session.id}, 'on_sale')">上架</button>`;
            buttons += `<button onclick="deleteSession(${session.id})">删除</button>`;
            break;

        case 'on_sale':
            // 销售中状态：编辑、下架
            buttons += `<button onclick="editSession(${session.id}, ${session.eventId})">编辑</button>`;
            buttons += `<button onclick="changeSessionStatus(${session.id}, 'off_sale')">下架</button>`;
            break;

        case 'off_sale':
            // 下架状态：编辑、上架、删除（无订单时可删除）
            buttons += `<button onclick="editSession(${session.id}, ${session.eventId})">编辑</button>`;
            buttons += `<button onclick="changeSessionStatus(${session.id}, 'on_sale')">上架</button>`;
            if (soldSeats === 0) {
                buttons += `<button onclick="deleteSession(${session.id})">删除</button>`;
            }
            break;

        case 'sold_out':
            // 已售罄状态：只查看
            break;

        case 'ended':
            // 已结束状态：只查看
            break;
    }

    return buttons;
}
```

**状态流转确认提示：**
```javascript
async function changeSessionStatus(id, newStatus) {
    const statusText = {
        'on_sale': '上架',
        'off_sale': '下架',
        'not_started': '设为草稿'
    };

    const confirmMessages = {
        'on_sale': '确定要上架该场次吗？上架后将开始销售。',
        'off_sale': '确定要下架该场次吗？下架后将停止销售，已售出的订单不受影响。',
        'not_started': '确定要将场次设为草稿吗？'
    };

    if (!confirm(confirmMessages[newStatus])) return;

    try {
        await put(`/api/admin/sessions/${id}/status`, { status: newStatus });
        alert('操作成功');
        loadSessions();
    } catch (error) {
        alert('操作失败: ' + error.msg);
    }
}
```

---

## 六、错误处理

所有API调用都需要使用 `try-catch` 捕获错误：
- **网络错误**：提示"网络错误，请稍后重试"
- **401错误**：自动跳转登录页（api.js已处理）
- **403错误**：提示"权限不足"
- **业务错误**：显示后端返回的 `msg`

**特殊错误处理：**
```javascript
// 删除场次时检查是否有订单
try {
    await del(`/api/admin/sessions/${id}`);
    alert('删除成功');
    loadSessions();
} catch (error) {
    if (error.code === 400) {
        alert('删除失败: ' + error.msg); // "该场次已有订单，无法删除"
    } else {
        alert('删除失败: ' + error.msg);
    }
}

// 更新场次时检查是否可以修改关键数据
if (sessionData.soldSeats > 0) {
    // 如果有订单，禁止修改座位数和票档配置
    const seatCountInputs = document.querySelectorAll('[name$=".seatCount"]');
    seatCountInputs.forEach(input => input.disabled = true);
}
```

---

## 七、用户体验优化

1. **加载状态**：按钮显示"加载中..."
2. **成功提示**：使用alert或toast提示
3. **错误提示**：显示具体错误信息
4. **删除确认**：删除/下架前弹出确认对话框
5. **表单验证**：必填字段验证、数据范围验证
6. **只读模式**：查看模式下禁用所有输入
7. **状态徽章**：不同状态显示不同颜色的徽章
8. **座位统计**：显示可售/已售/总计，以及销售百分比
9. **票价范围**：自动计算并显示票价范围
10. **智能按钮**：根据状态动态显示可用操作
11. **自动填充**：选择场馆后自动填充地址
12. **实时计算**：自动计算总座位数和可售座位数

---

## 八、表单字段说明

### 基本信息
- `eventId` (必填): 所属演出ID
- `sessionName` (必填): 场次名称
- `sessionDate` (必填): 场次日期（YYYY-MM-DD）
- `startTime` (必填): 开始时间（HH:mm）
- `endTime`: 结束时间（HH:mm）

### 场馆信息
- `venueId` (必填): 场馆ID（下拉选择）
- `hallName`: 馆厅名称（如：主体育场、A馆、B馆）
- `address`: 详细地址（选择场馆后自动填充，可修改）

### 座位设置
- `totalSeats` (必填): 总座位数（自动计算）
- `availableSeats`: 可售座位数（自动计算）
- `metadata.seatSelectionMode`: 选座方式（online在线选座 / auto系统自动分配）

### 票档配置（继承自演出）
`ticketTierConfig[]`: 票档配置数组
  - `tierId` (必填): 票档ID（引用演出票档）
  - `basePrice`: 基础价格（演出定价，只读）
  - `overridePrice`: 自定义价格（可选，为null则使用基础价格）
  - `seatCount` (必填): 座位分配数
  - `availableSeats` (必填): 可售座位数
  - `maxPurchase`: 限购数
  - `enabled`: 是否启用

### 销售设置
- `metadata.saleStartTime` (必填): 开售时间
- `metadata.saleEndTime`: 停售时间
- `metadata.duration`: 演出时长（分钟）

### 购票限制
- `metadata.requireRealName`: 实名制购票（布尔值）
- `metadata.limitOnePerPerson`: 每人限购1张（布尔值）
- `metadata.noRefund`: 禁止退票（布尔值）

### 状态设置
- `status`: 场次状态（not_started/on_sale/off_sale）
- `metadata.sortOrder`: 排序权重（数字越大越靠前）
- `metadata.remark`: 备注

---

## 九、座位数自动计算逻辑

**前端计算：**
```javascript
// 从票档配置计算总座位数
const totalSeats = ticketTierConfig.reduce((sum, tier) => {
    return sum + (tier.enabled ? tier.seatCount : 0);
}, 0);

// 从票档配置计算可售座位数
const availableSeats = ticketTierConfig.reduce((sum, tier) => {
    return sum + (tier.enabled ? tier.availableSeats : 0);
}, 0);

// 提交时将计算结果赋值给表单
data.totalSeats = totalSeats;
data.availableSeats = availableSeats;
```

**后端验证：**
```java
// 验证总座位数是否正确
int calculatedTotal = ticketTierConfig.stream()
    .filter(TicketTier::isEnabled)
    .mapToInt(TicketTier::getSeatCount)
    .sum();

if (session.getTotalSeats() != calculatedTotal) {
    throw new BusinessException("总座位数与票档配置不匹配");
}

// 验证可售座位数不超过总座位数
if (session.getAvailableSeats() > session.getTotalSeats()) {
    throw new BusinessException("可售座位数不能大于总座位数");
}
```

---

## 十、已创建的JavaScript文件

1. **`assets/js/session-list.js`** - 场次列表页面逻辑
   - 分页查询
   - 搜索筛选（关键词、演出、状态）
   - 加载演出列表用于筛选
   - 状态切换（上架/下架）
   - 删除场次
   - 操作按钮动态渲染
   - 票价范围计算
   - 座位信息展示

2. **`assets/js/session-edit.js`** - 场次编辑页面逻辑
   - 表单提交（创建/更新）
   - 数据回填（编辑模式）
   - 只读模式控制（查看模式）
   - 票档继承模式渲染
   - 自定义价格切换
   - 场馆选择自动填充地址
   - 座位数自动计算
   - 票档配置数据收集

---

## 十一、前后端协作要点

### 1. 时间格式处理
- **前端发送**: ISO 8601格式 `"2025-03-15T19:30:00"`
- **后端接收**: DATETIME类型，自动转换
- **前端显示**: 格式化为 `"2025-03-15 19:30"`

### 2. 票档配置同步
- 后端需要在场次详情中返回 `event.ticketTiers`（演出的票档）
- 前端根据 `ticketTierConfig` 和 `event.ticketTiers` 渲染票档列表
- 后端需要验证 `tierId` 是否属于该演出

### 3. 座位数统计规则
- `totalSeats` = 所有启用票档的 `seatCount` 之和
- `availableSeats` = 所有启用票档的 `availableSeats` 之和
- `soldSeats` = 实时统计订单中的座位数
- `lockedSeats` = 锁定中的座位数（下单未支付）

### 4. 价格计算逻辑
- 列表显示价格时，优先使用 `overridePrice`，为null则使用 `basePrice`
- 价格范围 = 所有启用票档的最小价格到最大价格
- 如果只有一个票档或所有票档价格相同，显示单一价格

### 5. 状态自动流转
- 系统需要定期检查场次状态：
  - `soldSeats >= totalSeats` → `sold_out`
  - `startTime < currentTime && status == on_sale` → `ended`（演出结束）
  - `saleStartTime <= currentTime < startTime && status == not_started` → `on_sale`（定时开售）

### 6. 删除限制检查
- 删除前检查 `soldSeats === 0`
- 删除前检查 `status in ['not_started', 'off_sale']`
- 删除前检查是否有订单关联

---

## 十二、数据库字段对应关系

```sql
sessions表字段                | 前端表单字段                    | 说明
-----------------------------|-------------------------------|------------------
id                           | (自动生成)                     | 场次ID
event_id                     | eventId                       | 所属演出ID
session_name                 | sessionName                   | 场次名称
start_time                   | sessionDate + startTime       | 开始时间
end_time                     | endTime                       | 结束时间
venue_id                     | venueId                       | 场馆ID
hall_name                    | hallName                      | 馆厅名称
address                      | address                       | 详细地址
total_seats                  | totalSeats (自动计算)          | 总座位数
available_seats              | availableSeats (自动计算)      | 可售座位数
sold_seats                   | (系统维护)                    | 已售座位数
locked_seats                 | (系统维护)                    | 锁定座位数
status                       | status                        | 场次状态
seat_map_config              | (暂未使用)                    | 座位图配置
ticket_tier_config           | ticketTierConfig (JSON)       | 票档配置
metadata                     | metadata (JSON)               | 扩展配置
created_at                   | (自动生成)                    | 创建时间
updated_at                   | (自动更新)                    | 更新时间
```

**ticket_tier_config JSON结构示例：**
```json
[
  {
    "tierId": 1,
    "basePrice": 2580.00,
    "overridePrice": null,
    "seatCount": 560,
    "availableSeats": 560,
    "maxPurchase": 2,
    "enabled": true
  }
]
```

**metadata JSON结构示例：**
```json
{
  "duration": 180,
  "saleStartTime": "2025-02-01T10:00:00",
  "saleEndTime": "2025-03-15T17:30:00",
  "seatSelectionMode": "online",
  "requireRealName": true,
  "limitOnePerPerson": false,
  "noRefund": false,
  "sortOrder": 100,
  "remark": "热门场次"
}
```

---

## 十三、测试用例建议

### 1. 列表页测试
- [x] 页面加载自动显示第一页数据
- [ ] 搜索功能测试（关键词、演出、状态）
- [ ] 分页功能测试（上一页、下一页、页码跳转）
- [ ] 操作按钮测试（查看、编辑、上架、下架、删除）
- [ ] 状态流转测试
- [ ] 删除限制测试（有订单的场次不可删除）

### 2. 编辑页测试
- [ ] 新建场次测试（填写表单、提交）
- [ ] 编辑场次测试（数据回填、修改、提交）
- [ ] 查看模式测试（只读控制）
- [ ] 票档继承测试（显示演出票档、修改配置）
- [ ] 自定义价格测试（启用/禁用、输入价格）
- [ ] 场馆选择测试（下拉选择、自动填充地址）
- [ ] 座位数计算测试（自动计算、验证）
- [ ] 表单验证测试（必填项、数据范围）

### 3. 集成测试
- [ ] 创建场次后列表页刷新显示
- [ ] 编辑场次后列表页更新显示
- [ ] 状态切换后列表页更新状态
- [ ] 删除场次后列表页移除记录
- [ ] 票档配置正确保存和加载
- [ ] 时间格式正确传递和显示

---

## 十四、API接口清单

### 场次管理接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取场次列表 | GET | /api/admin/sessions | 分页查询、筛选 |
| 获取场次详情 | GET | /api/admin/sessions/{id} | 包含演出和场馆信息 |
| 创建场次 | POST | /api/admin/sessions | 提交完整配置 |
| 更新场次 | PUT | /api/admin/sessions/{id} | 更新场次信息 |
| 删除场次 | DELETE | /api/admin/sessions/{id} | 物理删除 |
| 更新场次状态 | PUT | /api/admin/sessions/{id}/status | 状态流转 |

### 需要调用的其他接口

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 获取演出列表 | GET | /api/admin/events | 用于筛选 |
| 获取演出详情 | GET | /api/admin/events/{id} | 获取票档信息 |
| 获取场馆列表 | GET | /api/admin/venues | 用于场馆选择 |

---

## 十五、开发优先级

### Phase 1 - 基础功能（已完成）
- ✅ 前端列表页逻辑（session-list.js）
- ✅ 前端编辑页逻辑（session-edit.js）
- ✅ HTML页面优化和ID添加
- ✅ 票档继承模式实现
- ✅ 分页功能实现

### Phase 2 - 后端开发（待开发）
- [ ] 实现场次CRUD接口
- [ ] 实现票档继承逻辑
- [ ] 实现座位数自动计算
- [ ] 实现状态流转控制
- [ ] 实现删除限制检查
- [ ] 实现数据验证

### Phase 3 - 集成测试（待测试）
- [ ] 前后端联调
- [ ] 功能测试
- [ ] 边界情况测试
- [ ] 性能测试

### Phase 4 - 优化完善（待优化）
- [ ] 添加loading状态
- [ ] 优化错误提示
- [ ] 添加操作成功/失败Toast
- [ ] 实现批量操作
- [ ] 添加数据导出
