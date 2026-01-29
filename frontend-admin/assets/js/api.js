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
        // 调试日志
        console.log('========== API请求开始 ==========');
        console.log('请求URL:', url);
        console.log('请求方法:', options.method);
        console.log('请求头:', headers);
        console.log('请求体类型:', typeof options.body);
        console.log('请求体内容:', options.body);

        const response = await fetch(url, {
            ...options,
            headers
        });

        console.log('响应状态码:', response.status);
        console.log('响应状态文本:', response.statusText);

        const result = await response.json();

        console.log('响应数据:', result);
        console.log('========== API请求结束 ==========');

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
        console.error('========== API请求异常 ==========');
        console.error('错误类型:', error.name);
        console.error('错误信息:', error.message);
        console.error('错误堆栈:', error.stack);
        console.error('==================================');

        if (error.message === '登录已过期') {
            throw error;
        }
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
    console.log('POST函数调用 - URL:', url);
    console.log('POST函数调用 - 原始数据:', data);
    const jsonString = JSON.stringify(data);
    console.log('POST函数调用 - 序列化后JSON:', jsonString);

    return request(url, {
        method: 'POST',
        body: jsonString
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
        body: JSON.stringify(data)
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
