# 场馆管理增删改查方案设计

## 一、页面功能分析

**当前页面状态：**
- ✅ 有场馆列表表格（展示4条静态数据）
- ✅ 有搜索栏（场馆名称、城市筛选）
- ✅ 有新建按钮（跳转到编辑页）
- ✅ 有操作按钮（查看、编辑、删除）
- ❌ 无任何JavaScript交互逻辑
- ❌ 未连接后端API

---

## 二、功能设计方案

### 1. 查询功能（列表页面）

**功能描述：**
- 页面加载时自动获取场馆列表
- 支持按场馆名称搜索
- 支持按城市筛选
- 支持分页

**涉及的HTML元素：**
```html
<!-- 搜索栏 -->
<input class="search-input" placeholder="搜索场馆名称...">
<select class="form-select" style="width: 150px;">城市筛选</select>
<button class="btn btn-primary">搜索按钮</button>

<!-- 列表表格 -->
<table>tbody>动态渲染数据</tbody></table>

<!-- 分页 -->
<div class="admin-table-footer">分页按钮</div>
```

**后端接口：**
```
GET /api/admin/venues?keyword={场馆名称}&city={城市}&page={页码}&pageSize={每页条数}
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
        "name": "上海体育场",
        "city": "上海",
        "district": "徐汇区",
        "address": "上海市徐汇区天钥桥路666号",
        "capacity": 56000,
        "createTime": "2025-01-12"
      }
    ],
    "total": 20,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 2. 新增功能（跳转到编辑页）

**功能描述：**
- 点击"新建场馆"按钮跳转到 `admin-venue-edit.html`
- 编辑页表单为空
- 提交表单调用创建接口

**后端接口：**
```
POST /api/admin/venues
Content-Type: application/json
Authorization: Bearer {token}
```

**请求数据：**
```json
{
  "name": "上海体育场",
  "city": "上海",
  "district": "徐汇区",
  "address": "上海市徐汇区天钥桥路666号",
  "capacity": 56000,
  "latitude": 31.123456,
  "longitude": 121.123456,
  "images": "url1,url2,url3",
  "description": "场馆介绍",
  "facilities": ["停车场", "地铁", "公交"]
}
```

**响应：**
```json
{
  "code": 200,
  "msg": "创建成功",
  "data": {
    "id": 1
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 3. 编辑功能

**功能描述：**
- 点击列表中的"编辑"按钮
- 跳转到 `admin-venue-edit.html?id={场馆ID}`
- 编辑页根据ID加载场馆数据并回填表单
- 提交表单调用更新接口

**后端接口：**

**获取详情：**
```
GET /api/admin/venues/{id}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "name": "上海体育场",
    "city": "上海",
    "district": "徐汇区",
    "address": "上海市徐汇区天钥桥路666号",
    "capacity": 56000,
    "latitude": 31.123456,
    "longitude": 121.123456,
    "images": "url1,url2",
    "description": "场馆介绍",
    "facilities": ["停车场", "地铁"],
    "createTime": "2025-01-12"
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**更新：**
```
PUT /api/admin/venues/{id}
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

### 4. 删除功能

**功能描述：**
- 点击列表中的"删除"按钮
- 弹出确认对话框
- 确认后调用删除接口
- 成功后刷新列表

**后端接口：**
```
DELETE /api/admin/venues/{id}
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "msg": "删除成功",
  "data": null,
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 5. 查看功能

**功能描述：**
- 点击列表中的"查看"按钮
- 以只读模式展示场馆详情
- 通过编辑页实现（禁用所有输入框）

**实现方式：**
```javascript
// 跳转到编辑页（只读模式）
window.location.href = `admin-venue-edit.html?id=${venueId}&readonly=true`;
```

---

## 三、数据流程图

```
用户操作                    前端逻辑                          后端接口
─────────────────────────────────────────────────────────────────────
访问列表页              → loadVenues()              → GET /api/admin/venues
点击搜索                → loadVenues(keyword, city) → GET /api/admin/venues?keyword=xxx&city=xxx
点击分页                → loadVenues(page)          → GET /api/admin/venues?page=2
点击新建                → 跳转编辑页(无ID)           → -
点击编辑                → 跳转编辑页(有ID)           → GET /api/admin/venues/{id}
点击删除                → deleteVenue(id)            → DELETE /api/admin/venues/{id}
点击查看                → 跳转编辑页(只读模式)       → GET /api/admin/venues/{id}

编辑页提交              → handleFormSubmit()         → POST /api/admin/venues (新建)
                                                  → PUT /api/admin/venues/{id} (更新)
```

---

## 四、错误处理

所有API调用都需要使用 `try-catch` 捕获错误：
- **网络错误**：提示"网络错误，请稍后重试"
- **401错误**：自动跳转登录页（api.js已处理）
- **403错误**：提示"权限不足"
- **业务错误**：显示后端返回的 `msg`

---

## 五、用户体验优化

1. **加载状态**：按钮显示"加载中..."
2. **成功提示**：使用alert或toast提示
3. **错误提示**：显示具体错误信息
4. **删除确认**：删除前弹出确认对话框
5. **表单验证**：必填字段验证
6. **只读模式**：查看模式下禁用所有输入

---

## 六、表单字段说明

### 基本信息
- `name` (必填): 场馆名称
- `city` (必填): 所在城市（下拉选择）
- `district`: 所在区域
- `capacity`: 容纳人数
- `address` (必填): 详细地址

### 地理坐标
- `latitude`: 纬度（-90到90）
- `longitude`: 经度（-180到180）

### 场馆介绍
- `images`: 场馆图片URL，多个用逗号分隔
- `description`: 场馆详细介绍
- `facilities[]`: 设施标签（多选框：停车场、地铁、公交、餐厅）
