# 🎫 淘票票 - 票务系统前端静态原型

> 一个高保真、接近真实互联网票务平台的静态HTML+CSS产品原型

## 项目简介

本项目是根据 `frontend.md` 的统一Prompt生成的完整票务系统前端原型，涵盖客户端（C端）和管理端（Admin）的所有核心页面。

### 技术栈

- **纯 HTML + CSS**（无JavaScript）
- 响应式设计
- 现代SaaS风格UI

### 设计特点

- 白/灰/蓝色调，专业简洁
- 卡片式布局
- 组件化样式系统
- 拟真数据，非Demo占位

## 项目结构

```
taopiaopiao/
├── frontend/               # 前端静态页面目录
│   ├── assets/
│   │   └── css/
│   │       ├── common.css      # 公共样式
│   │       ├── client.css      # C端样式
│   │       └── admin.css       # Admin端样式
│   ├── admin/                  # 管理后台页面
│   │   ├── admin-login.html    # 管理员登录
│   │   ├── admin-index.html    # 数据概览
│   │   ├── admin-events.html   # 演出管理
│   │   ├── admin-orders.html   # 订单管理
│   │   ├── admin-knowledge.html # 知识库管理
│   │   └── admin-ai-analytics.html # AI分析
│   ├── index.html              # C端首页/演出列表
│   ├── event-detail.html       # 演出详情
│   ├── session-list.html       # 场次选择
│   ├── seat-selection.html     # 选座购票
│   ├── ticket-tier-selection.html # 票档购票
│   ├── reservation-result.html # 占用结果
│   ├── order-confirm.html      # 订单确认
│   ├── order-center.html       # 订单中心
│   ├── order-detail.html       # 订单详情
│   ├── login.html              # 登录/注册
│   ├── profile.html            # 个人中心
│   ├── favorites.html          # 我的收藏
│   ├── notifications.html      # 消息通知
│   ├── help-center.html        # 帮助中心
│   ├── ai-qa.html              # AI问答
│   └── ai-subscription.html    # AI订阅推送
├── frontend.md             # 前端生成Prompt
└── README.md               # 项目说明文档

```

## 页面说明

### C端页面（客户端）

#### 核心页面
1. **首页** (`index.html`) - 演出列表，支持城市、分类、时间筛选
2. **演出详情** (`event-detail.html`) - 演出完整信息、场馆、票档
3. **场次选择** (`session-list.html`) - 多场次列表，开售/余票提醒
4. **选座购票** (`seat-selection.html`) - 可视化选座界面
5. **票档购票** (`ticket-tier-selection.html`) - 票档快速选择
6. **占用结果** (`reservation-result.html`) - 占用成功/失败态
7. **订单确认** (`order-confirm.html`) - 订单摘要、支付方式
8. **订单中心** (`order-center.html`) - 订单列表，状态筛选
9. **订单详情** (`order-detail.html`) - 订单信息、电子票

#### 辅助页面
10. **登录/注册** (`login.html`) - 手机验证码、第三方登录
11. **个人中心** (`profile.html`) - 用户资料管理
12. **我的收藏** (`favorites.html`) - 收藏演出列表
13. **消息通知** (`notifications.html`) - 订单、系统、活动消息
14. **帮助中心** (`help-center.html`) - FAQ、常见问题

#### AI功能页面
15. **AI问答** (`ai-qa.html`) - Chat风格智能助手界面
16. **AI订阅** (`ai-subscription.html`) - 订阅管理与推送设置

### Admin端页面（管理后台）

#### 基础管理
1. **管理员登录** (`admin-login.html`) - 管理员认证
2. **数据概览** (`admin-index.html`) - 统计看板、实时数据
3. **演出管理** (`admin-events.html`) - 演出CRUD、上下架
4. **订单管理** (`admin-orders.html`) - 订单查询、状态管理

#### AI功能管理
5. **知识库管理** (`admin-knowledge.html`) - FAQ、公告、规则维护
6. **AI分析** (`admin-ai-analytics.html`) - 问答统计、模型性能监控

## 如何使用

### 本地预览

1. 克隆或下载项目
2. 直接用浏览器打开任意HTML文件即可

推荐入口：
- C端：打开 `frontend/index.html`
- Admin端：打开 `frontend/admin/admin-login.html`

### 页面跳转

所有页面之间通过 `<a>` 标签链接，形成完整的用户流程闭环：

**C端核心流程**：
```
首页 → 演出详情 → 场次选择 → 选座/票档 → 占用结果 → 订单确认 → 订单中心 → 订单详情
```

**Admin端流程**：
```
管理员登录 → 数据概览 → 演出/订单管理 → AI功能管理
```

## 样式系统

### 公共样式 (`common.css`)
- 重置样式
- 容器、按钮、卡片、表格
- 表单、徽章、价格
- 工具类（间距、文本、布局）

### C端样式 (`client.css`)
- 顶部导航、页脚
- 演出卡片网格
- 筛选栏、座位图
- 订单卡片、电子票

### Admin端样式 (`admin.css`)
- 侧边栏导航
- 统计卡片
- 数据表格
- 表单、时间轴

## 设计规范

### 色彩
- 主色：`#1976d2` (蓝)
- 成功：`#388e3c` (绿)
- 警告：`#f57c00` (橙)
- 危险：`#d32f2f` (红)
- 背景：`#f5f5f5` (浅灰)

### 字体
- 系统字体栈，保证在各平台显示效果
- 标题：28px / 24px / 20px / 18px
- 正文：14px
- 辅助：13px / 12px

### 间距
- 组件间距：16px / 24px / 32px
- 页面边距：20px / 32px

## 数据说明

所有页面数据均为**拟真数据**，包括：
- 演出信息（周杰伦、林俊杰等）
- 订单数据
- 用户信息
- 统计数据

数据内容贴近真实业务场景，便于产品演示和评审。

## 特色功能

### 1. 选座系统
- 可视化座位图
- 座位状态（可售/占用/已售）
- 座位图例说明

### 2. AI助手
- Chat风格对话界面
- 预置问题快捷入口
- 智能回答展示

### 3. 电子票
- 二维码展示
- 票面信息完整
- 保存/分享功能

### 4. 管理后台
- 数据统计看板
- 实时订单监控
- AI知识库管理

## 浏览器兼容

支持所有现代浏览器：
- Chrome / Edge (推荐)
- Firefox
- Safari

## 项目规范

遵循 `frontend.md` 中的所有强制约束：

✅ 仅使用 HTML + CSS
✅ 每个页面为独立HTML文件
✅ 页面间通过 `<a>` 标签跳转
✅ 内容拟真，无Demo占位
✅ 优先体现产品专业度

❌ 不使用JavaScript
❌ 不使用"demo/示例"等字样

## 扩展说明

本项目为静态原型，如需后续开发：
- 可添加JavaScript实现交互逻辑
- 可对接后端API
- 可使用React/Vue等框架重构
- 可添加支付、用户认证等真实功能

---

**开发日期**：2025-01-25
**版本**：v1.0
**Prompt来源**：`frontend.md`
