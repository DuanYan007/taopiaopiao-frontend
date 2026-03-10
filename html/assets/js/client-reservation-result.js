/**
 * 淘票票客户端 - 支付结果页面逻辑
 * 文件：client-reservation-result.js
 * 页面：reservation-result.html
 * 说明：该页面是支付成功后返回的页面，根据订单号查询完整信息进行渲染
 */

// 全局变量
let orderData = null;
let eventData = null;   // 演出信息
let sessionData = null; // 场次信息
let orderNo = null;

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('支付结果页面初始化');

    // 更新用户信息显示
    updateUserInfo();

    // 从 URL 参数获取订单号和状态
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') || 'success';
    orderNo = urlParams.get('orderNo');

    // 必须有订单号才能显示内容
    if (!orderNo) {
        showFailStatus('订单号缺失，请从订单中心进入');
        return;
    }

    // 根据状态加载不同内容
    if (status === 'success') {
        // 支付成功 - 从后端获取订单详情，然后查询演出和场次信息
        await loadOrderAndEventInfo(orderNo);
    } else if (status === 'pending') {
        // 待支付状态 - 显示待支付信息
        await loadPendingOrderInfo(orderNo);
    } else {
        // 失败状态
        showFailStatus('操作失败，请重试');
    }
});

/**
 * 更新用户信息显示
 */
function updateUserInfo() {
    const userInfoDiv = document.querySelector('.header-actions .user-info, .header-actions > div:last-child');
    if (!userInfoDiv) return;

    const user = getCurrentUser();
    if (user) {
        userInfoDiv.innerHTML = `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #e3f2fd; display: flex; align-items: center; justify-content: center;">
                ${user.nickname ? user.nickname.charAt(0) : '用'}
            </div>
            <span>${user.nickname || '用户'}</span>
        `;
    } else {
        userInfoDiv.innerHTML = `
            <a href="login.html" class="btn btn-outline btn-small">登录</a>
        `;
    }
}

/**
 * 加载订单、演出和场次信息
 */
async function loadOrderAndEventInfo(orderNo) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    try {
        // 显示加载中
        container.innerHTML = `
            <div class="loading-state" style="padding: 60px 0;">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载订单信息...</div>
            </div>
        `;

        // 1. 获取订单详情
        console.log('获取订单详情:', orderNo);
        orderData = await getOrderDetail(orderNo);
        console.log('订单详情:', orderData);

        // 从订单中获取演出ID和场次ID
        const eventId = orderData.eventId;
        const sessionId = orderData.sessionId;

        if (!eventId || !sessionId) {
            console.warn('订单中缺少eventId或sessionId，仅使用订单数据渲染');
            renderSuccessStatus(orderData, null, null);
            return;
        }

        // 2. 并行获取演出和场次详情
        console.log('获取演出和场次信息:', eventId, sessionId);
        const [eventResult, sessionResult] = await Promise.all([
            getEventDetail(eventId),
            getSessionDetail(sessionId)
        ]);

        eventData = eventResult;
        sessionData = sessionResult;

        console.log('演出信息:', eventData);
        console.log('场次信息:', sessionData);

        // 3. 渲染完整信息
        renderSuccessStatus(orderData, eventData, sessionData);

    } catch (error) {
        console.error('加载信息失败:', error);
        // 如果获取演出/场次信息失败，尝试只渲染订单信息
        if (orderData) {
            renderSuccessStatus(orderData, null, null);
        } else {
            showFailStatus('加载订单信息失败，请刷新页面');
        }
    }
}

/**
 * 加载待支付订单信息
 */
async function loadPendingOrderInfo(orderNo) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    try {
        container.innerHTML = `
            <div class="loading-state" style="padding: 60px 0;">
                <div class="loading-spinner"></div>
                <div class="loading-text">加载中...</div>
            </div>
        `;

        // 获取订单详情
        orderData = await getOrderDetail(orderNo);
        console.log('订单详情:', orderData);

        // 待支付状态也应该跳转到支付页面，而不是显示在此页面
        // 重定向到支付页面
        window.location.href = `order-confirm.html?orderNo=${orderNo}`;

    } catch (error) {
        console.error('加载订单详情失败:', error);
        showFailStatus('加载订单信息失败，请刷新页面');
    }
}

/**
 * 渲染支付成功状态
 * @param {object} order - 订单信息
 * @param {object} event - 演出信息（可能为null）
 * @param {object} session - 场次信息（可能为null）
 */
function renderSuccessStatus(order, event, session) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    // 根据订单状态判断
    const status = order.status; // 0=待支付, 1=已支付, 2=已取消, 3=已退款, 4=超时取消
    const statusDesc = order.statusDesc || (status === 1 ? '支付成功' : '操作成功');
    const isPaid = status === 1;  // 1=已支付

    // 优先使用从API获取的完整信息，否则使用订单中的字段或缓存
    const eventName = event?.eventName || event?.name || order.eventName || '-';
    const startTime = session?.startTime || session?.eventStartTime || order.startTime || order.sessionStartTime || '';
    const formattedTime = formatDateTime(startTime);
    const venueName = session?.venueName || session?.address || session?.hallName || order.venueName || order.address || '-';
    const seatInfo = order.seatInfo || '';

    // 单价
    const unitPrice = order.unitPrice || order.price || 0;
    const seatCount = order.seatCount || 0;
    const totalAmount = order.totalAmount || 0;

    const containerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 60px 0;">

            <!-- 成功图标 -->
            <div class="card text-center" style="padding: 60px 40px;">
                <div style="font-size: 80px; margin-bottom: 24px;">✅</div>
                <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">${statusDesc}</h1>

                <div class="text-muted" style="margin-bottom: 32px;">
                    恭喜您，购票成功！
                </div>

                <!-- 订单信息 -->
                <div class="text-left" style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                    <div class="flex-between mb-8">
                        <span class="text-muted">订单号</span>
                        <span style="font-weight: 600;">${order.orderNo || orderNo}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">演出名称</span>
                        <span>${eventName}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场次时间</span>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场馆</span>
                        <span>${venueName}</span>
                    </div>
                    ${seatInfo ? `
                    <div class="flex-between mb-8">
                        <span class="text-muted">座位信息</span>
                        <span>${seatInfo}</span>
                    </div>` : ''}
                    <div class="flex-between mb-8">
                        <span class="text-muted">票数</span>
                        <span>${seatCount}张</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">单价</span>
                        <span>¥${unitPrice}</span>
                    </div>
                    <div class="divider" style="margin: 16px 0;"></div>
                    <div class="flex-between">
                        <span style="font-weight: 600;">实付金额</span>
                        <div class="price price-large" style="font-size: 28px;">¥${totalAmount}</div>
                    </div>
                </div>

                <!-- 购票提示 -->
                <div class="text-left" style="background: #e8f5e9; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="margin-bottom: 12px;"><strong>购票提示：</strong></div>
                    <div style="color: #2e7d32; line-height: 1.8;">
                        <p style="margin-bottom: 8px;">• 电子票已发送至您的账户，可前往"我的订单"查看</p>
                        <p style="margin-bottom: 8px;">• 演出当天凭电子票二维码扫码入场</p>
                        <p>• 如需退票，请在演出前24小时在线申请</p>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex" style="gap: 16px;">
                    <a href="order-detail.html?orderNo=${order.orderNo || orderNo}" class="btn btn-primary" style="flex: 1;">查看订单</a>
                    <a href="index.html" class="btn btn-secondary" style="flex: 1;">返回首页</a>
                </div>

                <div style="margin-top: 24px; display: flex; gap: 24px; justify-content: center;">
                    <a href="order-center.html" style="color: #1976d2;">查看我的订单</a>
                    <a href="event-detail.html?id=${order.eventId || ''}" style="color: #1976d2;">查看演出详情</a>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = containerHTML;
}

/**
 * 显示失败状态
 */
function showFailStatus(message) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    container.innerHTML = `
        <div class="card text-center" style="padding: 60px 40px;">
            <div style="font-size: 80px; margin-bottom: 24px;">❌</div>
            <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">操作失败</h1>

            <div class="text-muted" style="margin-bottom: 32px;">
                ${message}
            </div>

            <div class="flex" style="gap: 16px;">
                <a href="index.html" class="btn btn-primary" style="flex: 1;">返回首页</a>
                <a href="order-center.html" class="btn btn-secondary" style="flex: 1;">我的订单</a>
            </div>
        </div>
    `;
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateTime) {
    if (!dateTime) return '时间待定';
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${weekDay} ${hours}:${minutes}`;
}

console.log('client-reservation-result.js 文件已加载');
