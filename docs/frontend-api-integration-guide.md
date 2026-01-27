# 前端与后端接口对接方案

## 前言

本文档从**纯前端视角**说明如何与SpringBoot后端对接JWT登录认证功能。

**技术栈:**
- 前端: HTML + CSS + JavaScript (Vanilla JS)
- 后端: SpringBoot + JWT
- 数据库: MySQL

---

## 一、登录功能接口对接

### 1.1 登录接口

**接口地址:** `POST /api/admin/auth/login`

**请求参数:**
```json
{
  "username": "admin",       // 管理员账号
  "password": "password123"  // 密码
}
```

**期望后端返回 (成功 - HTTP 200):**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  // JWT Token
    "userInfo": {
      "id": 1,
      "username": "admin",
      "realName": "系统管理员",
      "email": "admin@taopiaopiao.com",
      "role": "super_admin",
      "permissions": [
        "event:manage",
        "order:manage",
        "venue:manage",
        "seat:manage",
        "user:manage"
      ]
    }
  }
}
```

**期望后端返回 (失败 - HTTP 200/400/401):**
```json
{
  "code": 1001,
  "message": "用户名或密码错误"
}
```

### 1.2 前端处理逻辑

```javascript
// 步骤1: 收集表单数据
const username = document.querySelector('input[name="username"]').value.trim();
const password = document.querySelector('input[name="password"]').value;

// 步骤2: 调用登录接口
const response = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
});

// 步骤3: 解析响应
const result = await response.json();

// 步骤4: 判断登录结果
if (result.code === 0) {
    // 登录成功
    const { token, userInfo } = result.data;

    // 4.1 存储Token (选择一种方式)
    sessionStorage.setItem('admin_token', token);           // 临时存储,关闭浏览器清除
    localStorage.setItem('admin_token', token);             // 持久化存储,"记住我"功能使用

    // 4.2 存储用户信息
    sessionStorage.setItem('admin_userInfo', JSON.stringify(userInfo));
    localStorage.setItem('admin_userInfo', JSON.stringify(userInfo));

    // 4.3 跳转到管理后台首页
    window.location.href = 'admin-index.html';
} else {
    // 登录失败,显示错误信息
    alert(result.message || '登录失败');
}
```

---

## 二、认证Token的使用

### 2.1 Token存储位置

**存储方案:**

| 存储方式 | 使用场景 | 生命周期 |
|---------|---------|---------|
| `sessionStorage` | 默认方式 | 关闭浏览器自动清除 |
| `localStorage` | 用户勾选"记住登录状态" | 永久保存,需手动清除 |

**存储代码:**
```javascript
// 存储Token
sessionStorage.setItem('admin_token', token);
localStorage.setItem('admin_token', token);

// 获取Token
const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');

// 清除Token (登出)
sessionStorage.removeItem('admin_token');
localStorage.removeItem('admin_token');
```

### 2.2 所有API请求携带Token

**接口调用示例:**
```javascript
// 获取演出列表
const response = await fetch('/api/admin/events?page=1&page_size=20', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`  // 携带Token
    }
});

const result = await response.json();
```

**后端拦截器行为 (前端需要处理):**

| HTTP状态码 | 含义 | 前端处理 |
|-----------|------|---------|
| 200 | 成功 | 正常处理数据 |
| 401 | 未登录或Token过期 | 清除Token,跳转登录页 |
| 403 | 权限不足 | 提示"权限不足" |
| 500 | 服务器错误 | 提示"系统错误" |

### 2.3 统一的API请求封装

**建议创建 `assets/js/api.js`:**
```javascript
// 获取Token
function getToken() {
    return sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');
}

// 统一请求函数
async function request(url, options = {}) {
    const token = getToken();

    // 添加Token到请求头
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    const result = await response.json();

    // 处理401 - Token过期或无效
    if (response.status === 401) {
        // 清除Token
        sessionStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token');

        // 跳转到登录页
        window.location.href = 'admin-login.html';
        throw new Error('登录已过期');
    }

    // 处理其他错误
    if (result.code !== 0) {
        throw new Error(result.message || '请求失败');
    }

    return result.data;
}

// 使用示例
async function getEvents() {
    try {
        const data = await request('/api/admin/events?page=1&page_size=20');
        console.log(data.items);
    } catch (error) {
        console.error(error.message);
    }
}
```

---

## 三、页面加载时检查登录状态

### 3.1 检查逻辑

**在所有管理页面添加:**
```javascript
window.addEventListener('DOMContentLoaded', () => {
    // 检查是否已登录
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');

    if (!token) {
        // 未登录,跳转到登录页
        window.location.href = 'admin-login.html';
        return;
    }

    // 已登录,加载页面数据
    loadPageData();
});
```

### 3.2 获取用户信息

**从存储中获取:**
```javascript
function getUserInfo() {
    const userInfoStr = sessionStorage.getItem('admin_userInfo') || localStorage.getItem('admin_userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

// 使用示例
const userInfo = getUserInfo();
document.querySelector('.user-name').textContent = userInfo.realName;
document.querySelector('.user-role').textContent = userInfo.role;
```

---

## 四、登出功能

### 4.1 登出接口

**接口地址:** `POST /api/admin/auth/logout`

**请求头:**
```
Authorization: Bearer {token}
```

**期望后端返回:**
```json
{
  "code": 0,
  "message": "登出成功"
}
```

### 4.2 前端登出逻辑

```javascript
async function logout() {
    try {
        // 调用后端登出接口 (可选,如果不调用也可以直接清除Token)
        await fetch('/api/admin/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
    } catch (error) {
        console.error('登出接口调用失败:', error);
    } finally {
        // 无论后端接口是否成功,都清除本地Token
        sessionStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_userInfo');
        localStorage.removeItem('admin_userInfo');

        // 跳转到登录页
        window.location.href = 'admin-login.html';
    }
}

// 绑定到登出按钮
document.querySelector('.logout-btn').addEventListener('click', logout);
```

---

## 五、完整的登录页面示例

### 5.1 HTML部分 (admin-login.html)

**修改点:**
1. 删除验证码组件
2. 添加表单提交事件
3. 添加错误提示区域

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理员登录 - 淘票票管理后台</title>
    <link rel="stylesheet" href="assets/css/common.css">
    <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);">
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="admin-form" style="width: 100%; max-width: 440px;">
            <!-- Logo -->
            <div class="text-center" style="margin-bottom: 40px;">
                <div style="font-size: 56px; margin-bottom: 16px;">🎫</div>
                <h1 style="font-size: 28px; font-weight: 700; color: #2c3e50; margin-bottom: 8px;">淘票票管理后台</h1>
                <p class="text-muted">管理员登录</p>
            </div>

            <!-- 登录表单 -->
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">管理员账号</label>
                    <input type="text" class="form-input" name="username" placeholder="请输入管理员账号" required>
                </div>

                <div class="form-group">
                    <label class="form-label">密码</label>
                    <input type="password" class="form-input" name="password" placeholder="请输入密码" required>
                </div>

                <div class="form-group">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" name="remember" style="margin-right: 8px;">
                        <span class="text-small">记住登录状态</span>
                    </label>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 24px; padding: 14px; font-size: 16px;">登录</button>

                <div id="errorMessage" class="text-center" style="margin-top: 16px; color: #d32f2f; display: none;"></div>
            </form>

            <div class="text-center text-small text-muted" style="margin-top: 32px;">
                忘记密码？<a href="#" style="color: #1976d2;">联系系统管理员</a>
            </div>

            <!-- 安全提示 -->
            <div class="text-center text-small text-muted" style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee;">
                <p>为了您的账户安全，请注意：</p>
                <ul style="list-style: none; padding: 0; margin-top: 12px; line-height: 1.8;">
                    <li>• 请使用官方分配的账号密码登录</li>
                    <li>• 不要在公共设备上保存登录状态</li>
                    <li>• 定期更换密码，确保账户安全</li>
                </ul>
            </div>
        </div>
    </div>

    <script>
        // 登录表单处理
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(e.target);
            const username = formData.get('username').trim();
            const password = formData.get('password');
            const remember = formData.get('remember') === 'on';

            // 简单验证
            if (!username || !password) {
                showError('请输入用户名和密码');
                return;
            }

            // 禁用提交按钮
            const submitButton = e.target.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = '登录中...';

            try {
                // 调用登录接口
                const response = await fetch('/api/admin/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.code === 0) {
                    // 登录成功
                    const { token, userInfo } = result.data;

                    // 存储Token和用户信息
                    const storage = remember ? localStorage : sessionStorage;
                    storage.setItem('admin_token', token);
                    storage.setItem('admin_userInfo', JSON.stringify(userInfo));
                    // 同时在sessionStorage中也存储一份
                    sessionStorage.setItem('admin_token', token);
                    sessionStorage.setItem('admin_userInfo', JSON.stringify(userInfo));

                    // 跳转到管理后台首页
                    window.location.href = 'admin-index.html';
                } else {
                    // 登录失败
                    showError(result.message || '登录失败');
                }
            } catch (error) {
                showError('网络错误,请稍后重试');
                console.error('登录错误:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // 显示错误信息
        function showError(message) {
            const errorDiv = document.getElementById('errorMessage');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    </script>
</body>
</html>
```

---

## 六、其他管理页面示例

### 6.1 admin-index.html (管理后台首页)

**在页面底部添加:**
```html
<script>
// 页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', async () => {
    // 检查Token
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');

    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    // 获取用户信息
    const userInfoStr = sessionStorage.getItem('admin_userInfo') || localStorage.getItem('admin_userInfo');
    const userInfo = JSON.parse(userInfoStr);

    // 显示用户信息 (可选)
    // document.querySelector('.user-name').textContent = userInfo.realName;

    // 加载页面数据
    try {
        await loadDashboardData();
    } catch (error) {
        console.error('加载数据失败:', error);
        if (error.message === '登录已过期') {
            // 401错误已在request中处理,这里可以不做额外处理
        }
    }
});

// 加载仪表盘数据
async function loadDashboardData() {
    // 示例: 获取统计数据
    const stats = await request('/api/admin/dashboard/stats');

    // 渲染数据到页面
    document.querySelector('.stat-order-count').textContent = stats.todayOrders;
    document.querySelector('.stat-transaction-amount').textContent = `¥${stats.todayAmount}`;
}

// 统一请求函数 (可以提取到单独的js文件)
async function request(url, options = {}) {
    const token = sessionStorage.getItem('admin_token') || localStorage.getItem('admin_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // 处理401
    if (response.status === 401) {
        sessionStorage.removeItem('admin_token');
        localStorage.removeItem('admin_token');
        window.location.href = 'admin-login.html';
        throw new Error('登录已过期');
    }

    const result = await response.json();

    if (result.code !== 0) {
        throw new Error(result.message || '请求失败');
    }

    return result.data;
}
</script>
```

---

## 七、API接口清单 (前端需要调用)

### 7.1 认证相关

| 接口 | 方法 | 路径 | 说明 |
|-----|------|------|------|
| 登录 | POST | /api/admin/auth/login | 用户登录,获取Token |
| 登出 | POST | /api/admin/auth/logout | 用户登出 (可选) |

### 7.2 业务接口示例 (所有接口需要携带Token)

| 接口 | 方法 | 路径 | 说明 |
|-----|------|------|------|
| 演出列表 | GET | /api/admin/events | 分页查询演出列表 |
| 演出详情 | GET | /api/admin/events/{id} | 获取演出详情 |
| 创建演出 | POST | /api/admin/events | 创建新演出 |
| 更新演出 | PUT | /api/admin/events/{id} | 更新演出信息 |
| 删除演出 | DELETE | /api/admin/events/{id} | 删除演出 |
| 场次列表 | GET | /api/admin/sessions | 分页查询场次列表 |
| 订单列表 | GET | /api/admin/orders | 分页查询订单列表 |
| 用户统计 | GET | /api/admin/dashboard/stats | 获取统计数据 |

---

## 八、错误码约定 (后端返回)

| 错误码 | 说明 | 前端处理 |
|-------|------|---------|
| 0 | 成功 | 正常处理 |
| 1001 | 用户名或密码错误 | 提示"用户名或密码错误" |
| 1002 | Token无效或过期 | 清除Token,跳转登录页 |
| 1003 | 权限不足 | 提示"权限不足" |
| 1004 | 参数错误 | 提示具体参数错误信息 |
| 5000 | 服务器内部错误 | 提示"系统错误,请联系管理员" |

---

## 九、需要后端配合的内容

### 9.1 后端需要实现的接口

**必须实现:**
1. `POST /api/admin/auth/login` - 登录接口
   - 请求: `{ username, password }`
   - 响应: `{ code: 0, data: { token, userInfo } }`

**可选实现:**
2. `POST /api/admin/auth/logout` - 登出接口
   - 请求头: `Authorization: Bearer {token}`
   - 响应: `{ code: 0, message: "登出成功" }`

### 9.2 后端拦截器要求

1. **所有 `/api/admin/*` 接口需要验证Token**
   - 从请求头 `Authorization: Bearer {token}` 获取Token
   - 验证Token签名和有效期
   - 验证失败返回 HTTP 401

2. **权限验证**
   - 根据用户角色验证接口访问权限
   - 权限不足返回 HTTP 403

3. **CORS配置**
   - 允许前端域名跨域访问
   - 允许携带 `Authorization` 头

### 9.3 响应格式要求

**成功响应:**
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

**失败响应:**
```json
{
  "code": 1001,
  "message": "错误信息描述"
}
```

---

## 十、测试建议

### 10.1 登录功能测试

```javascript
// 测试用例1: 正确的用户名密码
fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
})
.then(res => res.json())
.then(data => {
    console.assert(data.code === 0, '登录成功');
    console.assert(data.data.token !== undefined, '返回Token');
    console.assert(data.data.userInfo.username === 'admin', '返回用户信息');
});

// 测试用例2: 错误的密码
fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'wrong_password' })
})
.then(res => res.json())
.then(data => {
    console.assert(data.code !== 0, '登录失败');
    console.assert(data.message !== undefined, '返回错误信息');
});
```

### 10.2 Token验证测试

```javascript
// 测试: 不携带Token访问受保护接口
fetch('/api/admin/events')
.then(res => {
    console.assert(res.status === 401, '未登录返回401');
});

// 测试: 携带有效Token访问
fetch('/api/admin/events', {
    headers: { 'Authorization': `Bearer ${valid_token}` }
})
.then(res => {
    console.assert(res.status === 200, '已登录返回200');
});
```

---

## 十一、常见问题

### Q1: 跨域问题如何解决?
**A:** 后端需要配置CORS:
```java
// SpringBoot配置
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:8081");  // 前端地址
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);  // 允许携带Token
        // ...
    }
}
```

### Q2: Token过期后如何处理?
**A:** 前端收到401响应后,自动清除Token并跳转登录页:
```javascript
if (response.status === 401) {
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('admin_token');
    window.location.href = 'admin-login.html';
}
```

### Q3: 如何实现"记住我"功能?
**A:** 用户勾选时,将Token存储到localStorage而非sessionStorage:
```javascript
const storage = remember ? localStorage : sessionStorage;
storage.setItem('admin_token', token);
```

---

## 总结

本文档提供了**纯前端视角**的接口对接方案,不涉及后端具体实现。前端开发者只需:

1. **修改登录页面**: 删除验证码,添加表单提交逻辑
2. **存储Token**: 登录成功后存储到sessionStorage/localStorage
3. **携带Token**: 所有API请求在Header中携带 `Authorization: Bearer {token}`
4. **处理401**: Token过期时清除并跳转登录页
5. **检查登录**: 页面加载时验证Token是否存在

后端同事需要配合实现:
1. 登录接口返回 `{ token, userInfo }`
2. JWT Token生成和验证拦截器
3. 统一的响应格式 `{ code, message, data }`
4. CORS跨域配置
