/**
 * 淘票票客户端 - 订单相关接口
 * 文件：client-orders.js
 * API路径前缀：/api/client/orders
 */

// API基础路径
const ORDERS_BASE_URL = '/api/client/orders';

/**
 * 支付订单（新逻辑）
 * 选座成功后已创建待支付订单，此接口用于支付该订单
 * @param {string} orderNo - 订单号（必填，来自选座接口返回）
 * @returns {Promise<object>} 订单详情
 */
async function payOrder(orderNo) {
    console.log('=== payOrder ===');
    console.log('请求URL:', ORDERS_BASE_URL);
    console.log('请求数据:', { orderNo: orderNo });

    const response = await clientPost(ORDERS_BASE_URL, {
        orderNo: orderNo
    });

    console.log('支付响应:', response);
    return response;
}

/**
 * 支付已有订单（旧函数名，保持兼容）
 * @deprecated 请使用 payOrder 代替
 */
async function payExistingOrder(orderNo) {
    return payOrder(orderNo);
}

/**
 * 创建订单并直接支付（旧逻辑，保留兼容）
 * @deprecated 请使用 payExistingOrder 代替
 * @param {number} sessionId - 场次ID
 * @param {number} eventId - 演出ID
 * @param {array} seatIds - 座位ID列表
 * @param {array} seatDetails - 座位详细信息 [{seatId, areaCode, areaName, rowNum, seatNum, price}, ...]
 * @param {number} totalAmount - 订单总金额
 * @returns {Promise<object>} 订单数据
 */
async function createOrder(sessionId, eventId, seatIds, seatDetails, totalAmount) {
    return clientPost(ORDERS_BASE_URL, {
        sessionId: sessionId,
        eventId: eventId,
        seatIds: seatIds,
        seatDetails: seatDetails,
        totalAmount: totalAmount
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
 * 删除订单
 * @param {string} orderNo - 订单号
 * @returns {Promise<boolean>} 是否成功
 */
async function deleteOrder(orderNo) {
    return clientPost(`${ORDERS_BASE_URL}/${orderNo}/delete`, {});
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
