/**
 * 场次编辑页面逻辑
 * 文件：admin-session-edit.html
 */

let sessionId = null;
let eventId = null;
let eventData = null;
let sessionData = null;
let isReadonly = false;

/**
 * 页面初始化
 */
window.addEventListener('DOMContentLoaded', async () => {
    // 获取URL参数
    const params = new URLSearchParams(window.location.search);
    sessionId = params.get('id');
    eventId = params.get('eventId');
    isReadonly = params.get('readonly') === 'true';

    // 修改标题
    const title = document.querySelector('.admin-header-title');
    title.textContent = sessionId ? (isReadonly ? '查看场次' : '编辑场次') : '新建场次';

    // 加载场馆列表
    await loadVenues();

    // 加载演出列表（用于选择）
    await loadEvents();

    // 如果是只读模式，禁用表单
    if (isReadonly) {
        disableForm();
        const submitBtn = document.querySelector('#submitBtn');
        if (submitBtn) submitBtn.style.display = 'none';
    }

    // 如果有sessionId（编辑或查看模式），加载场次数据
    if (sessionId) {
        await loadSessionData();
    } else {
        // 新建模式：初始化默认值
        initializeDefaultValues();

        // 如果URL中有eventId，自动选择该演出
        if (eventId) {
            const eventSelect = document.getElementById('eventSelect');
            if (eventSelect) {
                eventSelect.value = eventId;
                // 触发加载演出数据
                await loadEventData();
            }
        }
    }

    // 绑定取消按钮
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'admin-sessions.html?eventId=' + eventId;
        });
    }

    // 绑定预览按钮
    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', previewSession);
    }

    // 绑定表单提交
    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', handleFormSubmit);
    }

    // 绑定场馆选择变更
    const venueSelect = document.getElementById('venueId');
    if (venueSelect) {
        venueSelect.addEventListener('change', handleVenueChange);
    }

    // 绑定重新加载票档按钮
    const reloadTiersBtn = document.getElementById('reloadTiersBtn');
    if (reloadTiersBtn) {
        reloadTiersBtn.addEventListener('click', () => {
            loadEventData();
            alert('票档已重新加载');
        });
    }

    // 绑定自定义价格切换
    const useCustomPricingCheckbox = document.getElementById('useCustomPricing');
    if (useCustomPricingCheckbox) {
        useCustomPricingCheckbox.addEventListener('change', toggleCustomPricing);
    }
});

/**
 * 加载场馆列表
 */
async function loadVenues() {
    try {
        const result = await get('/api/admin/venues');
        const venueList = result.list || result.data || result || [];

        console.log('场馆列表数据:', venueList);

        const venueSelect = document.getElementById('venueId');
        if (!venueSelect) return;

        const currentValue = venueSelect.value;
        venueSelect.innerHTML = '<option value="">请选择场馆</option>';

        venueList.forEach(venue => {
            const option = document.createElement('option');
            option.value = venue.id;
            option.textContent = venue.name;
            option.dataset.address = venue.address || '';
            venueSelect.appendChild(option);
        });

        if (currentValue) {
            venueSelect.value = currentValue;
        }
    } catch (error) {
        console.error('加载场馆列表失败:', error);
    }
}

/**
 * 加载演出列表
 */
async function loadEvents() {
    try {
        const result = await get('/api/admin/events', { pageSize: 1000 });
        const eventList = result.list || result.data || [];

        console.log('演出列表数据:', eventList);

        const eventSelect = document.getElementById('eventSelect');
        if (!eventSelect) return;

        // 清空现有选项
        eventSelect.innerHTML = '<option value="">请选择演出</option>';

        // 添加演出选项
        eventList.forEach(event => {
            const option = document.createElement('option');
            option.value = event.id;
            option.textContent = event.name;
            option.dataset.type = event.type || '';
            option.dataset.city = event.city || '';
            option.dataset.venue = event.venueName || '';
            eventSelect.appendChild(option);
        });

        // 监听演出选择变更
        eventSelect.addEventListener('change', async () => {
            const selectedEventId = eventSelect.value;
            if (selectedEventId) {
                eventId = selectedEventId;
                await loadEventData();
            } else {
                // 清空演出信息
                document.getElementById('eventDetails').style.display = 'none';
                document.getElementById('ticketTiersContainer').innerHTML =
                    '<div class="text-center text-muted" style="padding: 40px;">请先选择演出</div>';
            }
        });
    } catch (error) {
        console.error('加载演出列表失败:', error);
    }
}

/**
 * 加载演出数据
 */
async function loadEventData() {
    try {
        if (!eventId) {
            console.warn('演出ID为空，跳过加载演出数据');
            return;
        }

        eventData = await get(`/api/admin/events/${eventId}`);
        console.log('演出数据:', eventData);

        // 设置隐藏字段
        document.getElementById('eventId').value = eventId;

        // 更新演出信息展示
        updateEventInfoDisplay(eventData);

        // 渲染票档列表（继承自演出）
        if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
            renderInheritedTicketTiers(eventData.ticketTiers);
        } else {
            document.getElementById('ticketTiersContainer').innerHTML =
                '<div class="text-center text-muted" style="padding: 40px;">该演出暂未配置票档，请先在演出管理中添加票档</div>';
        }
    } catch (error) {
        console.error('加载演出数据失败:', error);
        alert('加载演出数据失败: ' + error.msg);
    }
}

/**
 * 加载场次数据（编辑模式）
 */
async function loadSessionData() {
    try {
        sessionData = await get(`/api/admin/sessions/${sessionId}`);
        console.log('场次数据:', sessionData);

        // 设置演出ID
        eventId = sessionData.eventId;
        document.getElementById('eventId').value = eventId;

        // 先加载演出列表
        await loadEvents();

        // 设置演出下拉框的值
        const eventSelect = document.getElementById('eventSelect');
        if (eventSelect) {
            eventSelect.value = eventId;
        }

        // 加载演出数据
        await loadEventData();

        // 回填基本信息
        setFormValue('sessionName', sessionData.sessionName);

        // 回填时间信息
        if (sessionData.startTime) {
            const startDate = new Date(sessionData.startTime);
            setFormValue('sessionDate', formatDateForInput(startDate));
            setFormValue('startTime', formatTimeForInput(startDate));
        }
        if (sessionData.endTime) {
            setFormValue('endTime', formatTimeForInput(new Date(sessionData.endTime)));
        }

        // 回填场馆信息
        setFormValue('venueId', sessionData.venueId);
        setFormValue('hallName', sessionData.hallName);
        setFormValue('address', sessionData.address);

        // 回填座位信息
        setFormValue('totalSeats', sessionData.totalSeats);
        setFormValue('availableSeats', sessionData.availableSeats);

        // 回填票档配置
        if (sessionData.ticketTierConfig && sessionData.ticketTierConfig.length > 0) {
            fillTicketTierConfig(sessionData.ticketTierConfig);
        }

        // 回填销售设置
        const metadata = sessionData.metadata || {};
        setFormValue('metadata[duration]', metadata.duration);
        setFormValue('metadata[saleStartTime]', formatDateTimeLocal(metadata.saleStartTime));
        setFormValue('metadata[saleEndTime]', formatDateTimeLocal(metadata.saleEndTime));

        // 回填特殊限制
        if (metadata.requireRealName) setFormValue('metadata[requireRealName]', 'on');
        if (metadata.limitOnePerPerson) setFormValue('metadata[limitOnePerPerson]', 'on');
        if (metadata.noRefund) setFormValue('metadata[noRefund]', 'on');

        // 回填选座方式
        if (metadata.seatSelectionMode) {
            setFormValue('metadata[seatSelectionMode]', metadata.seatSelectionMode);
        }

        // 回填状态
        setFormValue('status', sessionData.status);

        // 回填排序和备注
        setFormValue('metadata[sortOrder]', metadata.sortOrder || 0);
        setFormValue('metadata[remark]', metadata.remark || '');

        // 检查是否使用自定义价格
        const hasCustomPrice = sessionData.ticketTierConfig?.some(tier => tier.overridePrice !== null && tier.overridePrice !== undefined);
        if (hasCustomPrice) {
            document.getElementById('useCustomPricing').checked = true;
            toggleCustomPricing();
        }
    } catch (error) {
        console.error('加载场次数据失败:', error);
        alert('加载场次数据失败: ' + error.msg);
    }
}

/**
 * 更新演出信息展示
 */
function updateEventInfoDisplay(event) {
    const eventDetails = document.getElementById('eventDetails');
    const eventName = document.getElementById('eventName');
    const eventInfo = document.getElementById('eventInfo');

    if (!eventDetails || !eventName || !eventInfo) return;

    // 显示演出详情区域
    eventDetails.style.display = 'block';

    // 更新演出名称
    eventName.textContent = event.name;

    // 更新演出信息
    eventInfo.innerHTML = `
        <span>${event.type || '-'}</span>
        <span style="margin: 0 8px; color: #ddd;">|</span>
        <span>${event.city || '-'}</span>
        <span style="margin: 0 8px; color: #ddd;">|</span>
        <span>${event.venueName || '-'}</span>
        <span style="margin: 0 8px; color: #ddd;">|</span>
        <a href="admin-event-edit.html?id=${event.id}" target="_blank" style="color: #1976d2;">查看演出详情 →</a>
    `;
}

/**
 * 渲染继承的票档列表
 */
function renderInheritedTicketTiers(tiers) {
    const container = document.getElementById('ticketTiersContainer');
    if (!container) return;

    container.innerHTML = `
        <div style="background: #f5f5f5; padding: 12px 16px; border-bottom: 1px solid #eee; font-weight: 600;">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px;">
                <div>票档名称</div>
                <div>演出价格</div>
                <div>座位分配数</div>
                <div>可售座位数</div>
                <div>限购数</div>
            </div>
        </div>
    `;

    tiers.forEach((tier, index) => {
        const tierHtml = `
            <div style="padding: 16px; border-bottom: 1px solid #eee; background: ${index % 2 === 0 ? '#fff' : '#fafafa'};" id="tierRow_${index}">
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 16px; align-items: center;">
                    <div>
                        <div style="font-weight: 500;">${tier.name}</div>
                        <div class="text-small text-muted">${tier.description || ''}</div>
                    </div>
                    <div>
                        <div style="font-weight: 600; color: #f44336;">¥${tier.price}</div>
                        <input type="hidden" name="ticket_tiers[${index}].tierId" value="${tier.id}">
                        <input type="hidden" name="ticket_tiers[${index}].basePrice" value="${tier.price}">
                        <input type="number" class="form-input custom-price-input" name="ticket_tiers[${index}].overridePrice"
                               placeholder="自定义价格" step="0.01" style="margin-top: 8px; display: none;">
                    </div>
                    <div>
                        <input type="number" class="form-input" name="ticket_tiers[${index}].seatCount"
                               placeholder="座位数" min="0" value="${tier.maxSeats || 0}">
                        <div class="text-small text-muted" style="margin-top: 4px;">该票档总座位</div>
                    </div>
                    <div>
                        <input type="number" class="form-input" name="ticket_tiers[${index}].availableSeats"
                               placeholder="可售数" min="0" value="${tier.availableSeats || tier.maxSeats || 0}">
                    </div>
                    <div>
                        <input type="number" class="form-input" name="ticket_tiers[${index}].maxPurchase"
                               placeholder="限购" min="1" value="${tier.maxPurchase || 4}">
                    </div>
                </div>
                <div style="margin-top: 12px;">
                    <label style="margin-right: 16px; cursor: pointer;">
                        <input type="checkbox" name="ticket_tiers[${index}].enabled" checked> 启用该票档
                    </label>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', tierHtml);
    });
}

/**
 * 填充票档配置（编辑模式）
 */
function fillTicketTierConfig(config) {
    config.forEach(tierConfig => {
        const tierId = tierConfig.tierId;
        const tierRow = document.querySelector(`input[value="${tierId}"]`)?.closest('[id^="tierRow_"]');
        if (!tierRow) return;

        // 填充座位数
        const seatCountInput = tierRow.querySelector('[name$=".seatCount"]');
        if (seatCountInput) seatCountInput.value = tierConfig.seatCount || 0;

        // 填充可售数
        const availableSeatsInput = tierRow.querySelector('[name$=".availableSeats"]');
        if (availableSeatsInput) availableSeatsInput.value = tierConfig.availableSeats || 0;

        // 填充限购数
        const maxPurchaseInput = tierRow.querySelector('[name$=".maxPurchase"]');
        if (maxPurchaseInput) maxPurchaseInput.value = tierConfig.maxPurchase || 4;

        // 填充自定义价格
        if (tierConfig.overridePrice !== null && tierConfig.overridePrice !== undefined) {
            const overridePriceInput = tierRow.querySelector('[name$=".overridePrice"]');
            if (overridePriceInput) overridePriceInput.value = tierConfig.overridePrice;
        }

        // 设置启用状态
        const enabledCheckbox = tierRow.querySelector('[name$=".enabled"]');
        if (enabledCheckbox) enabledCheckbox.checked = tierConfig.enabled !== false;
    });
}

/**
 * 切换自定义价格
 */
function toggleCustomPricing() {
    const useCustomPricing = document.getElementById('useCustomPricing').checked;
    const customPriceInputs = document.querySelectorAll('.custom-price-input');

    customPriceInputs.forEach(input => {
        input.style.display = useCustomPricing ? 'block' : 'none';
        if (!useCustomPricing) {
            input.value = ''; // 清空自定义价格
        }
    });
}

/**
 * 场馆选择变更处理
 */
function handleVenueChange() {
    const venueSelect = document.getElementById('venueId');
    const selectedOption = venueSelect.selectedOptions[0];

    if (selectedOption && selectedOption.dataset.address) {
        // 自动填充地址
        const addressInput = document.getElementById('address');
        if (addressInput && !addressInput.value) {
            addressInput.value = selectedOption.dataset.address;
        }
    }
}

/**
 * 初始化默认值
 */
function initializeDefaultValues() {
    // 设置默认演出时长为120分钟
    setFormValue('metadata[duration]', '120');

    // 设置默认选座方式
    setFormValue('metadata[seatSelectionMode]', 'online');
}

/**
 * 预览场次
 */
function previewSession() {
    // 收集表单数据
    const formData = new FormData(document.getElementById('sessionForm'));
    const sessionName = formData.get('sessionName') || '未命名场次';
    const sessionDate = formData.get('sessionDate');
    const startTime = formData.get('startTime');

    alert(`预览场次：${sessionName}\n时间：${sessionDate} ${startTime}\n\n预览功能开发中，敬请期待...`);
}

/**
 * 表单提交
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '保存中...';
    }

    try {
        const formData = new FormData(e.target);

        // 组合日期和时间
        const sessionDate = formData.get('sessionDate');
        const startTime = formData.get('startTime');
        const endTime = formData.get('endTime');

        if (!sessionDate || !startTime) {
            throw new Error('请选择场次日期和开始时间');
        }

        // 构建开始时间
        const startDateTime = `${sessionDate}T${startTime}:00`;

        // 构建结束时间
        let endDateTime = null;
        if (endTime) {
            endDateTime = `${sessionDate}T${endTime}:00`;
        }

        // 收集票档配置
        const ticketTierConfig = [];
        const tierRows = document.querySelectorAll('[id^="tierRow_"]');
        tierRows.forEach(row => {
            const tierId = row.querySelector('[name$=".tierId"]')?.value;
            const basePrice = parseFloat(row.querySelector('[name$=".basePrice"]')?.value);
            const overridePrice = row.querySelector('[name$=".overridePrice"]')?.value;
            const seatCount = parseInt(row.querySelector('[name$=".seatCount"]')?.value) || 0;
            const availableSeats = parseInt(row.querySelector('[name$=".availableSeats"]')?.value) || 0;
            const maxPurchase = parseInt(row.querySelector('[name$=".maxPurchase"]')?.value) || 4;
            const enabled = row.querySelector('[name$=".enabled"]')?.checked !== false;

            if (tierId) {
                ticketTierConfig.push({
                    tierId: parseInt(tierId),
                    basePrice: basePrice,
                    overridePrice: overridePrice ? parseFloat(overridePrice) : null,
                    seatCount: seatCount,
                    availableSeats: availableSeats,
                    maxPurchase: maxPurchase,
                    enabled: enabled
                });
            }
        });

        // 计算总座位数和可售座位数
        const totalSeats = ticketTierConfig.reduce((sum, tier) => sum + tier.seatCount, 0);
        const totalAvailableSeats = ticketTierConfig.reduce((sum, tier) => sum + (tier.enabled ? tier.availableSeats : 0), 0);

        // 收集元数据
        const metadata = {
            duration: formData.get('metadata[duration]') ? parseInt(formData.get('metadata[duration]')) : 120,
            saleStartTime: formData.get('metadata[saleStartTime]') || null,
            saleEndTime: formData.get('metadata[saleEndTime]') || null,
            seatSelectionMode: formData.get('metadata[seatSelectionMode]') || 'online',
            requireRealName: formData.get('metadata[requireRealName]') === 'on',
            limitOnePerPerson: formData.get('metadata[limitOnePerPerson]') === 'on',
            noRefund: formData.get('metadata[noRefund]') === 'on',
            sortOrder: formData.get('metadata[sortOrder]') ? parseInt(formData.get('metadata[sortOrder]')) : 0,
            remark: formData.get('metadata[remark]')?.trim() || ''
        };

        // 构建完整数据对象
        const data = {
            eventId: parseInt(eventId),
            sessionName: formData.get('sessionName')?.trim(),
            startTime: startDateTime,
            endTime: endDateTime,
            venueId: formData.get('venueId') ? parseInt(formData.get('venueId')) : null,
            hallName: formData.get('hallName')?.trim() || '',
            address: formData.get('address')?.trim() || '',
            totalSeats: totalSeats,
            availableSeats: totalAvailableSeats,
            ticketTierConfig: ticketTierConfig,
            metadata: metadata,
            status: formData.get('status') || 'not_started'
        };

        // 验证总座位数
        if (data.totalSeats <= 0) {
            throw new Error('请至少为一个票档分配座位数');
        }

        console.log('提交数据:', data);

        // 调用API
        if (sessionId) {
            await put(`/api/admin/sessions/${sessionId}`, data);
            alert('更新成功');
        } else {
            const result = await post('/api/admin/sessions', data);
            alert('创建成功');
            sessionId = result.id;
        }

        // 返回列表页
        window.location.href = 'admin-sessions.html?eventId=' + eventId;
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
 * 禁用表单（查看模式）
 */
function disableForm() {
    document.querySelectorAll('#sessionForm input, #sessionForm select, #sessionForm textarea, #sessionForm button').forEach(el => {
        if (el.type !== 'hidden' && el.id !== 'cancelBtn' && el.id !== 'previewBtn') {
            el.disabled = true;
        }
    });
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
 * 辅助函数：格式化日期为 date input 格式
 */
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 辅助函数：格式化时间为 time input 格式
 */
function formatTimeForInput(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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
