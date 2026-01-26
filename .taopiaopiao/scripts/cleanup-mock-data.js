const fs = require('fs');
const path = require('path');

/**
 * 清理模拟数据脚本
 * 将frontend目录中的模拟数据替换为开发模板
 */

const frontendDir = path.join(__dirname, '../../frontend');

// 需要清理的HTML文件模式
const patterns = {
    // 演出卡片模式
    eventCard: /<!-- 演出卡片 \d+ -->[\s\S]*?<\/div>\s*<\/div>/g,

    // 订单行模式
    orderRow: /<tr>[\s\S]*?<\/tr>/g,

    // 场次表格行模式
    sessionRow: /<tr>[\s\S]*?<\/tr>/g,

    // 知识库FAQ行模式
    knowledgeRow: /<tr>[\s\S]*?<\/tr>/g,

    // 统计卡片数字
    statValue: /<span style="font-size: \d+px; font-weight: \d+; color: #[\da-f]+;">[\d,]+<\/span>/g,

    // 硬编码的用户名
    userName: /<span>张三<\/span>|<span>李四<\/span>|<span>王五<\/span>/g,
};

/**
 * 清理index.html - 演出列表
 */
function cleanIndexHtml(content) {
    // 移除所有演出卡片，保留一个模板
    const eventCardTemplate = `<!-- 演出卡片模板 - 通过JavaScript动态生成 -->
                <div class="event-card" data-event-id="">
                    <div class="event-cover" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"></div>
                    <div class="event-info">
                        <div class="event-title"></div>
                        <div class="event-meta">
                            <span class="event-meta-icon">📅</span><span class="event-date"></span>
                        </div>
                        <div class="event-meta">
                            <span class="event-meta-icon">📍</span><span class="event-venue"></span>
                        </div>
                        <div class="event-price">
                            <span class="price-range"></span>
                            <span class="event-status">
                                <span class="badge badge-success"></span>
                            </span>
                        </div>
                    </div>
                </div>`;

    // 替换所有演出卡片为一个模板
    content = content.replace(patterns.eventCard, eventCardTemplate);
    content = content.replace(/<!-- 演出卡片模板[\s\S]*?-->/, eventCardTemplate);

    // 清理用户名
    content = content.replace(/<span>张三<\/span>/g, '<span class="user-name"></span>');

    return content;
}

/**
 * 清理event-detail.html - 演出详情
 */
function cleanEventDetailHtml(content) {
    // 清理硬编码的演出信息
    content = content.replace(/周杰伦2025嘉年华世界巡回演唱会-上海站/g, '');
    content = content.replace(/演唱会/g, '<span class="event-type"></span>');

    // 清理日期时间
    content = content.replace(/2025\.\d+\.\d+ - \d+\.\d+/g, '');
    content = content.replace(/2025\.\d+\.\d+/g, '');

    // 清理价格
    content = content.replace(/¥\d+ - ¥\d+/g, '');

    // 清理场馆
    content = content.replace(/上海体育场|梅赛德斯-奔驰文化中心|上海文化广场/g, '');

    return content;
}

/**
 * 清理admin页面 - 表格数据
 */
function cleanAdminTable(content) {
    // 清理表格中的数据行，保留表头
    const tableRowTemplate = `<tr>
                    <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
                        数据将通过API动态加载
                    </td>
                </tr>`;

    // 替换tbody内容
    content = content.replace(/<tbody>[\s\S]*?<\/tbody>/g, '<tbody>' + tableRowTemplate + '</tbody>');

    // 清理统计数字
    content = content.replace(/\d+,\d+|\d+/g, '0');

    return content;
}

/**
 * 清理模板卡片（推送模板页面）
 */
function cleanTemplateCards(content) {
    // 移除所有模板卡片
    const templatePlaceholder = `<!-- 模板卡片将通过JavaScript动态生成 -->`;

    content = content.replace(/<!-- 模板卡片 \d+ -->[\s\S]*?<\/div>\s*<\/div>/g, templatePlaceholder);

    return content;
}

/**
 * 清理session-list.html - 场次列表
 */
function cleanSessionList(content) {
    const sessionTemplate = `<!-- 场次卡片将通过JavaScript动态生成 -->`;

    content = content.replace(/<!-- 场次卡片 \d+ -->[\s\S]*?<\/div>\s*<\/div>/g, sessionTemplate);

    return content;
}

/**
 * 清理seat-selection.html - 座位图
 */
function cleanSeatSelection(content) {
    // 清理硬编码的座位数据
    content = content.replace(/data-status="(?:available|selected|sold)"/g, 'data-status=""');

    return content;
}

/**
 * 主函数：处理所有HTML文件
 */
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);

    console.log(`Processing: ${fileName}`);

    // 根据不同文件选择不同的清理策略
    if (fileName === 'index.html') {
        content = cleanIndexHtml(content);
    } else if (fileName === 'event-detail.html') {
        content = cleanEventDetailHtml(content);
    } else if (fileName.startsWith('admin-')) {
        // Admin页面清理
        if (fileName.includes('templates')) {
            content = cleanTemplateCards(content);
        } else {
            content = cleanAdminTable(content);
        }
    } else if (fileName === 'session-list.html') {
        content = cleanSessionList(content);
    } else if (fileName === 'seat-selection.html') {
        content = cleanSeatSelection(content);
    }

    // 通用清理：移除硬编码用户信息
    content = content.replace(/张三|李四|王五/g, '');

    // 写回文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned: ${fileName}`);
}

/**
 * 递归处理目录
 */
function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            processFile(filePath);
        }
    });
}

// 执行清理
console.log('开始清理模拟数据...\n');
processDirectory(frontendDir);
console.log('\n✅ 模拟数据清理完成！');
console.log('\n提示：');
console.log('1. 所有硬编码的模拟数据已移除');
console.log('2. HTML模板已准备好，等待JavaScript动态填充');
console.log('3. 可以开始开发前端功能，对接API了');
