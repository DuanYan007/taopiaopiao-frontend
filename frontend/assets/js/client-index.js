/**
 * 淘票票客户端 - 首页逻辑
 * 文件：client-index.js
 */

console.log('client-index.js 文件已加载');

// 全局变量
var currentPage = 1;
var pageSize = 20;
var totalPages = 0;
var currentFilter = {
    category: 'all',
    time: 'all',
    sort: 'hot'
};

// 确保 DOM 加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

function init() {
    console.log('init() 函数执行');
    initFilterButtons();
    loadEventList();
}

/**
 * 初始化筛选按钮
 */
function initFilterButtons() {
    console.log('initFilterButtons() 函数执行');
    var buttons = document.querySelectorAll('.filter-btn');
    console.log('找到的按钮数量:', buttons.length);

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function(e) {
            e.preventDefault();
            console.log('按钮被点击:', this.textContent);

            // 获取父容器和标签
            var parent = this.parentElement;
            var label = parent.previousElementSibling;

            if (!label || !label.classList.contains('filter-label')) {
                console.log('未找到 filter-label');
                return;
            }

            var filterType = label.textContent;
            console.log('筛选类型:', filterType);

            // 移除同组其他按钮的 active 状态
            var siblings = parent.querySelectorAll('.filter-btn');
            for (var j = 0; j < siblings.length; j++) {
                siblings[j].classList.remove('active');
            }
            this.classList.add('active');

            // 更新筛选条件
            if (filterType === '分类') {
                currentFilter.category = this.getAttribute('data-category');
            } else if (filterType === '时间') {
                currentFilter.time = this.getAttribute('data-time');
            } else if (filterType === '排序') {
                currentFilter.sort = this.getAttribute('data-sort');
            }

            console.log('更新后的筛选条件:', currentFilter);

            // 重新加载数据
            currentPage = 1;
            loadEventList();
        });
    }
}

/**
 * 加载演出列表
 */
function loadEventList() {
    console.log('loadEventList() 执行, 筛选:', currentFilter);

    var loadingState = document.getElementById('loadingState');
    var emptyState = document.getElementById('emptyState');

    // 显示加载状态
    if (loadingState) {
        loadingState.style.display = 'flex';
    }
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    // 构建请求 URL
    var url = '/api/client/events?page=' + currentPage + '&pageSize=' + pageSize;
    if (currentFilter.category !== 'all') {
        url += '&type=' + currentFilter.category;
    }

    console.log('请求 URL:', url);

    // 发送请求
    fetch(url)
        .then(function(response) {
            console.log('响应状态:', response.status);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function(data) {
            console.log('响应数据:', data);

            // 隐藏加载状态
            if (loadingState) {
                loadingState.style.display = 'none';
            }

            // 检查返回码
            if (data.code !== 200) {
                throw new Error(data.msg || '请求失败');
            }

            var eventList = data.data.list || [];
            totalPages = Math.ceil((data.data.total || 0) / pageSize);

            console.log('演出数量:', eventList.length);

            if (eventList.length === 0) {
                if (emptyState) {
                    emptyState.style.display = 'block';
                }
                return;
            }

            renderEvents(eventList);
        })
        .catch(function(error) {
            console.error('请求失败:', error);

            if (loadingState) {
                loadingState.style.display = 'none';
            }
            if (emptyState) {
                emptyState.style.display = 'block';
                var emptyText = emptyState.querySelector('.empty-state-text');
                if (emptyText) {
                    emptyText.textContent = '加载失败: ' + error.message;
                }
            }
        });
}

/**
 * 渲染演出列表
 */
function renderEvents(events) {
    console.log('renderEvents() 执行, 数量:', events.length);

    var eventGrid = document.getElementById('eventGrid');

    // 清空并重建（直接将卡片添加到 eventGrid，利用其 grid 布局）
    eventGrid.innerHTML = '';

    // 创建 loading 和 empty 状态元素
    var loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-state';
    loadingDiv.id = 'loadingState';
    loadingDiv.style.display = 'none';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">加载中...</div>';

    var emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.id = 'emptyState';
    emptyDiv.style.display = 'none';
    emptyDiv.innerHTML = '<div class="empty-state-icon">🎭</div><div class="empty-state-text">暂无演出数据</div>';

    // 将状态元素添加到 grid
    eventGrid.appendChild(loadingDiv);
    eventGrid.appendChild(emptyDiv);

    // 直接将演出卡片添加到 eventGrid（grid 布局会自动排列）
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var card = createEventCard(event);
        eventGrid.appendChild(card);
    }
}

/**
 * 创建演出卡片
 */
function createEventCard(event) {
    var priceRange = getPriceRange(event.ticketTiers);
    var typeText = getTypeText(event.type);
    var gradient = getTypeGradient(event.type);

    var card = document.createElement('div');
    card.className = 'event-card';

    var handleClick = function() {
        window.location.href = 'event-detail.html?id=' + event.id;
    };

    card.onclick = handleClick;

    var soldOutBadge = event.status === 'sold_out'
        ? '<div class="event-badge badge-danger">售罄</div>'
        : '';

    card.innerHTML =
        '<div class="event-cover" style="background: ' + gradient + '; height: 200px;">' +
            soldOutBadge +
        '</div>' +
        '<div class="event-info">' +
            '<div class="event-title">' + event.name + '</div>' +
            '<div class="event-meta">' +
                '<span>' + (event.city || '上海') + '</span>' +
                '<span>|</span>' +
                '<span>' + typeText + '</span>' +
            '</div>' +
            '<div class="event-time">' + formatDate(event.eventStartDate) + '</div>' +
            '<div class="event-price">' + priceRange + '起</div>' +
        '</div>';

    return card;
}

/**
 * 获取价格区间
 */
function getPriceRange(ticketTiers) {
    if (!ticketTiers || ticketTiers.length === 0) return '-';

    var prices = [];
    for (var i = 0; i < ticketTiers.length; i++) {
        if (ticketTiers[i].price != null) {
            prices.push(ticketTiers[i].price);
        }
    }

    if (prices.length === 0) return '-';

    var minPrice = Math.min.apply(null, prices);
    var maxPrice = Math.max.apply(null, prices);

    if (minPrice === maxPrice) {
        return '¥' + minPrice;
    }
    return '¥' + minPrice + ' - ¥' + maxPrice;
}

/**
 * 获取类型显示文本
 */
function getTypeText(type) {
    var map = {
        'concert': '演唱会',
        'theatre': '话剧歌剧',
        'exhibition': '展览休闲',
        'sports': '体育赛事',
        'music': '音乐会',
        'kids': '儿童亲子',
        'dance': '舞蹈芭蕾'
    };
    return map[type] || type;
}

/**
 * 获取类型渐变色
 */
function getTypeGradient(type) {
    var gradients = {
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
 * 格式化日期
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';

    var date = new Date(dateStr);
    var year = date.getFullYear();
    var month = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

console.log('client-index.js 初始化完成');
