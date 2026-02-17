/**
 * 演出编辑页面逻辑
 * 文件：admin-event-edit.html
 */

let eventId = null;
let isReadonly = false;
let ticketTierIndex = 0; // 票档索引计数器

/**
 * 页面初始化
 */
window.addEventListener('DOMContentLoaded', async () => {
    // 获取URL参数
    const params = new URLSearchParams(window.location.search);
    eventId = params.get('id');
    isReadonly = params.get('readonly') === 'true';

    // 修改标题
    const title = document.querySelector('.admin-header-title');
    title.textContent = eventId ? (isReadonly ? '查看演出' : '编辑演出') : '新建演出';

    // 加载场馆列表
    await loadVenues();

    // 如果是只读模式，禁用表单
    if (isReadonly) {
        disableForm();
        // 隐藏保存按钮
        const submitBtn = document.querySelector('#submitBtn');
        if (submitBtn) submitBtn.style.display = 'none';
        const draftBtn = document.querySelector('#draftBtn');
        if (draftBtn) draftBtn.style.display = 'none';
    }

    // 如果有ID（编辑或查看模式），加载演出数据
    if (eventId) {
        await loadEventData();
    }

    // 绑定取消按钮
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'admin-events.html';
        });
    }

    // 绑定表单提交
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleFormSubmit);
    }

    // 绑定添加票档按钮
    const addTierBtn = document.getElementById('addTierBtn');
    if (addTierBtn && !isReadonly) {
        addTierBtn.addEventListener('click', addTicketTier);
    }

    // 初始化票档索引
    const existingTiers = document.querySelectorAll('[name^="ticket_tiers["]');
    if (existingTiers.length > 0) {
        ticketTierIndex = existingTiers.length;
    }
});

/**
 * 加载场馆列表
 */
async function loadVenues() {
    try {
        const result = await get('/api/admin/venues');

        // 处理返回的数据格式
        // get() 已经提取了 data 字段，所以 result 可能是 {list: [...], total: ...} 或直接是数组
        const venueList = result.list || result.data || result || [];

        console.log('场馆列表数据:', venueList);

        // 获取场馆下拉框
        const venueSelect = document.querySelector('[name="venueId"]');
        if (!venueSelect) return;

        // 保存当前选中的值（编辑模式）
        const currentValue = venueSelect.value;

        // 清空现有选项
        venueSelect.innerHTML = '<option value="">请选择场馆</option>';

        // 添加场馆选项
        venueList.forEach(venue => {
            const option = document.createElement('option');
            option.value = venue.id;
            option.textContent = venue.name;
            venueSelect.appendChild(option);
        });

        // 恢复选中的值
        if (currentValue) {
            venueSelect.value = currentValue;
        }
    } catch (error) {
        console.error('加载场馆列表失败:', error);
    }
}

/**
 * 加载演出数据
 */
async function loadEventData() {
    try {
        const event = await get(`/api/admin/events/${eventId}`);

        // 回填基本信息
        setFormValue('name', event.name);
        setFormValue('type', event.type);
        setFormValue('artist', event.artist);
        setFormValue('city', event.city);
        setFormValue('venueId', event.venueId);
        setFormValue('subtitle', event.subtitle);

        // 回填时间信息
        setFormValue('eventStartDate', formatDate(event.eventStartDate));
        setFormValue('eventEndDate', formatDate(event.eventEndDate));
        setFormValue('duration', event.duration);

        // 回填预售时间
        setFormValue('saleStartTime', formatDateTimeLocal(event.saleStartTime));
        setFormValue('saleEndTime', formatDateTimeLocal(event.saleEndTime));

        // 回填演出详情
        setFormValue('coverImage', event.coverImage);
        setFormValue('images', event.images);
        setFormValue('description', event.description);
        setFormValue('tips', event.metadata?.tips);
        setFormValue('refundPolicy', event.metadata?.refundPolicy);

        // 回填票档
        if (event.ticketTiers && event.ticketTiers.length > 0) {
            renderTicketTiers(event.ticketTiers);
        }

        // 回填状态
        setFormValue('status', event.status);

        // 回填标签
        if (event.tags && event.tags.length > 0) {
            event.tags.forEach(tag => {
                const checkbox = document.querySelector(`[name="tags[]"][value="${tag}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } catch (error) {
        console.error('加载失败:', error);
        alert('加载演出数据失败: ' + error.msg);
    }
}

/**
 * 渲染票档列表
 */
function renderTicketTiers(tiers) {
    const container = document.getElementById('ticketTiersContainer');
    if (!container) return;

    // 清空现有票档
    container.innerHTML = '';

    tiers.forEach((tier, index) => {
        const tierHtml = createTicketTierHtml(index, tier);
        container.innerHTML += tierHtml;
    });

    ticketTierIndex = tiers.length;
}

/**
 * 创建票档HTML
 */
function createTicketTierHtml(index, tier = {}) {
    return `
    <div style="border: 1px solid #eee; border-radius: 4px; padding: 16px; margin-bottom: 12px; background: #fafafa;" id="tier_${index}">
        <div class="admin-form-row">
            <div class="form-group">
                <label class="form-label">票档名称</label>
                <input type="text" class="form-input" name="ticket_tiers[${index}].name" placeholder="如：VIP、一等座、二等座" value="${tier.name || ''}" ${isReadonly ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label class="form-label">价格（元）<span style="color: #d32f2f;">*</span></label>
                <input type="number" class="form-input" name="ticket_tiers[${index}].price" placeholder="请输入价格" min="0" step="0.01" value="${tier.price || ''}" ${isReadonly ? 'disabled' : ''}>
            </div>
        </div>
        <div class="admin-form-row">
            <div class="form-group">
                <label class="form-label">座位颜色</label>
                <input type="color" class="form-input" name="ticket_tiers[${index}].color" value="${tier.color || '#FF5722'}" style="height: 38px;" ${isReadonly ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label class="form-label">每人限购</label>
                <input type="number" class="form-input" name="ticket_tiers[${index}].maxPurchase" placeholder="每单最多购买数量" min="1" value="${tier.maxPurchase || 4}" ${isReadonly ? 'disabled' : ''}>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">票档说明</label>
            <input type="text" class="form-input" name="ticket_tiers[${index}].description" placeholder="如：含周边礼包、优先入场" value="${tier.description || ''}" ${isReadonly ? 'disabled' : ''}>
        </div>
        ${!isReadonly ? `<button type="button" class="btn btn-secondary btn-small" onclick="removeTicketTier(${index})">删除此票档</button>` : ''}
    </div>
    `;
}

/**
 * 添加票档
 */
function addTicketTier() {
    const container = document.getElementById('ticketTiersContainer');
    if (!container) return;

    const tierHtml = createTicketTierHtml(ticketTierIndex);
    container.insertAdjacentHTML('beforeend', tierHtml);
    ticketTierIndex++;
}

/**
 * 删除票档
 */
function removeTicketTier(index) {
    const tierElement = document.getElementById(`tier_${index}`);
    if (tierElement) {
        tierElement.remove();
    }
}

/**
 * 禁用表单（查看模式）
 */
function disableForm() {
    document.querySelectorAll('#eventForm input, #eventForm select, #eventForm textarea, #eventForm button').forEach(el => {
        if (el.type !== 'hidden' && el.id !== 'cancelBtn') {
            el.disabled = true;
        }
    });
}

/**
 * 表单提交
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    // 禁用提交按钮
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '保存中...';
    }

    try {
        // 收集表单数据
        const formData = new FormData(e.target);

        // 收集票档数据
        const ticketTiers = [];
        const tierElements = document.querySelectorAll('[id^="tier_"]');
        tierElements.forEach((element, index) => {
            const name = element.querySelector(`[name="ticket_tiers[${index}].name"]`)?.value;
            const price = element.querySelector(`[name="ticket_tiers[${index}].price"]`)?.value;
            const color = element.querySelector(`[name="ticket_tiers[${index}].color"]`)?.value;
            const maxPurchase = element.querySelector(`[name="ticket_tiers[${index}].maxPurchase"]`)?.value;
            const description = element.querySelector(`[name="ticket_tiers[${index}].description"]`)?.value;

            if (name && price) {
                ticketTiers.push({
                    name: name.trim(),
                    price: parseFloat(price),
                    color: color,
                    maxPurchase: maxPurchase ? parseInt(maxPurchase) : 4,
                    description: description ? description.trim() : ''
                });
            }
        });

        // 收集标签
        const tags = [];
        document.querySelectorAll('[name="tags[]"]:checked').forEach(cb => {
            tags.push(cb.value);
        });

        // 构建完整的数据对象
        const data = {
            name: formData.get('name').trim(),
            type: formData.get('type'),
            artist: formData.get('artist').trim(),
            city: formData.get('city'),
            venueId: formData.get('venueId') ? parseInt(formData.get('venueId')) : null,
            subtitle: formData.get('subtitle')?.trim() || '',
            eventStartDate: formData.get('eventStartDate') || null,
            eventEndDate: formData.get('eventEndDate') || null,
            duration: formData.get('duration') ? parseInt(formData.get('duration')) : null,
            saleStartTime: formData.get('saleStartTime') || null,
            saleEndTime: formData.get('saleEndTime') || null,
            coverImage: formData.get('coverImage')?.trim() || '',
            images: formData.get('images')?.trim() || '',
            description: formData.get('description')?.trim() || '',
            ticketTiers: ticketTiers,
            metadata: {
                tips: formData.get('tips')?.trim() || '',
                refundPolicy: formData.get('refundPolicy')?.trim() || ''
            },
            status: formData.get('status') || 'draft',
            tags: tags
        };

        // 调用API
        if (eventId) {
            // 更新
            await put(`/api/admin/events/${eventId}`, data);
            alert('更新成功');
        } else {
            // 创建
            await post('/api/admin/events', data);
            alert('创建成功');
        }

        // 返回列表页
        window.location.href = 'admin-events.html';
    } catch (error) {
        console.error('保存失败:', error);
        alert('保存失败: ' + error.msg);
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

/**
 * 辅助函数：设置表单值
 */
function setFormValue(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (element && value !== undefined && value !== null) {
        if (element.type === 'radio' || element.type === 'checkbox') {
            element.checked = true;
        } else {
            element.value = value;
        }
    }
}

/**
 * 辅助函数：格式化日期时间为 datetime-local 格式
 */
function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * 辅助函数：格式化日期为 date 类型输入框格式 (YYYY-MM-DD)
 * 处理后端返回的各种时间格式（ISO 8601、时间戳等）
 */
function formatDate(dateString) {
    if (!dateString) return '';

    let date;
    // 处理时间戳（毫秒）
    if (typeof dateString === 'number') {
        date = new Date(dateString);
    }
    // 处理 ISO 8601 字符串
    else {
        date = new Date(dateString);
    }

    // 检查日期是否有效
    if (isNaN(date.getTime())) {
        console.warn('无效的日期格式:', dateString);
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
