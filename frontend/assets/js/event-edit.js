/**
 * 演出编辑页面逻辑
 * 文件：admin-event-edit.html
 */

let eventId = null;
let isReadonly = false;

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

    // 如果是只读模式，禁用表单
    if (isReadonly) {
        disableForm();
        // 隐藏保存按钮
        const submitBtn = document.querySelector('#submitBtn');
        if (submitBtn) submitBtn.style.display = 'none';
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
});

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
        setFormValue('images', Array.isArray(event.images) ? event.images.join(',') : event.images);
        setFormValue('description', event.description);
        setFormValue('tips', event.tips);
        setFormValue('refundPolicy', event.refundPolicy);

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
            city: formData.get('city').trim(),
            subtitle: formData.get('subtitle')?.trim() || '',
            eventStartDate: formData.get('eventStartDate') || null,
            eventEndDate: formData.get('eventEndDate') || null,
            duration: formData.get('duration') ? parseInt(formData.get('duration')) : null,
            saleStartTime: formatDateTimeForAPI(formData.get('saleStartTime')),
            saleEndTime: formatDateTimeForAPI(formData.get('saleEndTime')),
            coverImage: formData.get('coverImage')?.trim() || '',
            images: formData.get('images')?.trim() || '',
            description: formData.get('description')?.trim() || '',
            tips: formData.get('tips')?.trim() || '',
            refundPolicy: formData.get('refundPolicy')?.trim() || '',
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

/**
 * 辅助函数：格式化datetime-local值为API需要的格式 (ISO 8601)
 */
function formatDateTimeForAPI(dateTimeLocalString) {
    if (!dateTimeLocalString) return null;
    // datetime-local格式: 2025-02-01T10:00
    // API需要格式: 2025-02-01T10:00:00
    return dateTimeLocalString + ':00';
}
