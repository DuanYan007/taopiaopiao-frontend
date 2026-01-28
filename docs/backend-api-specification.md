# 管理后台后端接口规范文档

## 前言

本文档提供给后端开发者，说明前端需要的API接口规范。后端需要实现这些接口以配合前端的Token管理方案。

---

## 一、接口通用规范

### 1.1 基础URL

```
http://your-domain/api/admin
```

### 1.2 统一响应格式

**成功响应:**
```json
{
  "code": 200,
  "msg": "success",
  "data": { ... },
  "timestamp": 1769583457651,
  "success": true
}
```

**失败响应:**
```json
{
  "code": 错误码,
  "msg": "错误信息描述",
  "timestamp": 1769583457651,
  "success": false
}
```

### 1.3 HTTP状态码

| 状态码 | 说明 | 前端处理 |
|-------|------|---------|
| 200 | 请求成功 | 正常处理数据 |
| 401 | 未授权 (Token无效/过期) | 清除Token，跳转登录页 |
| 403 | 权限不足 | 提示权限不足 |
| 500 | 服务器错误 | 提示系统错误 |

### 1.4 请求头

所有需要认证的接口必须携带:
```
Authorization: Bearer {token}
```

---

## 二、认证相关接口

### 2.1 管理员登录

**接口地址:** `POST /api/admin/auth/login`

**请求头:**
```
Content-Type: application/json
```

**请求参数:**
```json
{
  "username": "admin",       // 管理员账号 (必填)
  "password": "password123"  // 密码 (必填)
}
```

**响应 (成功):**
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

**响应 (失败):**
```json
{
  "code": 1001,
  "msg": "用户名或密码错误",
  "timestamp": 1769583457651,
  "success": false
}
```

**Token规范:**
- JWT格式
- 有效期: 24小时
- 必须包含以下Claims:
  - `sub`: 用户ID (数字字符串)
  - `username`: 用户名
  - `jti`: Token唯一ID (UUID,用于黑名单)
  - `iat`: 签发时间戳 (秒)
  - `exp`: 过期时间戳 (秒)

---

### 2.2 管理员登出

**接口地址:** `POST /api/admin/auth/logout`

**请求头:**
```
Authorization: Bearer {token}
```

**请求参数:** 无

**响应:**
```json
{
  "code": 200,
  "msg": "登出成功",
  "timestamp": 1769583457651,
  "success": true
}
```

**后端处理要求:**
1. 验证Token有效性
2. 从Token中提取`jti`
3. 将`jti`加入黑名单 (Redis或数据库)
4. 黑名单的TTL设置为Token剩余有效期

---

### 2.3 Token验证拦截器

**作用范围:** 所有 `/api/admin/*` 接口 (除登录接口外)

**验证逻辑:**
```
1. 检查请求头是否包含 Authorization: Bearer {token}
2. 如果没有 → 返回 401
3. 解析JWT Token
4. 检查Token是否过期 (exp claim)
   - 过期 → 返回 401
5. 检查Token是否在黑名单中
   - 在黑名单中 → 返回 401 (消息: "令牌已失效")
6. 验证通过 → 将用户信息注入请求上下文，放行
```

**401响应格式:**
```json
{
  "code": 401,
  "msg": "登录已过期" 或 "令牌已失效" 或 "未提供认证令牌",
  "timestamp": 1769583457651,
  "success": false
}
```






