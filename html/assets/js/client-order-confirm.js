/**
 * 淘票票客户端 - 订单确认页面逻辑
 * 文件：client-order-confirm.js
 * 页面：order-confirm.html
 */

// 全局变量
let sessionId = null;
let eventId = null;
let sessionData = null;
let selectedSeats = [];
let totalPrice = 0;
let lockId = null;
let orderNo = null; // 【新增】订单号

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 【调试】在页面上显示调试信息
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-info';
    debugDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: yellow; padding: 10px; border: 2px solid red; z-index: 9999; font-size: 12px; max-width: 300px;';
    debugDiv.innerHTML = '<strong>调试信息</strong><div id="debug-content">加载中...</div>';
    document.body.appendChild(debugDiv);

    function updateDebug(info) {
        const content = document.getElementById('debug-content');
        if (content) {
            content.innerHTML = Object.entries(info).map(([k, v]) => `<div>${k}: ${v}</div>`).join('');
        }
    }

    console.log('=== 订单确认页面初始化 ===');

    // 更新用户信息显示
    updateUserInfo();

    // 【调试】打印当前 URL 和参数
    const currentUrl = window.location.href;
    const queryString = window.location.search;

    // 从 URL 参数获取 orderNo（新逻辑）
    const urlParams = new URLSearchParams(window.location.search);
    const urlOrderNo = urlParams.get('orderNo');

    // 从 sessionStorage 获取选座信息
    const storedSessionId = sessionStorage.getItem('sessionId');
    const storedSeats = sessionStorage.getItem('selectedSeats');
    const storedEventId = sessionStorage.getItem('eventId');
    const storedSessionData = sessionStorage.getItem('sessionData');
    const storedTotalPrice = sessionStorage.getItem('totalPrice');
    const storedLockId = sessionStorage.getItem('lockId');
    const storedOrderNo = sessionStorage.getItem('orderNo');

    // 【显示调试信息】
    updateDebug({
        '当前URL': currentUrl,
        'URL中orderNo': urlOrderNo || '(无)',
        '存储中orderNo': storedOrderNo || '(无)'
    });

    if (!storedSessionId || !storedSeats) {
        showError('订单信息已过期，请重新选择座位');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }

    // 恢复数据
    sessionId = storedSessionId;
    eventId = storedEventId;
    selectedSeats = JSON.parse(storedSeats);
    totalPrice = parseFloat(storedTotalPrice) || 0;
    lockId = storedLockId;

    // 【关键】优先使用 URL 参数中的 orderNo，否则使用存储的
    orderNo = urlOrderNo || storedOrderNo;

    // 【更新调试信息】
    updateDebug({
        '最终orderNo': orderNo || '(无!)',
        '来源': urlOrderNo ? 'URL' : 'SessionStorage',
        'sessionId': sessionId,
        'eventId': eventId
    });

    // 【新增】验证订单号
    if (!orderNo) {
        console.error('【错误】订单号缺失！');
        debugDiv.style.background = 'red';
        debugDiv.style.color = 'white';
        updateDebug({
            '错误': '订单号缺失!',
            'URL中': urlOrderNo || '(无)',
            '存储中': storedOrderNo || '(无)'
        });
        showError('订单号缺失，请重新选择座位');
        setTimeout(() => {
            window.location.href = 'seat-selection.html?sessionId=' + sessionId;
        }, 3000);
        return;
    }

    if (storedSessionData) {
        try {
            sessionData = JSON.parse(storedSessionData);
        } catch (e) {
            console.error('解析场次数据失败:', e);
        }
    }

    console.log('支付页面数据恢复:', { orderNo, sessionId, eventId, selectedSeats, totalPrice });

    // 更新页面信息
    updateOrderInfo();

    // 绑定支付按钮事件
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', handlePayment);
    }

    // 启动倒计时（15分钟）
    startCountdown(900);
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
 * 更新订单信息显示
 */
function updateOrderInfo() {
    // 更新页面标题
    document.title = `确认订单 - ${sessionData?.eventName || '演出'} - 淘票票`;

    // 更新订单摘要
    updateOrderSummary();

    // 更新观演人信息
    updateAttendeeInfo();

    // 更新价格明细
    updatePriceBreakdown();

    // 更新支付按钮
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.textContent = `确认支付 ¥${totalPrice.toFixed(2)}`;
    }
}

/**
 * 更新订单摘要
 */
function updateOrderSummary() {
    const orderItem = document.querySelector('.order-item');
    if (!orderItem) return;

    const eventName = sessionData?.eventName || '演出名称';
    const startTime = formatDateTime(sessionData?.startTime);
    const address = sessionData?.address || '地址待定';

    // 构建座位信息
    const seatInfo = selectedSeats.map(seat => {
        return `${seat.areaName || seat.areaCode} ${seat.rowNum}排${seat.seatNum}座`;
    }).join('、');

    const orderInfo = `
        <div class="order-item-cover" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
        <div class="order-item-info">
            <div class="order-item-title">${eventName}</div>
            <div class="order-item-meta">${startTime}</div>
            <div class="order-item-meta">${address}</div>
            <div class="order-item-meta">${seatInfo} × ${selectedSeats.length}张</div>
        </div>
        <div class="price price-large">¥${totalPrice.toFixed(2)}</div>
    `;

    orderItem.innerHTML = orderInfo;

    // 更新面包屑
    const breadcrumbEvent = document.querySelector('.breadcrumb-item:nth-child(2) a');
    if (breadcrumbEvent && eventId) {
        breadcrumbEvent.href = `event-detail.html?id=${eventId}`;
        breadcrumbEvent.textContent = eventName.length > 10 ? eventName.substring(0, 10) + '...' : eventName;
    }
}

/**
 * 更新观演人信息
 */
function updateAttendeeInfo() {
    const user = getCurrentUser();
    if (!user) return;

    // 姓名输入框
    const nameInput = document.querySelector('input[placeholder*="姓名"]') || document.querySelector('input[type="text"]');
    if (nameInput && nameInput.value === '张三') {
        nameInput.value = user.nickname || '';
    }

    // 手机号输入框
    const phoneInputs = document.querySelectorAll('input[type="text"]');
    phoneInputs.forEach(input => {
        if (input.value.includes('138')) {
            input.value = user.phone || '';
        }
    });

    // 身份证号（如果有）
    const idCardInput = document.querySelector('input[value="310101199001011234"]');
    if (idCardInput && user.idCard) {
        idCardInput.value = user.idCard;
    }
}

/**
 * 更新价格明细
 */
function updatePriceBreakdown() {
    // 票价总计
    const ticketPriceEl = document.querySelector('.price-row:nth-child(1) span:last-child');
    if (ticketPriceEl) {
        ticketPriceEl.textContent = `¥${totalPrice.toFixed(2)}`;
    }

    // 应付金额
    const totalAmountEl = document.querySelector('.price-row-total .price');
    if (totalAmountEl) {
        totalAmountEl.textContent = `¥${totalPrice.toFixed(2)}`;
    }

    // 更新所有价格显示
    const priceEls = document.querySelectorAll('.price-large');
    priceEls.forEach(el => {
        if (el.textContent.startsWith('¥') && el.textContent !== `¥${totalPrice.toFixed(2)}`) {
            el.textContent = `¥${totalPrice.toFixed(2)}`;
        }
    });
}

/**
 * 启动倒计时
 */
function startCountdown(seconds) {
    let remaining = seconds;
    const countdownEl = document.getElementById('countdown');

    const updateDisplay = () => {
        const minutes = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const text = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        if (countdownEl) {
            countdownEl.textContent = text;
        }

        // 最后30秒变红提醒
        if (remaining <= 30 && countdownEl) {
            countdownEl.style.color = '#d32f2f';
            countdownEl.style.fontWeight = '600';
        }

        if (remaining <= 0) {
            handleTimeout();
        }
    };

    updateDisplay();

    const timer = setInterval(() => {
        remaining--;
        updateDisplay();

        if (remaining <= 0) {
            clearInterval(timer);
        }
    }, 1000);
}

/**
 * 处理超时
 */
function handleTimeout() {
    showToast('订单已超时，请重新下单', 'warning');
    setTimeout(() => {
        window.location.href = 'seat-selection.html?sessionId=' + sessionId;
    }, 2000);
}

/**
 * 处理支付
 */
async function handlePayment() {
    // 验证协议勾选
    const agreementCheckbox = document.querySelector('input[type="checkbox"]');
    if (agreementCheckbox && !agreementCheckbox.checked) {
        showToast('请先阅读并同意《购票服务协议》', 'warning');
        return;
    }

    // 验证联系方式
    const contactInput = document.querySelector('.card:nth-child(3) input:first-of-type');
    if (contactInput && !contactInput.value.trim()) {
        showToast('请填写联系人信息', 'warning');
        return;
    }

    // 执行支付流程
    await processPayment();
}

/**
 * 处理支付流程
 * 新逻辑：只传递 orderNo
 */
async function processPayment() {
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.textContent = '支付中...';
    }

    try {
        console.log('=== 支付流程开始 ===');
        console.log('订单号:', orderNo);

        // 验证订单号
        if (!orderNo) {
            console.error('【错误】订单号缺失！');
            throw new Error('订单号缺失，请重新下单');
        }

        console.log('【发送支付请求】');
        console.log('  orderNo:', orderNo);

        // 使用 orderNo 支付订单（新逻辑）
        const orderResult = await payOrder(orderNo);
        console.log('【支付响应】支付结果:', orderResult);

        // 清除存储的订单信息
        sessionStorage.removeItem('selectedSeats');
        sessionStorage.removeItem('sessionId');
        sessionStorage.removeItem('eventId');
        sessionStorage.removeItem('sessionData');
        sessionStorage.removeItem('totalPrice');
        sessionStorage.removeItem('lockId');
        sessionStorage.removeItem('lockExpireTime');
        sessionStorage.removeItem('orderNo');

        // 跳转到结果页面
        window.location.href = `reservation-result.html?status=success&orderNo=${orderNo}`;

    } catch (error) {
        console.error('【支付失败】', error);
        console.error('【支付失败】错误堆栈:', error.stack);
        showToast('支付失败: ' + error.message, 'error');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.textContent = `确认支付`;
        }
    }
}

/**
 * 显示错误信息
 */
function showError(message) {
    const mainContent = document.querySelector('.main-content .container');
    if (mainContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'empty-state';
        errorDiv.style.cssText = 'padding: 60px 20px;';
        errorDiv.innerHTML = `
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-text">${message}</div>
            <a href="index.html" class="btn btn-primary" style="margin-top: 16px;">返回首页</a>
        `;
        mainContent.innerHTML = '';
        mainContent.appendChild(errorDiv);
    }
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    alert(message);
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

console.log('client-order-confirm.js 文件已加载');
