/**
 * 淘票票客户端 - 选座页面逻辑
 * 文件：client-seat-selection.js
 * 页面：seat-selection.html
 */

// 全局变量
let currentSessionId = null;
let currentEventId = null;
let currentSessionData = null;
let selectedSeats = new Map(); // 使用 Map 存储选中的座位，key 为 "row-seat"
let seatLayoutData = null; // 座位布局数据

// 最大购票数量
const MAX_SEATS = 4;

// 缩放和拖拽相关变量
let zoomState = {
    scale: 1,
    minScale: 0.5,
    maxScale: 2,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    startX: 0,
    startY: 0
};

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('选座页面初始化');

    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('sessionId');
    currentEventId = urlParams.get('eventId');

    // 更新用户信息显示
    updateUserInfo();

    if (currentSessionId) {
        await loadSessionData(currentSessionId);
    } else {
        showError('缺少场次ID参数');
    }

    // 绑定提交按钮事件
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // 初始化缩放和拖拽功能
    initZoomAndPan();

    // 显示缩放提示（3秒后消失）
    setTimeout(() => {
        const hint = document.getElementById('zoomHint');
        if (hint) hint.classList.add('show');
        setTimeout(() => {
            if (hint) hint.classList.remove('show');
        }, 3000);
    }, 500);
});

/**
 * 更新用户信息显示
 */
function updateUserInfo() {
    const userInfoDiv = document.querySelector('.user-info');
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
 * 加载场次数据
 */
async function loadSessionData(sessionId) {
    const loadingEl = document.getElementById('loadingState');
    const errorEl = document.getElementById('errorState');
    const contentEl = document.getElementById('mainContent');

    try {
        if (loadingEl) loadingEl.style.display = 'flex';
        if (errorEl) errorEl.style.display = 'none';

        // 获取场次详情
        currentSessionData = await getSessionDetail(sessionId);
        console.log('场次数据:', currentSessionData);

        // 更新页面信息
        updatePageInfo(currentSessionData);

        // 加载座位布局
        await loadSeatLayout(currentSessionData.seatTemplateId);

        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';

    } catch (error) {
        console.error('加载场次数据失败:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'flex';
            const errorText = errorEl.querySelector('.error-state-text');
            if (errorText) errorText.textContent = error.message || '加载失败，请重试';
        }
    }
}

/**
 * 更新页面信息显示
 */
function updatePageInfo(session) {
    // 更新标题
    document.title = `选座购票 - ${session.eventName} - 淘票票`;

    // 更新演出名称
    const eventNameEl = document.getElementById('eventName');
    if (eventNameEl) {
        eventNameEl.textContent = session.eventName || '演出名称';
    }

    // 更新场次信息
    const sessionInfoEl = document.getElementById('sessionInfo');
    if (sessionInfoEl) {
        const startTime = formatDateTime(session.startTime);
        sessionInfoEl.textContent = `${startTime} | ${session.address || '地址待定'}`;
    }

    // 更新面包屑
    const breadcrumbEvent = document.getElementById('breadcrumbEvent');
    if (breadcrumbEvent && session.eventId) {
        breadcrumbEvent.innerHTML = `<a href="event-detail.html?id=${session.eventId}">${session.eventName}</a>`;
    }

    // 更新观演人
    const attendeeEl = document.getElementById('attendeeName');
    if (attendeeEl) {
        const user = getCurrentUser();
        attendeeEl.textContent = user?.nickname || '待填写';
    }
}

/**
 * 加载座位布局
 */
async function loadSeatLayout(templateId) {
    if (!templateId) {
        console.warn('座位模板ID为空');
        renderEmptySeatMap();
        return;
    }

    try {
        const result = await getSeatLayout(templateId);
        console.log('座位布局数据:', result);

        // 解析布局数据
        seatLayoutData = parseLayoutData(result.layoutData);
        if (!seatLayoutData) {
            console.error('解析布局数据失败');
            renderEmptySeatMap();
            return;
        }

        // 渲染座位图
        renderSeatMap(seatLayoutData);

    } catch (error) {
        console.error('加载座位布局失败:', error);
        renderEmptySeatMap();
    }
}

/**
 * 渲染座位图
 */
function renderSeatMap(layoutData) {
    const container = document.getElementById('seatsContent');
    if (!container) return;

    // 清空容器
    container.innerHTML = '';

    // 遍历区域
    layoutData.areas.forEach((area, areaIndex) => {
        // 创建区域容器
        const areaDiv = document.createElement('div');
        areaDiv.className = 'seat-area';
        areaDiv.style.marginBottom = '16px';

        // 区域标题
        const areaTitle = document.createElement('div');
        areaTitle.className = 'seat-area-title';
        areaTitle.textContent = area.areaName || area.areaCode || `区域${areaIndex + 1}`;
        areaDiv.appendChild(areaTitle);

        // 遍历行
        area.rows.forEach((row) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            rowDiv.style.cssText = `
                display: flex;
                gap: 8px;
                justify-content: center;
            `;

            // 渲染该行的座位
            renderRowSeats(rowDiv, row, area);

            areaDiv.appendChild(rowDiv);
        });

        container.appendChild(areaDiv);
    });

    // 绑定座位点击事件
    bindSeatEvents();

    // 自动调整缩放以适应内容
    setTimeout(() => autoFitZoom(), 100);
}

/**
 * 自动调整缩放以适应内容
 */
function autoFitZoom() {
    const canvas = document.getElementById('seatCanvas');
    const content = document.getElementById('seatsContent');
    if (!canvas || !content) return;

    const wrapper = document.getElementById('canvasWrapper');
    if (!wrapper) return;

    const wrapperRect = wrapper.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    // 计算内容相对于画布的比例
    const scaleX = (wrapperRect.width - 80) / contentRect.width;
    const scaleY = (wrapperRect.height - 80) / contentRect.height;
    const autoScale = Math.min(scaleX, scaleY, 1);

    // 限制在最小和最大缩放之间
    zoomState.scale = Math.max(zoomState.minScale, Math.min(zoomState.maxScale, autoScale));
    zoomState.translateX = 0;
    zoomState.translateY = 0;

    updateCanvasTransform();
    updateZoomControls();
}

/**
 * 渲染一行的座位
 */
function renderRowSeats(rowDiv, row, area) {
    // 如果有详细的座位列表，使用它
    if (row.seats && row.seats.length > 0) {
        row.seats.forEach((seat) => {
            const seatEl = createSeatElement(seat, row, area);
            rowDiv.appendChild(seatEl);
        });
    } else {
        // 否则根据 startSeat 和 endSeat 生成座位
        for (let i = row.startSeat; i <= row.endSeat; i++) {
            const seat = {
                seatNum: i,
                seatLabel: `${row.rowLabel.replace('排', '')}排${i}座`,
                available: true,
                status: SEAT_STATUS.AVAILABLE
            };
            const seatEl = createSeatElement(seat, row, area);
            rowDiv.appendChild(seatEl);
        }
    }
}

/**
 * 创建座位元素
 */
function createSeatElement(seat, row, area) {
    const seatEl = document.createElement('div');

    // 确定座位状态
    let status = seat.status || (seat.available ? SEAT_STATUS.AVAILABLE : SEAT_STATUS.SOLD);

    // 构建座位数据标识
    const seatKey = `${area.areaCode}-${row.rowNum}-${seat.seatNum}`;
    seatEl.dataset.key = seatKey;
    seatEl.dataset.areaCode = area.areaCode;
    seatEl.dataset.rowNum = row.rowNum;
    seatEl.dataset.seatNum = seat.seatNum;
    seatEl.dataset.price = area.price || '';
    seatEl.dataset.areaName = area.areaName;

    // 设置CSS类
    seatEl.className = `seat ${getSeatStatusClass(status)}`;

    // 设置座位标签（只显示座位号，不显示行号）
    seatEl.textContent = seat.seatNum;

    return seatEl;
}

/**
 * 绑定座位点击事件
 */
function bindSeatEvents() {
    const seats = document.querySelectorAll('.seat');
    seats.forEach(seat => {
        seat.addEventListener('click', handleSeatClick);
    });
}

/**
 * 初始化缩放和拖拽功能
 */
function initZoomAndPan() {
    const canvas = document.getElementById('seatCanvas');
    if (!canvas) return;

    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // 拖拽事件
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 触摸事件支持
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    // 缩放按钮
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomResetBtn = document.getElementById('zoomResetBtn');

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomBy(0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomBy(-0.1));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);

    updateZoomControls();
}

/**
 * 处理鼠标滚轮缩放
 */
function handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    zoomBy(delta);
}

/**
 * 缩放指定增量
 */
function zoomBy(delta) {
    const newScale = Math.max(zoomState.minScale, Math.min(zoomState.maxScale, zoomState.scale + delta));

    if (newScale !== zoomState.scale) {
        zoomState.scale = newScale;
        updateCanvasTransform();
        updateZoomControls();
    }
}

/**
 * 重置缩放
 */
function resetZoom() {
    zoomState.scale = 1;
    zoomState.translateX = 0;
    zoomState.translateY = 0;
    updateCanvasTransform();
    updateZoomControls();
}

/**
 * 更新画布变换
 */
function updateCanvasTransform() {
    const canvas = document.getElementById('seatCanvas');
    if (!canvas) return;

    canvas.style.transform = `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
}

/**
 * 更新缩放控制按钮状态
 */
function updateZoomControls() {
    const zoomLevelEl = document.getElementById('zoomLevel');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');

    if (zoomLevelEl) {
        zoomLevelEl.textContent = Math.round(zoomState.scale * 100) + '%';
    }

    if (zoomInBtn) {
        zoomInBtn.disabled = zoomState.scale >= zoomState.maxScale;
    }

    if (zoomOutBtn) {
        zoomOutBtn.disabled = zoomState.scale <= zoomState.minScale;
    }
}

/**
 * 鼠标按下开始拖拽
 */
function handleMouseDown(e) {
    // 如果点击的是座位，不触发拖拽
    if (e.target.classList.contains('seat')) {
        return;
    }

    zoomState.isDragging = true;
    zoomState.startX = e.clientX - zoomState.translateX;
    zoomState.startY = e.clientY - zoomState.translateY;

    const canvas = document.getElementById('seatCanvas');
    if (canvas) {
        canvas.classList.add('dragging');
    }
}

/**
 * 鼠标移动拖拽
 */
function handleMouseMove(e) {
    if (!zoomState.isDragging) return;

    e.preventDefault();
    zoomState.translateX = e.clientX - zoomState.startX;
    zoomState.translateY = e.clientY - zoomState.startY;

    updateCanvasTransform();
}

/**
 * 鼠标松开结束拖拽
 */
function handleMouseUp() {
    if (zoomState.isDragging) {
        zoomState.isDragging = false;

        const canvas = document.getElementById('seatCanvas');
        if (canvas) {
            canvas.classList.remove('dragging');
        }
    }
}

/**
 * 触摸开始（支持移动端）
 */
let touchStartDistance = 0;
let touchStartScale = 1;

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        // 单指拖拽
        if (e.target.classList.contains('seat')) {
            return;
        }

        zoomState.isDragging = true;
        zoomState.startX = e.touches[0].clientX - zoomState.translateX;
        zoomState.startY = e.touches[0].clientY - zoomState.translateY;

        const canvas = document.getElementById('seatCanvas');
        if (canvas) {
            canvas.classList.add('dragging');
        }
    } else if (e.touches.length === 2) {
        // 双指缩放
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        touchStartDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );
        touchStartScale = zoomState.scale;
    }
}

/**
 * 触摸移动
 */
function handleTouchMove(e) {
    e.preventDefault();

    if (e.touches.length === 1 && zoomState.isDragging) {
        // 单指拖拽
        zoomState.translateX = e.touches[0].clientX - zoomState.startX;
        zoomState.translateY = e.touches[0].clientY - zoomState.startY;
        updateCanvasTransform();
    } else if (e.touches.length === 2) {
        // 双指缩放
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        const scaleDelta = (distance - touchStartDistance) / 200;
        const newScale = Math.max(
            zoomState.minScale,
            Math.min(zoomState.maxScale, touchStartScale + scaleDelta)
        );

        if (newScale !== zoomState.scale) {
            zoomState.scale = newScale;
            updateCanvasTransform();
            updateZoomControls();
        }
    }
}

/**
 * 触摸结束
 */
function handleTouchEnd() {
    zoomState.isDragging = false;

    const canvas = document.getElementById('seatCanvas');
    if (canvas) {
        canvas.classList.remove('dragging');
    }
}

/**
 * 处理座位点击
 */
function handleSeatClick(e) {
    // 阻止事件冒泡，避免触发拖拽
    e.stopPropagation();

    const seat = e.currentTarget;

    // 获取座位状态
    const currentStatus = getSeatStatusFromElement(seat);

    // 已售/已锁定/不可用座位不可选
    if ([SEAT_STATUS.SOLD, SEAT_STATUS.LOCKED, SEAT_STATUS.UNAVAILABLE].includes(currentStatus)) {
        return;
    }

    const seatKey = seat.dataset.key;

    // 检查是否已选中
    if (selectedSeats.has(seatKey)) {
        // 取消选择
        selectedSeats.delete(seatKey);
        seat.classList.remove('seat-selected');
        seat.classList.add('seat-available');
    } else {
        // 检查是否超过最大数量
        if (selectedSeats.size >= MAX_SEATS) {
            showToast(`每单最多选择${MAX_SEATS}个座位`, 'warning');
            return;
        }

        // 检查是否连续座位（同一行相邻）
        if (!checkSeatContinuity(seat)) {
            showToast('请选择连续的座位', 'warning');
            return;
        }

        // 选中座位
        selectedSeats.set(seatKey, {
            areaCode: seat.dataset.areaCode,
            areaName: seat.dataset.areaName,
            rowNum: seat.dataset.rowNum,
            seatNum: seat.dataset.seatNum,
            price: parseFloat(seat.dataset.price) || 0
        });

        seat.classList.remove('seat-available');
        seat.classList.add('seat-selected');
    }

    // 更新选中座位显示
    updateSelectedSeatsDisplay();
}

/**
 * 从元素获取座位状态
 */
function getSeatStatusFromElement(el) {
    if (el.classList.contains('seat-sold')) return SEAT_STATUS.SOLD;
    if (el.classList.contains('seat-locked')) return SEAT_STATUS.LOCKED;
    if (el.classList.contains('seat-unavailable')) return SEAT_STATUS.UNAVAILABLE;
    if (el.classList.contains('seat-selected')) return SEAT_STATUS.SELECTED;
    return SEAT_STATUS.AVAILABLE;
}

/**
 * 检查座位连续性
 */
function checkSeatContinuity(seat) {
    // 如果没有选中座位，任何座位都可以选
    if (selectedSeats.size === 0) return true;

    const newAreaCode = seat.dataset.areaCode;
    const newRowNum = seat.dataset.rowNum;
    const newSeatNum = parseInt(seat.dataset.seatNum);

    // 获取所有已选座位
    const selectedInSameRow = Array.from(selectedSeats.values())
        .filter(s => s.areaCode === newAreaCode && s.rowNum === newRowNum)
        .map(s => parseInt(s.seatNum))
        .sort((a, b) => a - b);

    // 如果同一行没有已选座位，允许选择
    if (selectedInSameRow.length === 0) return true;

    // 检查新座位是否与已选座位相邻
    const minSeat = Math.min(...selectedInSameRow);
    const maxSeat = Math.max(...selectedInSameRow);

    // 新座位必须在已选座位的相邻位置
    return (newSeatNum === minSeat - 1) || (newSeatNum === maxSeat + 1);
}

/**
 * 更新选中座位显示
 */
function updateSelectedSeatsDisplay() {
    const container = document.getElementById('selectedSeatsContainer');
    const countEl = document.getElementById('selectedCount');
    const totalEl = document.getElementById('totalPrice');

    if (!container) return;

    // 清空当前显示
    container.innerHTML = '';

    if (selectedSeats.size === 0) {
        container.innerHTML = '<div class="text-muted text-small text-center" style="padding: 20px;">请点击座位图选择座位</div>';
        if (countEl) countEl.textContent = '0个';
        if (totalEl) totalEl.textContent = '¥0';

        // 更新合计
        const totalAmountEl = document.getElementById('totalAmount');
        if (totalAmountEl) totalAmountEl.textContent = '¥0';
        return;
    }

    let totalPrice = 0;

    // 按区域分组显示
    const groupedByArea = {};
    selectedSeats.forEach((seat) => {
        const areaName = seat.areaName || seat.areaCode;
        if (!groupedByArea[areaName]) {
            groupedByArea[areaName] = [];
        }
        groupedByArea[areaName].push(seat);
        totalPrice += seat.price || 0;
    });

    // 渲染选中座位
    Object.keys(groupedByArea).forEach(areaName => {
        const seats = groupedByArea[areaName];

        seats.forEach(seat => {
            const seatDiv = document.createElement('div');
            seatDiv.className = 'selected-seat-item';
            seatDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            `;
            seatDiv.innerHTML = `
                <div>
                    <div style="font-weight: 600; margin-bottom: 4px;">${areaName}</div>
                    <div style="color: #666; font-size: 13px;">${seat.rowNum}排${seat.seatNum}座</div>
                </div>
                <div class="price price-large">¥${seat.price || '-'}</div>
            `;
            container.appendChild(seatDiv);
        });
    });

    // 更新数量和总价
    if (countEl) countEl.textContent = `${selectedSeats.size}个`;
    if (totalEl) totalEl.textContent = `¥${totalPrice}`;

    // 更新合计价格
    const totalAmountEl = document.getElementById('totalAmount');
    if (totalAmountEl) totalAmountEl.textContent = `¥${totalPrice}`;
}

/**
 * 渲染空座位图
 */
function renderEmptySeatMap() {
    const container = document.getElementById('seatsContent');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state" style="padding: 40px 0;">
            <div class="empty-state-icon">🎭</div>
            <div class="empty-state-text">座位图暂未开放</div>
        </div>
    `;
}

/**
 * 处理提交
 */
function handleSubmit() {
    if (selectedSeats.size === 0) {
        showToast('请先选择座位', 'warning');
        return;
    }

    // 将选中的座位信息存储到 sessionStorage
    const seatsData = Array.from(selectedSeats.values());
    sessionStorage.setItem('selectedSeats', JSON.stringify(seatsData));
    sessionStorage.setItem('sessionId', currentSessionId);
    sessionStorage.setItem('eventId', currentEventId);
    sessionStorage.setItem('sessionData', JSON.stringify(currentSessionData));

    // 计算总价
    const totalPrice = seatsData.reduce((sum, seat) => sum + (seat.price || 0), 0);
    sessionStorage.setItem('totalPrice', totalPrice);

    // 跳转到订单确认页面
    window.location.href = `order-confirm.html?sessionId=${currentSessionId}`;
}

/**
 * 显示错误信息
 */
function showError(message) {
    const mainContent = document.querySelector('.main-content .container');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <div class="empty-state-text">${message}</div>
                <a href="index.html" class="btn btn-primary" style="margin-top: 16px;">返回首页</a>
            </div>
        `;
    }
}

/**
 * 显示提示消息
 */
function showToast(message, type = 'info') {
    // 简单的提示实现，后续可以优化为 Toast 组件
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
    return `${year}-${month}-${day} ${weekDay} ${hours}:${minutes}`;
}

console.log('client-seat-selection.js 文件已加载');
