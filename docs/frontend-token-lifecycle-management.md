# 前端Token有效期管理方案

## 前言

本文档从**纯前端视角**说明Token的有效期管理策略，帮助前端开发者理解Token的生命周期，并正确处理各种Token失效场景。

---

## 一、Token有效性理解

### 1.1 什么是Token有效期？

**Token的有效性由两个因素决定:**

| 因素 | 说明 | 前端能否判断 |
|------|------|-------------|
| **后端验证** | 后端验证Token是否过期或被登出 | ❌ 前端无法判断，只能通过后端响应得知 |
| **本地存在** | Token是否存在于本地存储中 | ✅ 前端可以判断 |

**前端视角:**
```
Token存在 = 存在于sessionStorage或localStorage
Token有效 = 后端API返回成功 (200)
Token失效 = 后端API返回401
```

### 1.2 前端不需要做的事情

❌ **不要在前端解析JWT验证过期时间** - 这不安全且不可靠
❌ **不要在前端实现Token黑名单** - 这是后端的责任
❌ **不要在前端计算Token剩余时间** - 后端才是唯一可信的来源
✅ **只需要存储Token并携带请求** - 让后端验证有效性

---

## 二、Token存储策略

### 2.1 存储位置

```javascript
// 登录成功后存储Token
function saveToken(token, userInfo, remember = false) {
    // 始终存储到sessionStorage (关闭浏览器自动清除)
    sessionStorage.setItem('admin_token', token);
    sessionStorage.setItem('admin_userInfo', JSON.stringify(userInfo));

    // 用户勾选"记住我"时，额外存储到localStorage
    if (remember) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_userInfo', JSON.stringify(userInfo));
    } else {
        // 未勾选时，清除localStorage中的旧Token
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_userInfo');
    }
}
```

### 2.2 存储对比

| 存储方式 | 生命周期 | 适用场景 |
|---------|---------|---------|
| `sessionStorage` | 关闭浏览器标签页即清除 | 默认方式，更安全 |
| `localStorage` | 持久化存储，手动清除 | 用户勾选"记住我" |

### 2.3 获取Token

```javascript
// 优先从sessionStorage获取，如果没有则从localStorage获取
function getToken() {
    return sessionStorage.getItem('admin_token') ||
           localStorage.getItem('admin_token');
}

// 获取用户信息
function getUserInfo() {
    const userInfoStr = sessionStorage.getItem('admin_userInfo') ||
                        localStorage.getItem('admin_userInfo');
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}
```

---

## 三、Token失效场景处理

### 3.1 Token失效的场景

**从前端视角，Token失效只有一种表现:**

```
后端API返回 HTTP 401 (Unauthorized)
```

**401可能的原因 (后端处理):**
- JWT Token已过期 (超过24小时)
- 用户已登出 (Token在后端黑名单中)
- Token格式无效
- Token被篡改

**前端不需要区分具体原因，统一处理:**
```javascript
if (response.status === 401) {
    // 清除本地Token
    clearToken();

    // 跳转到登录页
    window.location.href = 'admin-login.html';
}
```

### 3.2 401处理流程图

```
发起API请求 (携带Token)
    ↓
后端返回401
    ↓
前端清除本地Token
    ↓
跳转到登录页
    ↓
显示提示 "登录已过期，请重新登录"
```

---

## 四、统一的API请求封装

### 4.1 request函数实现

```javascript
/**
 * 统一的API请求函数
 * @param {string} url - 请求路径
 * @param {object} options - 请求配置
 * @returns {Promise<any>} 响应数据
 */
async function request(url, options = {}) {
    // 获取Token
    const token = getToken();

    // 构建请求头
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    // 添加Token到请求头
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        // 发起请求
        const response = await fetch(url, {
            ...options,
            headers
        });

        // 解析响应
        const result = await response.json();

        // 处理401 - Token无效或过期
        if (response.status === 401) {
            handleTokenExpired();
            throw new Error('登录已过期');
        }

        // 处理403 - 权限不足
        if (response.status === 403) {
            throw new Error(result.message || '权限不足');
        }

        // 处理其他错误
        if (result.code !== 0) {
            throw new Error(result.message || '请求失败');
        }

        return result.data;

    } catch (error) {
        // 如果是401错误，已经在上面处理了，这里直接抛出
        if (error.message === '登录已过期') {
            throw error;
        }

        // 其他网络错误或异常
        console.error('API请求错误:', error);
        throw error;
    }
}

/**
 * 处理Token过期
 */
function handleTokenExpired() {
    // 清除Token
    clearToken();

    // 显示提示 (可选)
    // alert('登录已过期，请重新登录');

    // 跳转到登录页
    window.location.href = 'admin-login.html';
}

/**
 * 清除Token
 */
function clearToken() {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_userInfo');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_userInfo');
}
```

### 4.2 使用示例

```javascript
// GET请求
async function getEvents() {
    try {
        const data = await request('/api/admin/events', {
            method: 'GET'
        });
        console.log('演出列表:', data.items);
    } catch (error) {
        if (error.message === '登录已过期') {
            // 自动跳转到登录页，无需处理
            return;
        }
        console.error('加载失败:', error.message);
    }
}

// POST请求
async function createEvent(eventData) {
    try {
        const data = await request('/api/admin/events', {
            method: 'POST',
            body: eventData
        });
        console.log('创建成功:', data.id);
    } catch (error) {
        if (error.message === '登录已过期') {
            return;
        }
        alert('创建失败: ' + error.message);
    }
}
```

---

## 五、登录流程

### 5.1 登录成功处理

```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get('username').trim();
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';

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
            saveToken(token, userInfo, remember);

            // 跳转到管理后台首页
            window.location.href = 'admin-index.html';
        } else {
            // 登录失败
            showError(result.message || '登录失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
        console.error(error);
    }
});
```

### 5.2 登录成功后Token何时失效？

**前端视角:**

| 时间点 | Token状态 | 说明 |
|-------|----------|------|
| 登录成功 | ✅ 有效 | Token已存储到本地 |
| 24小时内 | ✅ 有效 | 假设后端设置的JWT有效期为24小时 |
| 24小时后 | ❌ 失效 | 下次API请求会返回401，自动跳转登录页 |
| 用户点击登出 | ❌ 失效 | 立即清除本地Token并跳转登录页 |
| 关闭浏览器 | ❌ 失效 | sessionStorage被清除 (如果用localStorage则仍然有效) |

**重要: 前端无法精确知道Token何时过期，只能通过后端401响应得知**

---

## 六、登出流程

### 6.1 主动登出 (用户点击登出按钮)

```javascript
async function logout() {
    try {
        // 调用后端登出接口 (通知后端将Token加入黑名单)
        const token = getToken();
        if (token) {
            await fetch('/api/admin/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('登出接口调用失败:', error);
        // 即使接口失败，也继续清除本地Token
    } finally {
        // 无论后端接口是否成功，都清除本地Token
        clearToken();

        // 跳转到登录页
        window.location.href = 'admin-login.html';
    }
}

// 绑定到登出按钮
document.querySelector('.logout-btn').addEventListener('click', logout);
```

### 6.2 被动登出 (Token过期)

```javascript
// 在API请求封装中统一处理
async function request(url, options) {
    const response = await fetch(url, { /* ... */ });

    if (response.status === 401) {
        // Token过期或失效，自动登出
        clearToken();
        window.location.href = 'admin-login.html';
        throw new Error('登录已过期');
    }

    // ...
}
```

---

## 七、页面加载时检查登录状态

### 7.1 检查逻辑

```javascript
window.addEventListener('DOMContentLoaded', () => {
    // 检查Token是否存在
    const token = getToken();

    if (!token) {
        // 未登录，跳转到登录页
        window.location.href = 'admin-login.html';
        return;
    }

    // Token存在，加载页面数据
    loadPageData();
});
```

### 7.2 注意事项

⚠️ **前端只能检查Token是否存在，不能验证Token是否有效**

错误的做法:
```javascript
// ❌ 错误：Token存在就认为有效
if (getToken()) {
    // 继续访问...
}
```

正确的做法:
```javascript
// ✅ 正确：检查Token是否存在，然后发起API请求
if (getToken()) {
    // 发起API请求，如果Token无效后端会返回401
    loadPageData(); // 这个函数里会调用API
}
```

---

## 八、常见问题

### Q1: 前端需要解析JWT获取过期时间吗？

**A:** 不需要。原因:
1. **安全问题** - 前端解析JWT不安全，Token可能被伪造
2. **可靠性问题** - 前端计算的过期时间可能与后端不一致
3. **不必要的复杂度** - 让后端验证即可，前端只需要处理401

### Q2: 前端需要定时刷新Token吗？

**A:** 不需要。当前方案Token过期后需要重新登录，这样更安全。如果需要自动刷新，需要实现refresh_token机制，但这会增加复杂度。

### Q3: 如何在多个标签页同步登录状态？

**A:** 监听storage事件:
```javascript
// 当其他标签页登出时，当前页也自动登出
window.addEventListener('storage', (e) => {
    if (e.key === 'admin_token' && !e.newValue) {
        // 其他标签页清除了Token，当前页也登出
        window.location.href = 'admin-login.html';
    }
});
```

### Q4: Token过期后能提前知道吗？

**A:** 前端无法提前知道。只能通过以下方式:
1. **每次API请求时** - 如果返回401就知道过期了
2. **后端在响应头中返回剩余时间** - 需要后端配合
3. **解析JWT的exp字段** - 不推荐，不可靠

**建议: 不需要提前知道，等401时再处理即可**

### Q5: 为什么不在前端判断Token过期？

**A:** 因为:
1. **后端才是可信的权威** - Token的有效性由后端决定
2. **避免时区/时钟问题** - 前端和后端时间可能不一致
3. **更简单的逻辑** - 前端只负责发送请求和处理响应

---

## 九、完整示例代码

### 9.1 auth.js - 认证模块

```javascript
/**
 * 认证模块 - Token管理
 */

const TOKEN_KEY = 'admin_token';
const USER_INFO_KEY = 'admin_userInfo';

/**
 * 获取Token
 */
function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

/**
 * 保存Token
 */
function saveToken(token, userInfo, remember = false) {
    // 始终保存到sessionStorage
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));

    // 如果选择记住，同时保存到localStorage
    if (remember) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
    } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_INFO_KEY);
    }
}

/**
 * 获取用户信息
 */
function getUserInfo() {
    const userInfoStr = sessionStorage.getItem(USER_INFO_KEY) ||
                        localStorage.getItem(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
}

/**
 * 检查是否已登录
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * 清除Token (登出)
 */
function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_INFO_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
}

/**
 * 登出并跳转到登录页
 */
async function logout() {
    try {
        const token = getToken();
        if (token) {
            await fetch('/api/admin/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }
    } catch (error) {
        console.error('登出接口调用失败:', error);
    } finally {
        clearToken();
        window.location.href = 'admin-login.html';
    }
}
```

### 9.2 api.js - API请求封装

```javascript
/**
 * API请求封装
 */

/**
 * 统一请求函数
 */
async function request(url, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const result = await response.json();

        // 处理401
        if (response.status === 401) {
            clearToken();
            window.location.href = 'admin-login.html';
            throw new Error('登录已过期');
        }

        // 处理403
        if (response.status === 403) {
            throw new Error(result.message || '权限不足');
        }

        // 处理其他错误
        if (result.code !== 0) {
            throw new Error(result.message || '请求失败');
        }

        return result.data;

    } catch (error) {
        if (error.message === '登录已过期') {
            throw error;
        }
        console.error('API请求错误:', error);
        throw error;
    }
}

/**
 * GET请求
 */
function get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return request(fullUrl, { method: 'GET' });
}

/**
 * POST请求
 */
function post(url, data = {}) {
    return request(url, {
        method: 'POST',
        body: data
    });
}

/**
 * PUT请求
 */
function put(url, data = {}) {
    return request(url, {
        method: 'PUT',
        body: data
    });
}

/**
 * DELETE请求
 */
function del(url) {
    return request(url, { method: 'DELETE' });
}
```

### 9.3 在页面中使用

```html
<!DOCTYPE html>
<html>
<head>
    <title>管理后台</title>
    <script src="assets/js/auth.js"></script>
    <script src="assets/js/api.js"></script>
</head>
<body>
    <!-- 页面内容 -->

    <script>
        // 页面加载时检查登录状态
        window.addEventListener('DOMContentLoaded', async () => {
            if (!isAuthenticated()) {
                window.location.href = 'admin-login.html';
                return;
            }

            // 显示用户信息
            const userInfo = getUserInfo();
            console.log('当前用户:', userInfo.username);

            // 加载页面数据
            try {
                const data = await get('/api/admin/events');
                renderEvents(data.items);
            } catch (error) {
                if (error.message !== '登录已过期') {
                    console.error('加载失败:', error.message);
                }
            }
        });

        // 渲染演出列表
        function renderEvents(events) {
            // 渲染逻辑...
        }

        // 绑定登出按钮
        document.querySelector('.logout-btn').addEventListener('click', logout);
    </script>
</body>
</html>
```

---

## 十、总结

### 前端Token管理的核心原则

1. **只存储，不验证** - 前端只负责存储Token，验证由后端完成
2. **统一处理401** - 所有API请求统一处理401响应
3. **被动登出** - Token过期时由后端返回401，前端清除Token并跳转登录页
4. **主动登出** - 用户点击登出时，调用后端接口并清除本地Token
5. **简单可靠** - 不在前端解析JWT，不计算过期时间，让后端做权威判断

### Token生命周期 (前端视角)

```
登录成功 → 存储Token → 发起API请求 (携带Token)
                              ↓
                         后端返回成功 → 继续使用
                              ↓
                         后端返回401 → 清除Token → 跳转登录页
```

### 关键代码片段

```javascript
// 存储
saveToken(token, userInfo, remember);

// 获取
const token = getToken();

// 使用
fetch('/api/admin/events', {
    headers: { 'Authorization': `Bearer ${token}` }
});

// 处理401
if (response.status === 401) {
    clearToken();
    window.location.href = 'admin-login.html';
}

// 登出
await logout();
```

---

这份文档说明了前端应该如何理解和管理Token的有效性，不涉及后端实现细节。
