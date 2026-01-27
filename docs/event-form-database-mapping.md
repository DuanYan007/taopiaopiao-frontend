# 演出创建表单 - 数据库字段映射文档

> 确保 `admin-event-edit.html` 表单字段与 `events` 表数据库设计完全一致

---

## 一、字段映射关系表

### 基本信息

| 表单标签 | 表单字段名 | 数据库字段 | 数据类型 | 必填 | 说明 |
|---------|-----------|-----------|---------|------|------|
| 演出名称 | `name` | `events.name` | VARCHAR(200) | ✅ | - |
| 演出类型 | `type` | `events.type` | ENUM | ✅ | concert/theatre/exhibition/sports/music/kids/dance |
| 艺人/主办方 | `artist` | `events.artist` | VARCHAR(100) | ✅ | - |
| 城市 | `city` | `events.city` | VARCHAR(50) | ✅ | - |
| 默认场馆 | `venue_id` | `events.venue_id` | BIGINT | ✅ | 外键 → venues.id |
| 副标题 | `subtitle` | `events.subtitle` | VARCHAR(200) | ❌ | - |

### 预售时间

| 表单标签 | 表单字段名 | 数据库字段 | 数据类型 | 必填 | 说明 |
|---------|-----------|-----------|---------|------|------|
| 开售时间 | `sale_start_time` | `events.sale_start_time` | DATETIME | ✅ | - |
| 停售时间 | `sale_end_time` | `events.sale_end_time` | DATETIME | ❌ | - |

### 票档设置（嵌套对象数组）

| 表单标签 | 表单字段名 | 数据库表 | 数据类型 | 必填 | 说明 |
|---------|-----------|---------|---------|------|------|
| 票档名称 | `ticket_tiers[0].name` | `ticket_tiers.name` | VARCHAR(50) | ✅ | - |
| 价格 | `ticket_tiers[0].price` | `ticket_tiers.price` | DECIMAL(10,2) | ✅ | - |
| 座位颜色 | `ticket_tiers[0].color` | `ticket_tiers.color` | VARCHAR(20) | ❌ | 如：#FF5722 |
| 每人限购 | `ticket_tiers[0].max_purchase` | `ticket_tiers.max_purchase` | INT | ❌ | 默认4 |
| 票档说明 | `ticket_tiers[0].description` | `ticket_tiers.description` | VARCHAR(200) | ❌ | - |

**注意**: 票档数据提交后端时，会先插入到 `ticket_tiers` 表，自动关联 `event_id`

### 演出详情

| 表单标签 | 表单字段名 | 数据库字段 | 数据类型 | 必填 | 说明 |
|---------|-----------|-----------|---------|------|------|
| 演出海报 | `cover_image` | `events.cover_image` | VARCHAR(500) | ❌ | 图片URL |
| 演出图片 | `images[]` | `events.images` | JSON | ❌ | URL数组，逗号分隔 |
| 演出简介 | `description` | `events.description` | TEXT | ❌ | - |
| 温馨提示 | `metadata[tips]` | `events.metadata` | JSON | ❌ | 存储在metadata对象中 |
| 购票须知 | `metadata[refund_policy]` | `events.metadata` | JSON | ❌ | 存储在metadata对象中 |

### 状态设置

| 表单标签 | 表单字段名 | 数据库字段 | 数据类型 | 必填 | 说明 |
|---------|-----------|-----------|---------|------|------|
| 上架状态 | `status` | `events.status` | ENUM | ✅ | draft/on_sale/off_sale/sold_out |
| 标签设置 | `tags[]` | `events.tags` | JSON | ❌ | 多选框，值数组 |

---

## 二、表单提交数据格式

### 完整的表单数据结构

```javascript
{
  // 基本信息
  name: "周杰伦演唱会",
  type: "concert",
  artist: "周杰伦",
  city: "上海",
  venue_id: "1",
  subtitle: "嘉年华世界巡回演唱会-上海站",

  // 预售时间
  sale_start_time: "2025-02-01T10:00",
  sale_end_time: "2025-03-15T23:59",

  // 票档设置（数组）
  ticket_tiers: [
    {
      name: "VIP内场",
      price: "2580.00",
      color: "#FF5722",
      max_purchase: "4",
      description: "含周边礼包"
    },
    {
      name: "看台一等",
      price: "1880.00",
      color: "#2196F3",
      max_purchase: "4",
      description: ""
    }
  ],

  // 演出详情
  cover_image: "https://example.com/poster.jpg",
  images: "https://example.com/1.jpg,https://example.com/2.jpg",
  description: "演出详情描述...",
  metadata: {
    tips: "儿童入场提示、禁止携带物品等",
    refund_policy: "退换票政策、实名制要求等"
  },

  // 状态设置
  status: "on_sale",
  tags: ["recommended", "hot"]
}
```

---

## 三、前端表单字段命名规范

### 3.1 基础字段
- 直接使用数据库字段名作为 `name` 属性
- 例如：`<input name="artist">` → `events.artist`

### 3.2 嵌套对象（metadata）
- 使用点表示法或方括号表示法
- 例如：`<textarea name="metadata[tips]">` → 存储到 `events.metadata.tips`

### 3.3 数组字段（ticket_tiers, tags）
- 使用方括号加索引
- 例如：`<input name="ticket_tiers[0].name">`
- 多选框：`<input type="checkbox" name="tags[]" value="hot">`

### 3.4 多图字段（images）
- 使用 `name="images[]"` 或单个输入框逗号分隔
- 提交时需处理为JSON数组格式

---

## 四、后端数据处理流程

### 4.1 接收表单数据

```javascript
// 伪代码示例
async function createEvent(formData) {
  // 1. 验证必填字段
  if (!formData.name || !formData.type || !formData.city) {
    throw new Error('缺少必填字段');
  }

  // 2. 处理 images 字符串转JSON数组
  if (typeof formData.images === 'string') {
    formData.images = formData.images.split(',').map(url => url.trim());
  }

  // 3. 处理 tags 数组
  if (!formData.tags || formData.tags.length === 0) {
    formData.tags = [];
  }

  // 4. 开始事务
  const transaction = await db.beginTransaction();

  try {
    // 5. 插入 events 表
    const eventResult = await db.query(
      `INSERT INTO events (name, type, artist, city, venue_id, subtitle, description, cover_image, images, sale_start_time, sale_end_time, tags, metadata, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        formData.name,
        formData.type,
        formData.artist,
        formData.city,
        formData.venue_id,
        formData.subtitle,
        formData.description,
        formData.cover_image,
        JSON.stringify(formData.images),
        formData.sale_start_time,
        formData.sale_end_time,
        JSON.stringify(formData.tags),
        JSON.stringify(formData.metadata),
        formData.status
      ]
    );

    const eventId = eventResult.insertId;

    // 6. 插入 ticket_tiers 表
    for (const tier of formData.ticket_tiers) {
      await db.query(
        `INSERT INTO ticket_tiers (event_id, name, price, color, description, max_purchase, sort_order, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, tier.name, tier.price, tier.color, tier.description, tier.max_purchase, 0, true]
      );
    }

    // 7. 提交事务
    await transaction.commit();

    return { eventId, message: '演出创建成功' };

  } catch (error) {
    // 8. 回滚事务
    await transaction.rollback();
    throw error;
  }
}
```

### 4.2 前端JavaScript处理示例

```javascript
// 获取表单数据
function getFormData(form) {
  const formData = new FormData(form);
  const data = {};

  // 处理普通字段
  for (let [key, value] of formData.entries()) {
    // 处理数组字段（tags）
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2);
      if (!data[arrayKey]) data[arrayKey] = [];
      data[arrayKey].push(value);
    }
    // 处理嵌套对象（metadata）
    else if (key.includes('[')) {
      const [obj, prop] = key.split(/[\[\]]/).filter(Boolean);
      if (!data[obj]) data[obj] = {};
      data[obj][prop] = value;
    }
    // 处理票档数组
    else if (key.startsWith('ticket_tiers')) {
      const match = key.match(/ticket_tiers\[(\d+)\]\.(.+)/);
      if (match) {
        const [, index, prop] = match;
        if (!data.ticket_tiers) data.ticket_tiers = [];
        if (!data.ticket_tiers[index]) data.ticket_tiers[index] = {};
        data.ticket_tiers[index][prop] = value;
      }
    }
    // 普通字段
    else {
      data[key] = value;
    }
  }

  return data;
}

// 提交表单
async function submitEventForm(form) {
  const data = getFormData(form);

  try {
    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.code === 0) {
      alert('演出创建成功！');
      window.location.href = '/admin-events.html';
    } else {
      alert('创建失败：' + result.message);
    }
  } catch (error) {
    console.error('提交失败:', error);
    alert('网络错误，请重试');
  }
}
```

---

## 五、字段验证规则

### 前端验证（HTML5）

| 字段 | 验证规则 | HTML属性 |
|------|---------|---------|
| name | 必填，最大200字符 | `required maxlength="200"` |
| type | 必填，枚举值 | `required` + `<select>` |
| artist | 必填，最大100字符 | `required maxlength="100"` |
| city | 必填 | `required` |
| venue_id | 必填，数字 | `required` + `<select>` |
| ticket_tiers[].price | 必填，数字，>=0 | `required min="0" step="0.01"` |
| ticket_tiers[].max_purchase | 数字，>=1 | `min="1"` |

### 后端验证

```javascript
const validators = {
  name: { required: true, maxLength: 200 },
  type: { required: true, enum: ['concert', 'theatre', 'exhibition', 'sports', 'music', 'kids', 'dance'] },
  artist: { required: true, maxLength: 100 },
  city: { required: true, maxLength: 50 },
  venue_id: { required: true, type: 'integer' },
  ticket_tiers: {
    required: true,
    minLength: 1, // 至少一个票档
    item: {
      name: { required: true, maxLength: 50 },
      price: { required: true, type: 'decimal', min: 0 }
    }
  }
};
```

---

## 六、常见问题

### Q1: 为什么演出时间不在events表？
**A**: 因为一个演出可以有多个场次（不同日期/时间），所以具体的场次时间应存储在 `sessions` 表。`events` 表只存储演出本身的预售时间。

### Q2: metadata字段什么时候用？
**A**: 当字段不是核心查询条件，且未来可能变化时，优先使用metadata存储。例如：温馨提示、购票须知、演出时长等。

### Q3: 如何处理场次创建？
**A**: 演出创建完成后，跳转到场次创建页面（`admin-session-edit.html`），选择已创建的演出，再添加具体场次。

### Q4: 票档座位数字段为什么移除了？
**A**: 座位数应该在创建场次时根据场馆座位图自动生成，而不是在演出级别设置。

---

## 七、总结

**核心原则**：
1. ✅ 表单字段名与数据库字段名保持一致
2. ✅ 嵌套对象使用 `metadata[field]` 格式
3. ✅ 数组使用 `field[index]` 或 `field[]` 格式
4. ✅ 票档作为独立表，通过 `ticket_tiers[]` 数组提交
5. ✅ 扩展字段统一存储在 `metadata` JSON字段
6. ✅ 验证规则前后端保持一致

---

**最后更新**: 2025-01-26
**相关文件**:
- `frontend-admin/admin-event-edit.html` - 表单页面
- `docs/reverse-modeling-events-sessions.md` - 数据库设计文档
- `docs/api-specification.md` - API接口文档（待创建）
