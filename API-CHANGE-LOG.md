# 秒杀与订单接口变更说明

## 变更概述

选座与支付流程进行调整，选座成功后会直接创建待支付订单，前端需使用返回的订单号进行支付。

---

## 1. 选座接口 `/seckill/lock`

### 请求（无变化）

```http
POST /seckill/lock
Content-Type: application/json

{
  "sessionId": 1,
  "userId": 1001,
  "seatIds": ["1:1", "1:2"],
  "expireSeconds": 300
}
```

### 响应（有变化）

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "success": true,
    "code": 0,
    "message": "锁座成功",
    "lockedSeats": ["1:1", "1:2"],
    "lockId": "abc123...",
    "orderNo": "ORD202603101234567890ABCD"   // 【新增】订单号
  }
}
```

#### 响应字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| success | Boolean | 是否成功 |
| code | Integer | 状态码：0=成功, 1=座位不存在, 2=座位不可用, 3=重复购票, 4=创建订单失败, 5=获取场次信息失败, 6=系统异常 |
| message | String | 消息描述 |
| lockedSeats | String[] | 锁定的座位ID列表 |
| lockId | String | 锁定ID |
| orderNo | String | **订单号（新增）**，选座成功后自动创建待支付订单 |

---

## 2. 支付接口 `/client/orders` (POST)

### 请求（有变化）

```http
POST /client/orders
Content-Type: application/json
X-User-Id: 1001

{
  "orderNo": "ORD202603101234567890ABCD",   // 【必填】订单号，来自 /seckill/lock 返回
  "sessionId": 1,                           // 【保留】场次ID
  "seatIds": ["1:1", "1:2"],                // 【保留】座位ID列表
  "totalAmount": 280.00                     // 【保留】订单总金额
}
```

#### 请求字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| orderNo | String | **是** | **订单号**，来自选座接口返回 |
| sessionId | Long | 否 | 场次ID（保留，用于校验） |
| seatIds | String[] | 否 | 座位ID列表（保留，用于校验） |
| totalAmount | BigDecimal | 否 | 订单总金额（保留，用于校验） |

> **注意**：`seatDetails` 字段已移除，不再需要传递座位详情。

### 响应（无变化）

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "id": 1,
    "orderNo": "ORD202603101234567890ABCD",
    "userId": 1001,
    "sessionId": 1,
    "eventId": 100,
    "seatIds": ["1:1", "1:2"],
    "seatCount": 2,
    "unitPrice": 140.00,
    "totalAmount": 280.00,
    "status": 1,                    // 0=待支付, 1=已支付, 2=已取消, 3=已退款, 4=超时取消
    "statusDesc": "已支付",
    "payTime": "2026-03-10T10:30:00",
    "expireTime": "2026-03-10T10:25:00",
    "createdAt": "2026-03-10T10:00:00"
  }
}
```

---

## 3. 前端流程调整

### 旧流程
```
选座 → 锁定座位(Redis) → 支付页面 → 创建订单并支付
```

### 新流程
```
选座 → 锁定座位 + 创建待支付订单 → 支付页面 → 支付已有订单
```

### 前端实现步骤

#### Step 1: 用户选座，调用 `/seckill/lock`

```javascript
const lockResponse = await fetch('/seckill/lock', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 1,
    userId: 1001,
    seatIds: ['1:1', '1:2'],
    expireSeconds: 300
  })
});

const { success, data } = await lockResponse.json();

if (data.success) {
  // 保存订单号，用于后续支付
  const orderNo = data.orderNo;
  // 跳转到支付页面
  router.push({ path: '/payment', query: { orderNo } });
} else {
  // 处理错误
  showError(data.message);
}
```

#### Step 2: 支付页面，使用 `orderNo` 调用 `/client/orders`

```javascript
// 从URL获取订单号
const orderNo = router.currentRoute.value.query.orderNo;

const payResponse = await fetch('/client/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-User-Id': '1001'
  },
  body: JSON.stringify({
    orderNo: orderNo,        // 必填，来自选座接口
    sessionId: 1,            // 可选，用于校验
    seatIds: ['1:1', '1:2'], // 可选，用于校验
    totalAmount: 280.00      // 可选，用于校验
  })
});

const { success, data } = await payResponse.json();

if (success) {
  // 支付成功，data.status = 1
  showSuccess('支付成功');
  router.push({ path: '/order-detail', query: { orderNo: data.orderNo } });
} else {
  // 支付失败
  showError(data.msg);
}
```

---

## 4. 错误处理

### 选座接口错误码

| code | 说明 | 建议处理 |
|------|------|----------|
| 0 | 成功 | 获取 orderNo，继续支付流程 |
| 1 | 座位不存在 | 提示用户重新选座 |
| 2 | 座位已被锁定或售出 | 提示用户座位已不可用，刷新页面 |
| 3 | 重复购票 | 提示用户已购买过该座位 |
| 4 | 创建订单失败 | 提示用户重试 |
| 5 | 获取场次信息失败 | 提示用户重试 |
| 6 | 系统异常 | 提示用户稍后重试 |

### 支付接口常见错误

| 错误信息 | 说明 | 建议处理 |
|----------|------|----------|
| 订单不存在 | orderNo 无效 | 返回选座页面重新选座 |
| 订单状态异常 | 订单已支付/已取消 | 查询订单状态，引导用户跳转 |
| 订单已过期 | 超过15分钟未支付 | 返回选座页面重新选座 |
| 确认购买失败 | 座位已被释放 | 返回选座页面重新选座 |

---

## 5. 其他接口（无变化）

以下接口保持不变，无需调整：

| 接口 | 方法 | 说明 |
|------|------|------|
| `/client/orders` | GET | 订单列表（分页） |
| `/client/orders/{orderNo}` | GET | 查询订单详情 |
| `/client/orders/{orderNo}/cancel` | POST | 取消订单 |
| `/client/orders/{orderNo}/delete` | POST | 删除订单 |
| `/seckill/confirm` | POST | 确认购买（内部接口） |
| `/seckill/release` | POST | 释放座位（内部接口） |

---

## 6. 订单状态说明

| status | statusDesc | 说明 |
|--------|------------|------|
| 0 | 待支付 | 选座成功后创建的初始状态 |
| 1 | 已支付 | 支付成功 |
| 2 | 已取消 | 用户主动取消 |
| 3 | 已退款 | 退款完成 |
| 4 | 超时取消 | 15分钟未支付自动取消 |

---

## 7. 注意事项

1. **订单号传递**：选座接口返回的 `orderNo` 必须妥善保存，用于后续支付
2. **支付超时**：待支付订单有效期为 **15分钟**，超时后自动取消
3. **幂等性**：同一订单号可重复调用支付接口，不会重复扣款
4. **兼容性**：旧版支付逻辑（不传 orderNo）仍然支持，但建议尽快迁移

---

## 8. 联调测试

### 测试用例

| 场景 | 预期结果 |
|------|----------|
| 正常选座 → 支付 | 创建待支付订单 → 支付成功 |
| 选座成功后不支付，等15分钟 | 订单自动超时取消 |
| 选座成功后取消订单，再支付 | 提示订单状态异常 |
| 使用已支付的订单号再次支付 | 提示订单状态异常 |
| 使用不存在的订单号支付 | 提示订单不存在 |

---

**文档版本**: v1.0
**生效日期**: 2026-03-10
**维护人**: 后端开发团队
