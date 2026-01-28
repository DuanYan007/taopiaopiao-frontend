# 淘票票管理后台前端接口清单

## 统一响应格式

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": { ... },
  "timestamp": 1769583457651,
  "success": true
}
```

**失败响应：**
```json
{
  "code": 错误码,
  "msg": "错误信息描述",
  "timestamp": 1769583457651,
  "success": false
}
```

---

## 认证接口

### 1. 管理员登录

**接口：** `POST /api/admin/auth/login`

**请求头：**
```
Content-Type: application/json
```

**请求参数：**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImp0aSI6IjIxMzFlMWFiLTMyYzUtNDU3ZC1hZDFiLWNkNTk5ODM4NzFlOSIsImlhdCI6MTc2OTU4MzQ1NywiZXhwIjoxNzY5NjY5ODU3fQ.ymz7ZpZXFcMaB_sf2sBz2Cz1S2bkVctiAD0d-6K3zdvP-VJzz4H9msiNQgMFiC9DIRuOJTqtHm65bkgfUXoxxA",
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "email": "admin@taopiaopiao.com"
    }
  },
  "timestamp": 1769583457651,
  "success": true
}
```

**失败响应：**
```json
{
  "code": 1001,
  "msg": "用户名或密码错误",
  "timestamp": 1769583457651,
  "success": false
}
```

---

### 2. 管理员登出

**接口：** `POST /api/admin/auth/logout`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "msg": "登出成功",
  "timestamp": 1769583457651,
  "success": true
}
```

---

## 演出管理接口

### 3. 获取演出列表

**接口：** `GET /api/admin/events`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?page=1&pageSize=10&status=online&type=演唱会
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "周杰伦2025嘉年华世界巡回演唱会-上海站",
        "type": "演唱会",
        "artist": "周杰伦",
        "city": "上海",
        "status": "online",
        "priceRange": "¥380 - ¥2580",
        "createTime": "2025-01-15"
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

---

### 4. 创建演出

**接口：** `POST /api/admin/events`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "name": "周杰伦演唱会",
  "type": "演唱会",
  "artist": "周杰伦",
  "city": "上海",
  "description": "精彩演出"
}
```

**成功响应：**
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

### 5. 更新演出

**接口：** `PUT /api/admin/events/{id}`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "name": "周杰伦演唱会",
  "status": "offline"
}
```

**成功响应：**
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

### 6. 删除演出

**接口：** `DELETE /api/admin/events/{id}`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：** 无

**成功响应：**
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

## 场次管理接口

### 7. 获取场次列表

**接口：** `GET /api/admin/sessions`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?eventId=1001&page=1&pageSize=10
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "eventId": 1001,
        "eventTime": "2025-03-15 19:30:00",
        "venue": "上海体育场",
        "status": "on_sale"
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 8. 创建场次

**接口：** `POST /api/admin/sessions`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "eventId": 1001,
  "eventTime": "2025-03-15 19:30:00",
  "venueId": 1
}
```

**成功响应：**
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

## 场馆管理接口

### 9. 获取场馆列表

**接口：** `GET /api/admin/venues`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?city=上海&page=1&pageSize=10
```

**成功响应：**
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
        "capacity": 56000
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

### 10. 创建场馆

**接口：** `POST /api/admin/venues`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "name": "上海体育场",
  "city": "上海",
  "district": "徐汇区",
  "address": "上海市徐汇区天钥桥路666号",
  "capacity": 56000,
  "latitude": 31.123456,
  "longitude": 121.123456
}
```

**成功响应：**
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

## 座位管理接口

### 11. 获取座位列表

**接口：** `GET /api/admin/seats`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?sessionId=1&status=available&page=1&pageSize=100
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "sessionId": 1,
        "area": "VIP内场",
        "row": "1排",
        "seat": "1号",
        "price": 2580,
        "status": "available"
      }
    ],
    "total": 8560,
    "page": 1,
    "pageSize": 100
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

## 订单管理接口

### 12. 获取订单列表

**接口：** `GET /api/admin/orders`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?status=pending&page=1&pageSize=10&keyword=订单号
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "orderNo": "ORD202501251930001",
        "eventName": "周杰伦2025嘉年华",
        "eventTime": "2025-03-15 19:30",
        "attendees": "张三",
        "phone": "138****8888",
        "seats": "VIP内场 B排3号 ×1",
        "amount": 2580,
        "status": "pending",
        "createTime": "2025-01-25 19:30:00"
      }
    ],
    "total": 1234,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

## AI功能接口

### 13. 获取知识库列表

**接口：** `GET /api/admin/knowledge`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?type=FAQ&page=1&pageSize=10
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": "FAQ001",
        "question": "如何购票？",
        "answer": "购票步骤如下...",
        "category": "购票指南",
        "clicks": 3456,
        "enabled": true,
        "updateTime": "2025-01-20 14:30:00"
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

---

### 14. 获取RAG配置

**接口：** `GET /api/admin/rag/config`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "dataSource": {
      "eventSync": true,
      "sessionSync": true,
      "priceSync": true,
      "orderHistory": true
    },
    "retrieval": {
      "threshold": 0.75,
      "topK": 5,
      "mode": "semantic"
    },
    "knowledgeBase": {
      "faq": true,
      "announcement": true,
      "rules": true,
      "eventInfo": true,
      "venueInfo": true
    },
    "model": {
      "embedding": "text-embedding-ada-002",
      "chat": "GPT-4",
      "temperature": 0.7,
      "maxTokens": 2000
    }
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 15. 保存RAG配置

**接口：** `POST /api/admin/rag/config`

**请求头：**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求参数：**
```json
{
  "dataSource": {
    "eventSync": true
  },
  "retrieval": {
    "threshold": 0.75
  }
}
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "保存成功",
  "data": null,
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 16. 获取推送模板列表

**接口：** `GET /api/admin/templates`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?type=开售提醒&status=enabled&page=1&pageSize=10
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "开售提醒",
        "type": "开售提醒",
        "content": "【开售提醒】您关注的《{演出名称}》即将开售！",
        "channels": ["app", "sms"],
        "timing": "开售前30分钟",
        "usageCount": 12456,
        "enabled": true
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 17. 获取AI分析数据

**接口：** `GET /api/admin/ai/analytics`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?period=7
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "summary": {
      "totalQuestions": 12456,
      "accuracy": 94.5,
      "avgResponseTime": 3.2,
      "satisfaction": 87.3
    },
    "trend": [
      { "date": "2025-01-19", "count": 1200 },
      { "date": "2025-01-20", "count": 1350 }
    ],
    "categoryDistribution": [
      { "category": "购票咨询", "count": 4500 },
      { "category": "退换票", "count": 3200 }
    ],
    "recentRecords": [
      {
        "time": "2025-01-25 21:28:45",
        "question": "怎么抢票？有什么技巧吗？",
        "answer": "您好！抢票确实需要一些技巧...",
        "confidence": 95,
        "feedback": "满意",
        "responseTime": 2.3
      }
    ]
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

## 系统管理接口

### 18. 获取统计数据

**接口：** `GET /api/admin/dashboard/stats`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "todayOrders": 1234,
    "todayRevenue": 456780,
    "activeEvents": 45,
    "totalUsers": 89012,
    "onlineUsers": 567
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 19. 获取操作日志

**接口：** `GET /api/admin/logs`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：**
```
?adminId=1&action=login&startTime=2025-01-01&endTime=2025-01-31&page=1&pageSize=20
```

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "adminId": 1,
        "adminName": "系统管理员",
        "action": "login",
        "resource": "登录",
        "ip": "192.168.1.100",
        "userAgent": "Chrome/120",
        "createTime": "2025-01-25 19:30:00"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---

### 20. 获取角色权限列表

**接口：** `GET /api/admin/roles`

**请求头：**
```
Authorization: Bearer {token}
```

**请求参数：** 无

**成功响应：**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "超级管理员",
        "description": "拥有所有权限",
        "permissions": ["*"],
        "adminCount": 5
      },
      {
        "id": 2,
        "name": "运营人员",
        "description": "只能管理演出和订单",
        "permissions": ["events:view", "events:create", "orders:view"],
        "adminCount": 10
      }
    ],
    "total": 8
  },
  "timestamp": 1769583457651,
  "success": true
}
```

---
