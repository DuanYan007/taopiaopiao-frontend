/**
 * 演出列表页面逻辑
 * 文件：admin-events.html
 */

// 全局变量
let currentPage = 1;
const pageSize = 10;
let totalRecords = 0;
let totalPages = 0;

// 状态映射
const statusMap = {
    'draft': { text: '草稿', class: 'badge-secondary' },
    'on_sale': { text: '上架', class: 'badge-success' },
    'off_sale': { text: '下架', class: 'badge-danger' },
    'sold_out': { text: '已售罄', class: 'badge-dark' },
    'coming_soon': { text: '即将开售', class: 'badge-warning' }
};

// 页面加载时获取列表
window.addEventListener('DOMContentLoaded', loadEvents);

/**
 * 加载演出列表
 */
async function loadEvents() {
    try {
        const keyword = document.getElementById('searchInput').value.trim();
        const status = document.getElementById('statusSelect').value;
        const type = document.getElementById('typeSelect').value;

        const params = {
            page: currentPage,
            pageSize: pageSize
        };

        if (keyword) params.keyword = keyword;
        if (status) params.status = status;
        if (type) params.type = type;

        const result = await get('/api/admin/events', params);

        // 调试：检查返回的数据结构
        console.log('API返回数据:', result);

        // 确保数据格式正确
        const eventList = result.list || result.data || [];
        totalRecords = result.total || result.count || eventList.length || 0;
        totalPages = Math.ceil(totalRecords / pageSize);

        console.log('演出列表:', eventList);
        console.log('总记录数:', totalRecords);
        console.log('总页数:', totalPages);

        renderTable(eventList);
        renderPagination();
    } catch (error) {
        console.error('加载失败:', error);
        document.getElementById('eventTableBody').innerHTML =
            '<tr><td colspan="9" class="text-center text-muted">加载失败: ' + error.msg + '</td></tr>';
    }
}

/**
 * 渲染表格
 */
function renderTable(events) {
    const tbody = document.getElementById('eventTableBody');

    if (!events || events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = events.map(event => {
        const statusInfo = statusMap[event.status] || { text: event.status, class: 'badge-secondary' };
        return `
        <tr>
            <td>${event.id}</td>
            <td>${event.name}</td>
            <td>${event.type}</td>
            <td>${event.artist}</td>
            <td>${event.city}</td>
            <td><span class="badge ${statusInfo.class}">${statusInfo.text}</span></td>
            <td>${event.priceRange || '-'}</td>
            <td>${event.createdAt || event.createTime}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn action-btn-view" onclick="viewEvent(${event.id})">查看</button>
                    <button class="action-btn action-btn-edit" onclick="editEvent(${event.id})">编辑</button>
                    <button class="action-btn action-btn-delete" onclick="deleteEvent(${event.id})">下架</button>
                </div>
            </td>
        </tr>
    `;
    }).join('');

    document.getElementById('totalCount').textContent = `共 ${totalRecords} 条记录`;
}

/**
 * 渲染分页
 */
function renderPagination() {
    // 计算当前页的起始和结束
    const start = totalRecords > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const end = Math.min(currentPage * pageSize, totalRecords);

    // 更新分页信息
    document.getElementById('pageInfo').textContent =
        `显示 ${start}-${end} 条，共 ${totalRecords} 条`;

    const paginationContainer = document.getElementById('paginationBtns');

    // 如果没有数据或只有1页，不显示分页按钮
    if (totalRecords === 0 || totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let buttons = '';

    // 上一页
    buttons += `<button class="btn btn-secondary btn-small" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">上一页</button>`;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        // 显示：第一页、最后一页、当前页前后2页
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const btnClass = i === currentPage ? 'btn-primary' : 'btn-secondary';
            buttons += `<button class="btn ${btnClass} btn-small" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            // 显示省略号
            buttons += `<span style="padding: 0 4px; color: #666;">...</span>`;
        }
    }

    // 下一页
    buttons += `<button class="btn btn-secondary btn-small" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">下一页</button>`;

    paginationContainer.innerHTML = buttons;

    console.log('分页按钮已渲染，共', totalPages, '页');
}

/**
 * 跳转到指定页
 */
function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    loadEvents();
}

/**
 * 搜索按钮点击
 */
document.getElementById('searchBtn').addEventListener('click', () => {
    currentPage = 1;
    loadEvents();
});

/**
 * 回车搜索
 */
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        currentPage = 1;
        loadEvents();
    }
});

/**
 * 筛选变化
 */
document.getElementById('statusSelect').addEventListener('change', () => {
    currentPage = 1;
    loadEvents();
});

document.getElementById('typeSelect').addEventListener('change', () => {
    currentPage = 1;
    loadEvents();
});

/**
 * 查看演出
 */
function viewEvent(id) {
    window.location.href = `admin-event-edit.html?id=${id}&readonly=true`;
}

/**
 * 编辑演出
 */
function editEvent(id) {
    window.location.href = `admin-event-edit.html?id=${id}`;
}

/**
 * 下架演出
 */
async function deleteEvent(id) {
    if (!confirm('确定要下架这个演出吗？')) return;

    try {
        // 调用下架接口
        await put(`/api/admin/events/${id}/status`, { status: 'off_sale' });
        alert('下架成功');
        loadEvents();
    } catch (error) {
        // 如果下架接口失败，尝试删除接口
        try {
            await del(`/api/admin/events/${id}`);
            alert('删除成功');
            loadEvents();
        } catch (err) {
            alert('操作失败: ' + err.msg);
        }
    }
}
