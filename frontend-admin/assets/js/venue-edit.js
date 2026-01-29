/**
 * 场馆编辑页面逻辑
 * 文件：admin-venue-edit.html
 */

let venueId = null;
let isReadonly = false;

/**
 * 页面初始化
 */
window.addEventListener('DOMContentLoaded', async () => {
    // 获取URL参数
    const params = new URLSearchParams(window.location.search);
    venueId = params.get('id');
    isReadonly = params.get('readonly') === 'true';

    // 修改标题
    const title = document.querySelector('.admin-header-title');
    title.textContent = venueId ? (isReadonly ? '查看场馆' : '编辑场馆') : '新建场馆';

    // 如果是只读模式，禁用表单
    if (isReadonly) {
        disableForm();
        // 隐藏保存按钮
        document.getElementById('submitBtn').style.display = 'none';
    }

    // 如果有ID（编辑或查看模式），加载场馆数据
    if (venueId) {
        await loadVenueData();
    }

    // 绑定取消按钮
    document.getElementById('cancelBtn').addEventListener('click', () => {
        window.location.href = 'admin-venues.html';
    });

    // 绑定表单提交
    document.getElementById('venueForm').addEventListener('submit', handleFormSubmit);
});

/**
 * 加载场馆数据
 */
async function loadVenueData() {
    try {
        const venue = await get(`/api/admin/venues/${venueId}`);

        // 回填表单
        document.querySelector('[name="name"]').value = venue.name || '';
        document.querySelector('[name="city"]').value = venue.city || '';
        document.querySelector('[name="district"]').value = venue.district || '';
        document.querySelector('[name="address"]').value = venue.address || '';
        document.querySelector('[name="capacity"]').value = venue.capacity || '';
        document.querySelector('[name="latitude"]').value = venue.latitude || '';
        document.querySelector('[name="longitude"]').value = venue.longitude || '';
        document.querySelector('[name="images"]').value = venue.images || '';
        document.querySelector('[name="description"]').value = venue.description || '';

        // 回填设施标签
        if (venue.facilities && venue.facilities.length > 0) {
            venue.facilities.forEach(facility => {
                const checkbox = document.querySelector(`[name="facilities[]"][value="${facility}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } catch (error) {
        console.error('加载失败:', error);
        alert('加载场馆数据失败: ' + error.msg);
    }
}

/**
 * 禁用表单（查看模式）
 */
function disableForm() {
    document.querySelectorAll('#venueForm input, #venueForm select, #venueForm textarea').forEach(el => {
        el.disabled = true;
    });
}

/**
 * 表单提交
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    console.log('========== 表单提交开始 ==========');

    // 禁用提交按钮
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '保存中...';

    try {
        console.log('开始收集表单数据...');

        // 收集表单数据
        const formData = new FormData(e.target);
        console.log('FormData对象:', formData);

        // 打印所有表单字段
        for (let [key, value] of formData.entries()) {
            console.log(`表单字段 [${key}]:`, value);
        }

        const data = {
            name: formData.get('name').trim(),
            city: formData.get('city'),
            district: formData.get('district').trim(),
            address: formData.get('address').trim(),
            capacity: formData.get('capacity') ? parseInt(formData.get('capacity')) : null,
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null
        };

        console.log('基础数据:', data);

        // 可选字段：只有当有值时才添加
        const images = formData.get('images').trim();
        if (images) {
            data.images = images;
            console.log('添加images字段:', images);
        } else {
            console.log('images字段为空，跳过');
        }

        const description = formData.get('description').trim();
        if (description) {
            data.description = description;
            console.log('添加description字段:', description);
        } else {
            console.log('description字段为空，跳过');
        }

        // 收集设施标签
        const facilities = [];
        document.querySelectorAll('[name="facilities[]"]:checked').forEach(cb => {
            facilities.push(cb.value);
        });
        if (facilities.length > 0) {
            data.facilities = facilities;
            console.log('添加facilities字段:', facilities);
        } else {
            console.log('facilities字段为空，跳过');
        }

        // 最终数据
        console.log('最终提交的数据对象:', data);
        console.log('数据JSON序列化:', JSON.stringify(data, null, 2));

        // 调用API
        const apiUrl = venueId ? `/api/admin/venues/${venueId}` : '/api/admin/venues';
        const apiMethod = venueId ? 'PUT' : 'POST';
        console.log(`准备调用API: ${apiMethod} ${apiUrl}`);

        if (venueId) {
            // 更新
            console.log('执行更新操作...');
            await put(`/api/admin/venues/${venueId}`, data);
            alert('更新成功');
        } else {
            // 创建
            console.log('执行创建操作...');
            await post('/api/admin/venues', data);
            alert('创建成功');
        }

        console.log('API调用成功，准备跳转...');

        // 返回列表页
        window.location.href = 'admin-venues.html';
    } catch (error) {
        console.error('========== 表单提交异常 ==========');
        console.error('错误对象:', error);
        console.error('错误名称:', error.name);
        console.error('错误消息:', error.message);
        console.error('==================================');
        alert('保存失败: ' + error.msg);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}
