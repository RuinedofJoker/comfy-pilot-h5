# ComfyUI 风格指南

> 本文档总结了 ComfyUI 原生深色主题的设计系统，用于保持项目 UI 设计的一致性。

## 目录

- [设计理念](#设计理念)
- [色彩系统](#色彩系统)
- [排版系统](#排版系统)
- [间距系统](#间距系统)
- [组件样式](#组件样式)
- [交互效果](#交互效果)
- [图标系统](#图标系统)
- [响应式设计](#响应式设计)

---

## 设计理念

ComfyUI 的设计遵循以下核心原则：

1. **深色优先**：采用深色主题减少视觉疲劳，适合长时间工作
2. **极简主义**：去除不必要的装饰，专注于功能性
3. **紧凑布局**：高信息密度，充分利用屏幕空间
4. **微妙反馈**：使用细微的视觉变化提供交互反馈
5. **专业工具感**：类似专业软件的界面风格

---

## 色彩系统

### 主色调 - 深灰色系

ComfyUI 使用多层次的深灰色构建视觉层次：

```css
/* 背景色 - 从深到浅 */
--bg-darkest: #1e1e1e;    /* 最深背景（输入框、最底层） */
--bg-darker: #242424;     /* 深背景（对话区、次级面板） */
--bg-dark: #252525;       /* 标准深背景（主工作区） */
--bg-base: #282828;       /* 基础背景（侧边栏） */
--bg-elevated: #2a2a2a;   /* 抬升背景（卡片、列表项） */

/* 边框/分隔线色 */
--border-subtle: #3a3a3a;  /* 细微边框 */
--border-normal: #444444;  /* 标准边框 */
--border-strong: #4a4a4a;  /* 强调边框 */

/* 交互元素背景 */
--interactive-base: #3a3a3a;    /* 按钮基础色 */
--interactive-hover: #454545;   /* 悬停状态 */
--interactive-active: #4a4a4a;  /* 激活状态 */
```

### 文本色系

```css
/* 文本颜色 - 从亮到暗 */
--text-primary: #ffffff;   /* 主要文本（标题、激活项） */
--text-secondary: #cccccc; /* 次要文本（正文、标签） */
--text-tertiary: #999999;  /* 三级文本（辅助信息） */
--text-muted: #777777;     /* 弱化文本（提示、元数据） */
--text-disabled: #555555;  /* 禁用文本 */
```

### 功能色

```css
/* 状态色 */
--success: #27ae60;   /* 成功/在线（绿色） */
--warning: #f39c12;   /* 警告/未保存（橙色） */
--error: #e74c3c;     /* 错误/危险（红色） */
--info: #4a9eff;      /* 信息/选中（蓝色） */
```

### 色彩使用规则

1. **背景层次**：
   - 最底层使用 `#1e1e1e`（输入框、文本域）
   - 内容区使用 `#242424` - `#282828`
   - 卡片/列表项使用 `#2a2a2a`
   - 悬停状态使用 `#333333`
   - 激活状态使用 `#3a3a3a`

2. **边框使用**：
   - 默认边框：`1px solid #3a3a3a`
   - 强调边框：`1px solid #444444`
   - 功能边框：使用功能色（如 `#27ae60`）

3. **文本对比**：
   - 主要内容使用 `#cccccc` 或 `#ffffff`
   - 辅助信息使用 `#999999` 或 `#777777`
   - 禁用状态使用 `#555555`

---

## 排版系统

### 字体家族

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

**代码/等宽字体**：
```css
font-family: 'Consolas', 'Monaco', monospace;
```

### 字体大小

```css
/* 字体大小层级 */
--font-xs: 11px;    /* 极小文本（提示、元数据） */
--font-sm: 12px;    /* 小文本（按钮、输入框、正文） */
--font-base: 13px;  /* 基础文本（标签、表单） */
--font-md: 15px;    /* 中等文本（重要提示） */
--font-lg: 16px;    /* 大文本（模态框标题） */
--font-xl: 20px;    /* 特大文本（关闭按钮） */
```

### 字重

```css
--font-weight-normal: 400;  /* 常规文本 */
--font-weight-medium: 500;  /* 中等强调（标题、重要信息） */
```

### 行高

```css
--line-height-tight: 1.2;   /* 紧凑（标题） */
--line-height-normal: 1.5;  /* 标准（正文） */
```

### 排版规则

1. **界面文本**：12px - 13px，字重 400
2. **标题文本**：13px - 16px，字重 500
3. **辅助信息**：11px，字重 400
4. **大写文本**：使用 `text-transform: uppercase` + `letter-spacing: 0.5px`

---

## 间距系统

### 间距尺度

```css
/* 间距系统（基于 4px 网格） */
--space-1: 4px;
--space-2: 6px;
--space-3: 8px;
--space-4: 10px;
--space-5: 12px;
--space-6: 16px;
--space-7: 20px;
--space-8: 24px;
```

### 组件内边距

```css
/* 按钮 */
padding: 4px 10px;      /* 小按钮 */
padding: 6px 10px;      /* 标准按钮 */
padding: 8px 12px;      /* 大按钮 */
padding: 8px 20px;      /* 模态框按钮 */

/* 输入框 */
padding: 6px 10px;      /* 小输入框 */
padding: 8px 12px;      /* 标准输入框 */

/* 卡片/面板 */
padding: 10px;          /* 紧凑卡片 */
padding: 12px;          /* 标准面板 */
padding: 20px 24px;     /* 模态框头部/底部 */
padding: 24px;          /* 模态框主体 */
```

### 组件间距

```css
/* 元素间距 */
gap: 3px;    /* 极小间距（图标与文本） */
gap: 4px;    /* 小间距（按钮组） */
gap: 6px;    /* 标准间距（表单元素） */
gap: 8px;    /* 中等间距（工具栏） */
gap: 12px;   /* 大间距（模态框按钮） */

/* 外边距 */
margin-bottom: 4px;   /* 列表项 */
margin-bottom: 6px;   /* 表单提示 */
margin-bottom: 8px;   /* 表单标签 */
margin-bottom: 12px;  /* 消息气泡 */
margin-bottom: 20px;  /* 表单组 */
```

### 圆角

```css
--radius-sm: 3px;   /* 小圆角（按钮、输入框、列表项） */
--radius-md: 4px;   /* 中圆角（卡片、对话框） */
--radius-lg: 6px;   /* 大圆角（下拉菜单） */
--radius-xl: 8px;   /* 特大圆角（模态框） */
--radius-full: 50%; /* 圆形（头像、状态点） */
```

---

## 组件样式

### 按钮

#### 基础按钮
```css
.button {
    padding: 4px 10px;
    background: #2a2a2a;
    color: #999999;
    border: 1px solid #3a3a3a;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.15s;
}

.button:hover {
    background: #333333;
    border-color: #4a4a4a;
    color: #cccccc;
}
```

#### 主要按钮
```css
.button-primary {
    background: #3a3a3a;
    color: #cccccc;
    border-color: #4a4a4a;
}

.button-primary:hover {
    background: #454545;
    border-color: #555555;
    color: #ffffff;
}
```

#### 禁用状态
```css
.button:disabled {
    background: #242424;
    color: #555555;
    border-color: #2a2a2a;
    cursor: not-allowed;
}
```

### 输入框

```css
.input {
    width: 100%;
    padding: 8px 12px;
    background: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    font-size: 13px;
    color: #cccccc;
    outline: none;
    transition: border-color 0.2s;
}

.input:focus {
    border-color: #555555;
}

.input::placeholder {
    color: #555555;
}
```

### 下拉选择框

```css
.select {
    width: 100%;
    padding: 8px 12px;
    background: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    font-size: 13px;
    color: #cccccc;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
}

.select:focus {
    border-color: #555555;
}
```

### 文本域

```css
.textarea {
    width: 100%;
    padding: 8px 12px;
    background: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    font-size: 13px;
    color: #cccccc;
    font-family: 'Consolas', 'Monaco', monospace;
    resize: vertical;
    min-height: 100px;
    outline: none;
    transition: border-color 0.2s;
}

.textarea:focus {
    border-color: #555555;
}
```

### 卡片/列表项

```css
.card {
    padding: 10px;
    background: #2a2a2a;
    border: 1px solid transparent;
    border-radius: 3px;
    transition: all 0.15s;
}

.card:hover {
    background: #333333;
    border-color: #3a3a3a;
}

.card.active {
    background: #3a3a3a;
    border-color: #4a4a4a;
}
```

### 模态框

```css
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #2a2a2a;
    border: 1px solid #444444;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    max-width: 520px;
    width: 90%;
}

.modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #3a3a3a;
}

.modal-body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
}

.modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #3a3a3a;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
```

### 滚动条

```css
.scrollable::-webkit-scrollbar {
    width: 6px;
}

.scrollable::-webkit-scrollbar-track {
    background: transparent;
}

.scrollable::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 3px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
    background: #555555;
}
```

---

## 交互效果

### 过渡动画

```css
/* 标准过渡 */
transition: all 0.15s;        /* 快速交互（按钮、链接） */
transition: all 0.2s;         /* 标准交互（输入框、卡片） */
transition: all 0.2s ease;    /* 平滑交互（对话框） */
transition: all 0.3s;         /* 慢速交互（侧边栏） */

/* 特定属性过渡 */
transition: background 0.2s;
transition: border-color 0.2s;
transition: color 0.15s;
transition: opacity 0.2s;
transition: transform 0.2s;
```

### 悬停效果

```css
/* 按钮悬停 */
.button:hover {
    background: #333333;      /* 背景变亮 */
    border-color: #4a4a4a;    /* 边框变亮 */
    color: #cccccc;           /* 文字变亮 */
}

/* 卡片悬停 */
.card:hover {
    background: #333333;
    border-color: #3a3a3a;
}

/* 图标按钮悬停 */
.icon-button:hover {
    background: #3a3a3a;
    color: #cccccc;
}
```

### 激活状态

```css
.item.active {
    background: #3a3a3a;
    border-color: #4a4a4a;
    color: #ffffff;
}
```

### 焦点状态

```css
.input:focus,
.select:focus,
.textarea:focus {
    border-color: #555555;
    outline: none;
}
```

### 动画效果

```css
/* 淡入动画 */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 脉冲动画 */
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* 使用示例 */
.message {
    animation: slideIn 0.2s ease;
}

.status-dot {
    animation: pulse 2s infinite;
}
```

---

## 图标系统

### SVG 图标规范

```html
<!-- 图标定义 -->
<svg style="display: none;">
    <symbol id="icon-name" viewBox="0 0 24 24">
        <path d="..."/>
    </symbol>
</svg>

<!-- 图标使用 -->
<svg class="icon">
    <use href="#icon-name"></use>
</svg>
```

### 图标尺寸

```css
.icon {
    width: 16px;
    height: 16px;
    fill: currentColor;  /* 继承父元素颜色 */
    flex-shrink: 0;
}

.icon-lg {
    width: 20px;
    height: 20px;
}

.icon-xl {
    width: 24px;
    height: 24px;
}
```

### 图标颜色

图标使用 `fill: currentColor` 继承父元素的文本颜色，确保与文本保持一致。

---

## 响应式设计

### 断点

```css
/* 平板 */
@media (max-width: 1024px) {
    .sidebar { width: 260px; }
    .dialog { width: 360px; }
}

/* 移动端 */
@media (max-width: 768px) {
    .sidebar {
        position: absolute;
        left: -300px;
        transition: left 0.3s;
    }

    .sidebar.mobile-open {
        left: 0;
    }

    .dialog {
        width: calc(100% - 40px);
        max-width: 400px;
    }
}
```

---

## 设计检查清单

在实现新组件时，请确保：

- [ ] 使用正确的深灰色背景层次
- [ ] 文本颜色符合可读性要求
- [ ] 边框使用 `#3a3a3a` 或 `#444444`
- [ ] 圆角使用 3px - 8px
- [ ] 字体大小在 11px - 16px 范围内
- [ ] 间距使用 4px 的倍数
- [ ] 过渡动画时长为 0.15s - 0.3s
- [ ] 悬停状态有明显但不突兀的反馈
- [ ] 图标使用 SVG 并继承颜色
- [ ] 滚动条样式统一
- [ ] 响应式布局适配移动端

---

## 参考文件

- [04-workflow-editor-integrated-ui.html](./04-workflow-editor-integrated-ui.html) - 完整实现示例

---

**最后更新**：2026-01-15
