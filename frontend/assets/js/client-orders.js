/**
 * 淘票票客户端 - 订单相关接口
 * 文件：client-orders.js
 * API路径前缀：/api/client/orders
 */

// API基础路径
const ORDERS_BASE_URL = '/api/client/orders';

/**
 * 创建订单
 * @param {number} sessionId - 场次ID
 * @param {number} eventId - 演出ID
 * @param {array} seatIds - 座位ID列表
 * @returns {Promise<object>} 订单数据 { id, orderNo, userId, sessionId, eventId, seatIds, seatCount, unitPrice, totalAmount, status, expireTime, createdAt }
 */
async function createOrder(sessionId, eventId, seatIds) {
    return clientPost(ORDERS_BASE_URL, {
        sessionId: sessionId,
        eventId: eventId,
        seatIds: seatIds
    });
}

/**
 * 支付订单
 * @param {string} orderNo - 订单号
 * @param {string} paymentMethod - 支付方式 (wechat, alipay, balance)
 * @returns {Promise<object>} 支付结果 { orderNo, payStatus, payTime }
 */
async function payOrder(orderNo, paymentMethod = 'wechat') {
    return clientPost(`${ORDERS_BASE_URL}/pay`, {
        orderNo: orderNo,
        paymentMethod: paymentMethod
    });
}

/**
 * 取消订单
 * @param {string} orderNo - 订单号
 * @returns {Promise<boolean>} 是否成功
 */
async function cancelOrder(orderNo) {
    return clientPost(`${ORDERS_BASE_URL}/${orderNo}/cancel`, {});
}

/**
 * 查询订单详情
 * @param {string} orderNo - 订单号
 * @returns {Promise<object>} 订单详情
 */
async function getOrderDetail(orderNo) {
    return clientGet(`${ORDERS_BASE_URL}/${orderNo}`);
}

/**
 * 查询用户订单列表
 * @param {object} params - 查询参数
 * @param {number} params.status - 订单状态筛选
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise<object>} 订单列表 { list, total, page, pageSize }
 */
async function getOrderList(params = {}) {
    const defaultParams = {
        page: 1,
        pageSize: 10
    };
    return clientGet(ORDERS_BASE_URL, { ...defaultParams, ...params });
}

/**
 * 订单状态枚举
 */
const ORDER_STATUS = {
    PENDING: 0,      // 待支付
    PAID: 1,         // 已支付
    CANCELLED: 2,    // 已取消
    REFUNDED: 3,     // 已退款
    TIMEOUT: 4       // 超时取消
};

/**
 * 订单状态文本
 */
function getOrderStatusText(status) {
    const statusMap = {
        0: '待支付',
        1: '已支付',
        2: '已取消',
        3: '已退款',
        4: '超时取消'
    };
    return statusMap[status] || '未知';
}

/**
 * 订单状态颜色类
 */
function getOrderStatusClass(status) {
    const classMap = {
        0: 'status-pending',
        1: 'status-paid',
        2: 'status-cancelled',
        3: 'status-refunded',
        4: 'status-timeout'
    };
    return classMap[status] || '';
}

// 导出函数和常量
// export {
//     createOrder,
//     payOrder,
//     cancelOrder,
//     getOrderDetail,
//     getOrderList,
//     ORDER_STATUS,
//     getOrderStatusText,
//     getOrderStatusClass
// };
