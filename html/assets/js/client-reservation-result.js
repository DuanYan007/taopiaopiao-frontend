/**
 * 淘票票客户端 - 预订结果页面逻辑
 * 文件：client-reservation-result.js
 * 页面：reservation-result.html
 */

// 全局变量
let orderData = null;
let selectedSeats = [];
let orderNo = null;
let sessionData = null;
let storedTotalPrice = null;

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('预订结果页面初始化');

    // 更新用户信息显示
    updateUserInfo();

    // 从 URL 参数获取订单号和状态
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status') || 'success';
    orderNo = urlParams.get('orderNo');

    // 从 sessionStorage 获取订单和座位信息
    const storedSessionData = sessionStorage.getItem('sessionData');
    const storedSeats = sessionStorage.getItem('selectedSeats');
    storedTotalPrice = sessionStorage.getItem('totalPrice');

    if (storedSessionData) {
        try {
            sessionData = JSON.parse(storedSessionData);
        } catch (e) {
            console.error('解析场次数据失败:', e);
        }
    }

    if (storedSeats) {
        try {
            selectedSeats = JSON.parse(storedSeats);
        } catch (e) {
            console.error('解析座位数据失败:', e);
        }
    }

    // 根据状态显示不同内容
    if (status === 'success' && orderNo) {
        // 支付成功 - 从后端获取订单详情
        await loadOrderDetail(orderNo);
    } else if (status === 'pending' || status === 'locked') {
        // 锁座成功 - 显示锁座信息
        showLockedStatus(orderNo);
    } else {
        // 失败状态
        showFailStatus('座位占用失败，请重试');
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
 * 加载订单详情
 */
async function loadOrderDetail(orderNo) {
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

        // 显示支付成功状态
        renderSuccessStatus(orderData);

    } catch (error) {
        console.error('加载订单详情失败:', error);
        showFailStatus('加载订单信息失败，请刷新页面');
    }
}

/**
 * 渲染支付成功状态
 */
function renderSuccessStatus(order) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    const statusDesc = order.statusDesc || '支付成功';
    const isPaid = order.status === 1;  // 1=已支付

    // 构建座位信息
    const seatInfo = selectedSeats.map(seat => {
        return `${seat.areaName || seat.areaCode} ${seat.rowNum}排${seat.seatNum}座`;
    }).join('、');

    // 获取时间信息
    const startTime = order.sessionStartTime || order.startTime || sessionData?.startTime || '';
    const formattedTime = formatDateTime(startTime);
    const venueName = order.venueName || order.address || sessionData?.address || '';

    const containerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 60px 0;">

            <!-- 成功图标 -->
            <div class="card text-center" style="padding: 60px 40px;">
                <div style="font-size: 80px; margin-bottom: 24px;">${isPaid ? '✅' : '🔒'}</div>
                <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">${isPaid ? '支付成功' : '占用成功'}</h1>

                <div class="text-muted" style="margin-bottom: 32px;">
                    ${isPaid ? '恭喜您，购票成功！' : '请尽快完成支付，避免座位被释放'}
                </div>

                <!-- 订单信息 -->
                <div class="text-left" style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                    <div class="flex-between mb-8">
                        <span class="text-muted">订单号</span>
                        <span style="font-weight: 600;">${order.orderNo}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">演出名称</span>
                        <span>${order.eventName || sessionData?.eventName || '-'}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场次时间</span>
                        <span>${formattedTime}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场馆</span>
                        <span>${venueName}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">座位信息</span>
                        <span>${seatInfo}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">票数</span>
                        <span>${order.seatCount || selectedSeats.length}张</span>
                    </div>
                    <div class="divider" style="margin: 16px 0;"></div>
                    <div class="flex-between">
                        <span style="font-weight: 600;">实付金额</span>
                        <div class="price price-large">¥${order.totalAmount || '0'}</div>
                    </div>
                </div>

                ${isPaid ? `
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
                        <a href="order-center.html" class="btn btn-primary" style="flex: 1;">查看订单</a>
                        <a href="index.html" class="btn btn-secondary" style="flex: 1;">返回首页</a>
                    </div>

                    <div style="margin-top: 24px;">
                        <a href="order-center.html" style="color: #1976d2;">查看我的订单</a>
                    </div>
                ` : `
                    <!-- 锁座状态的操作按钮 -->
                    <div class="flex" style="gap: 16px;">
                        <a href="order-confirm.html" class="btn btn-primary" style="flex: 1;">立即支付</a>
                        <a href="seat-selection.html?sessionId=${order.sessionId}" class="btn btn-secondary" style="flex: 1;">更换座位</a>
                    </div>
                `}
            </div>
        </div>
    `;

    container.innerHTML = containerHTML;
}

/**
 * 显示锁座状态
 */
function showLockedStatus(lockId) {
    const container = document.querySelector('.main-content .container > div');
    if (!container) return;

    const containerHTML = `
        <div style="max-width: 600px; margin: 0 auto; padding: 60px 0;">
            <div class="card text-center" style="padding: 60px 40px;">
                <div style="font-size: 80px; margin-bottom: 24px;">🔒</div>
                <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">占用成功</h1>

                <div class="text-muted" style="margin-bottom: 32px;">
                    请尽快完成支付，避免座位被释放<br>
                    超时未支付，座位将自动释放
                </div>

                <!-- 订单信息 -->
                <div class="text-left" style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin-bottom: 32px;">
                    <div class="flex-between mb-8">
                        <span class="text-muted">占用单号</span>
                        <span style="font-weight: 600;">${lockId || '-'}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">演出名称</span>
                        <span>${sessionData?.eventName || '-'}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场次时间</span>
                        <span>${formatDateTime(sessionData?.startTime)}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">场馆</span>
                        <span>${sessionData?.address || '-'}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">座位信息</span>
                        <span>${selectedSeats.map(s => `${s.areaName || s.areaCode} ${s.rowNum}排${s.seatNum}座`).join('、')}</span>
                    </div>
                    <div class="flex-between mb-8">
                        <span class="text-muted">票数</span>
                        <span>${selectedSeats.length}张</span>
                    </div>
                    <div class="divider" style="margin: 16px 0;"></div>
                    <div class="flex-between">
                        <span style="font-weight: 600;">应付金额</span>
                        <div class="price price-large">¥${storedTotalPrice || '0'}</div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex" style="gap: 16px;">
                    <a href="order-confirm.html" class="btn btn-primary" style="flex: 1;">立即支付</a>
                    <a href="seat-selection.html?sessionId=${sessionData?.id}" class="btn btn-secondary" style="flex: 1;">更换座位</a>
                </div>

                <div style="margin-top: 24px;">
                    <a href="session-list.html" style="color: #1976d2;">返回选择场次</a>
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
                <a href="seat-selection.html" class="btn btn-primary" style="flex: 1;">重新选择</a>
                <a href="session-list.html" class="btn btn-secondary" style="flex: 1;">查看其他场次</a>
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
