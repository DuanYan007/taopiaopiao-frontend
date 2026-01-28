/**
 * 淘票票管理后台 - API请求封装
 * 统一处理Token携带、401错误、权限验证等
 */

/**
 * 统一的API请求函数
 * @param {string} url - 请求路径
 * @param {object} options - 请求配置
 * @returns {Promise<any>} 响应数据
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

        // 处理401 - Token无效或过期
        if (response.status === 401) {
            clearToken();
            window.location.href = 'admin-login.html';
            throw new Error('登录已过期');
        }

        // 处理403 - 权限不足
        if (response.status === 403) {
            throw new Error(result.msg || '权限不足');
        }

        // 处理其他错误
        if (result.code !== 200) {
            throw new Error(result.msg || '请求失败');
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
 * @param {string} url - 请求路径
 * @param {object} params - 查询参数
 * @returns {Promise<any>} 响应数据
 */
function get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return request(fullUrl, { method: 'GET' });
}

/**
 * POST请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @returns {Promise<any>} 响应数据
 */
function post(url, data = {}) {
    return request(url, {
        method: 'POST',
        body: data
    });
}

/**
 * PUT请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @returns {Promise<any>} 响应数据
 */
function put(url, data = {}) {
    return request(url, {
        method: 'PUT',
        body: data
    });
}

/**
 * DELETE请求
 * @param {string} url - 请求路径
 * @returns {Promise<any>} 响应数据
 */
function del(url) {
    return request(url, { method: 'DELETE' });
}
