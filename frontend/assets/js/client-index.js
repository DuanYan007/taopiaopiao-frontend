/**
 * 淘票票客户端 - 首页逻辑
 * 文件：client-index.js
 * 功能：演出列表展示、分类筛选、分页加载
 */

// 全局变量
let currentPage = 1;
const pageSize = 20;
let totalPages = 0;
let currentFilter = {
    category: 'all',
    time: 'all',
    sort: 'hot'
};

// 页面加载时初始化
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，初始化首页');
    bindFilterEvents();
    loadEvents();
});

/**
 * 绑定筛选事件
 */
function bindFilterEvents() {
    console.log('绑定筛选事件');
    const options = document.querySelectorAll('.filter-option');
    console.log('找到筛选选项数量:', options.length);

    options.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const parent = this.parentElement;
            const label = parent.querySelector('.filter-label');

            console.log('点击筛选选项:', this.textContent, 'data-category:', this.dataset.category);

            if (!label) return;

            // 移除同组其他按钮的 active 状态
            parent.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
            // 激活当前按钮
            this.classList.add('active');

            // 根据筛选类型更新过滤器
            const filterType = label.textContent;
            if (filterType === '分类') {
                currentFilter.category = this.dataset.category;
            } else if (filterType === '时间') {
                currentFilter.time = this.dataset.time;
            } else if (filterType === '排序') {
                currentFilter.sort = this.dataset.sort;
            }

            console.log('当前筛选条件:', currentFilter);

            // 重置页码并重新加载
            currentPage = 1;
            loadEvents();
        });
    });

    // 滚动加载更多
    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            if (currentPage < totalPages) {
                currentPage++;
                loadMoreEvents();
            }
        }
    });
}

/**
 * 加载演出列表
 */
async function loadEvents() {
    const eventGrid = document.getElementById('eventGrid');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');

    console.log('加载演出列表，当前筛选:', currentFilter);

    try {
        if (loadingState) loadingState.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';

        const params = {
            page: currentPage,
            pageSize: pageSize
        };

        // 根据筛选条件添加参数
        if (currentFilter.category !== 'all') {
            params.type = currentFilter.category;
        }

        console.log('请求参数:', params);

        const result = await getEventList(params);
        const eventList = result.list || [];

        console.log('返回数据:', result);
        console.log('演出列表长度:', eventList.length);

        totalPages = Math.ceil((result.total || 0) / pageSize);

        if (loadingState) loadingState.style.display = 'none';

        if (eventList.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        renderEventGrid(eventList);

    } catch (error) {
        console.error('加载演出列表失败:', error);
        if (loadingState) loadingState.style.display = 'none';
        if (emptyState) {
            emptyState.style.display = 'block';
            const emptyText = emptyState.querySelector('.empty-state-text');

            if (error.message.includes('后端服务未响应')) {
                emptyText.innerHTML = `
                    <div style="color: #d32f2f;">后端服务未启动</div>
                    <div style="font-size: 12px; margin-top: 8px; color: #666;">请启动后端服务 (http://localhost:8080)</div>
                `;
            } else {
                emptyText.textContent = '加载失败: ' + error.message;
            }
        }
    }
}

/**
 * 渲染演出网格
 */
function renderEventGrid(events) {
    const eventGrid = document.getElementById('eventGrid');

    // 清空现有内容（保留loading和empty状态元素，后面会重新创建）
    eventGrid.innerHTML = '';

    // 重新创建 loading 和 empty 状态元素
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-state';
    loadingDiv.id = 'loadingState';
    loadingDiv.style.display = 'none';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">加载中...</div>';

    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.id = 'emptyState';
    emptyDiv.style.display = 'none';
    emptyDiv.innerHTML = '<div class="empty-state-icon">🎭</div><div class="empty-state-text">暂无演出数据</div>';

    // 创建演出卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'event-cards-container';

    events.forEach(event => {
        const eventCard = createEventCard(event);
        cardsContainer.appendChild(eventCard);
    });

    // 按顺序添加到grid
    eventGrid.appendChild(loadingDiv);
    eventGrid.appendChild(emptyDiv);
    eventGrid.appendChild(cardsContainer);
}

/**
 * 创建演出卡片元素
 */
function createEventCard(event) {
    const priceRange = getPriceRange(event.ticketTiers);
    const typeText = EVENT_TYPE_MAP[event.type] || event.type;
    const isSoldOut = event.status === 'sold_out';

    const card = document.createElement('div');
    card.className = 'event-card';
    card.onclick = () => {
        window.location.href = `event-detail.html?id=${event.id}`;
    };

    card.innerHTML = `
        <div class="event-cover" style="background: ${getCoverGradient(event.type)}; height: 200px;">
            ${isSoldOut ? '<div class="event-badge badge-danger">售罄</div>' : ''}
        </div>
        <div class="event-info">
            <div class="event-title">${event.name}</div>
            <div class="event-meta">
                <span>${event.city || '上海'}</span>
                <span>|</span>
                <span>${typeText}</span>
            </div>
            <div class="event-time">${formatDate(event.eventStartDate)}</div>
            <div class="event-price">${priceRange}起</div>
        </div>
    `;

    return card;
}

/**
 * 根据演出类型获取封面渐变色
 * 对应数据库类型: concert, theatre, exhibition, sports, music, kids, dance
 */
function getCoverGradient(type) {
    const gradients = {
        'concert': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'theatre': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'exhibition': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
        'sports': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'music': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'kids': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'dance': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    return gradients[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

/**
 * 加载更多演出
 */
async function loadMoreEvents() {
    try {
        const params = {
            page: currentPage,
            pageSize: pageSize
        };

        if (currentFilter.category !== 'all') {
            params.type = currentFilter.category;
        }

        const result = await getEventList(params);
        const eventList = result.list || [];

        if (eventList.length > 0) {
            const eventGrid = document.getElementById('eventGrid');
            const cardsContainer = eventGrid.querySelector('.event-cards-container');
            if (cardsContainer) {
                eventList.forEach(event => {
                    cardsContainer.appendChild(createEventCard(event));
                });
            }
        }
    } catch (error) {
        console.error('加载更多失败:', error);
    }
}
