# ComfyUI Agent 代理系统 - 原型设计文档

## 📋 系统概述

本系统作为 ComfyUI 的代理层，统一管理多个 ComfyUI 服务实例，为用户提供增强的 AI Agent 辅助功能。

## 🎯 核心设计理念

### 1. 多对多关系模型

```
ComfyUI 服务 ←→ 工作流 ←→ Chat Agent Session
     (M)           (M)            (M)
```

- **ComfyUI 服务**：可以有多个工作流
- **工作流**：可以在多个 ComfyUI 服务上运行，可以有多个 Chat Session
- **Chat Agent Session**：可以关联多个工作流

### 2. 用户角色设计

#### 管理员用户
- 管理 ComfyUI 服务实例（增删改查）
- 查看服务状态和监控
- 管理用户权限

#### 普通用户
- 选择可用的 ComfyUI 服务
- 创建和编辑工作流
- 使用 AI Agent 辅助功能
- 管理自己的 Chat Session

### 3. 技术架构

#### 前端架构
```
┌─────────────────────────────────────────┐
│         用户界面层                        │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ 登录页面  │  │ 服务选择  │  │ 管理后台│ │
│  └──────────┘  └──────────┘  └────────┘ │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         工作流编辑层                      │
│  ┌──────────────────────────────────┐   │
│  │  Session 管理 │ ComfyUI iframe   │   │
│  │  (左侧边栏)   │  (中间主区域)     │   │
│  │               │                  │   │
│  │               │  ┌─────────────┐ │   │
│  │               │  │ 悬浮聊天框   │ │   │
│  │               │  │ (可调整)     │ │   │
│  │               │  └─────────────┘ │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         通信层                           │
│  ┌──────────┐  ┌──────────┐            │
│  │ postMessage│  │ WebSocket│            │
│  │ (iframe)  │  │ (Agent)  │            │
│  └──────────┘  └──────────┘            │
└─────────────────────────────────────────┘
```

#### iframe 通信机制
```javascript
// 父页面 → ComfyUI iframe
window.frames['comfyui'].postMessage({
  type: 'LOCK_WORKFLOW',
  payload: { reason: 'Agent editing' }
}, '*');

// ComfyUI iframe → 父页面
window.parent.postMessage({
  type: 'WORKFLOW_CHANGED',
  payload: { workflow: {...} }
}, '*');
```

## 📄 原型页面列表

### 1. `01-login.html` - 用户登录页面
**功能**:
- 用户名/密码登录
- 角色识别（管理员/普通用户）
- 基于角色自动跳转
  - 普通用户 → `03-user-service-selection.html`
  - 管理员 → `02-admin-dashboard.html`

**测试账号**:
- 普通用户: `user` / `password`
- 管理员: `admin` / `admin123`

---

### 2. `02-admin-service-management.html` - 管理员服务管理
**功能**:
- ComfyUI 服务列表展示
- 添加/编辑/删除服务
- 服务状态实时监控
- 连接测试功能
- 用户管理
- 系统统计数据

---

### 3. `03-user-service-selection.html` - 用户首页(服务选择)
**功能**:
- 显示所有可用的 ComfyUI 服务
- 服务状态实时监控(在线/离线)
- 服务统计信息(工作流数、会话数)
- 最近使用的服务快速访问

**新增功能**:
- 顶部导航栏
  - Logo (🤖 ComfyUI Agent)
  - "我的工作流"入口按钮
  - 用户头像下拉菜单
- 用户下拉菜单包含:
  - 用户基本信息显示
  - 个人信息链接
  - 我的工作流链接
  - 账号设置
  - 退出登录

**关键代码**:
```javascript
function toggleUserMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.toggle('active');
}

function goToWorkflows() {
    window.location.href = '03-1-user-workflows.html';
}

function goToProfile() {
    window.location.href = '03-2-user-profile.html';
}
```

---

### 4. `03-1-user-workflows.html` - 我的工作流 (新增)
**功能**:
- 展示用户所有工作流
- 网格/列表视图切换
- 搜索功能
- 筛选功能:
  - 全部工作流
  - 最近使用
  - 收藏的工作流
- 排序选项:
  - 最近使用
  - 名称
  - 创建时间
  - 修改时间

**工作流卡片信息**:
- 工作流名称和图标
- 所属 ComfyUI 服务
- 描述信息
- 会话数和版本数
- 最后使用时间
- 收藏状态(可切换)
- 快捷操作(编辑/删除)

**点击工作流行为**:
- 自动进入该工作流最后使用的 ComfyUI 服务
- 默认打开该工作流

**关键代码**:
```javascript
function openWorkflow(workflowId, serviceId) {
    // 自动进入对应服务并打开工作流
    alert(`打开工作流 #${workflowId}\n自动进入服务 #${serviceId}`);
    window.location.href = '04-workflow-editor-integrated.html';
}

function toggleFavorite(event, workflowId) {
    event.stopPropagation();
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
        workflow.favorite = !workflow.favorite;
        renderWorkflows();
    }
}
```

---

### 5. `03-2-user-profile.html` - 个人信息页 (新增)
**功能**:
- 个人信息展示和编辑
  - 头像上传/更换
  - 显示名称
  - 邮箱地址
  - 手机号码
  - 注册时间(只读)
- 用户统计数据:
  - 工作流总数
  - 活跃会话数
  - 工作流版本数
  - 使用天数
- 账号安全:
  - 修改密码功能
  - 当前密码验证
  - 新密码确认
- 危险操作:
  - 删除账号(二次确认)

**关键特性**:
- 表单验证
- 实时保存提示
- 危险操作保护机制

---

---

### 5. `02-admin-agent-management.html` - Agent配置管理 (新增)
**功能**:
- Agent配置列表展示
- 新建/编辑/删除Agent配置
- Agent类型管理:
  - 工作流编辑 (WORKFLOW_EDITOR)
  - 工作流分析 (WORKFLOW_ANALYZER)
  - 通用助手 (GENERAL_ASSISTANT)
- Agent参数配置:
  - 关联AI模型
  - 系统提示词
  - 温度参数 (Temperature)
  - 最大Token数
  - 工具配置 (JSON)
- 统计数据展示:
  - 总Agent数
  - 今日调用次数
  - 平均响应时间
  - 成功率
- 搜索和筛选功能

**关键特性**:
- 基于后端需求文档的Agent模块设计
- 支持多种Agent类型配置
- 完整的表单验证
- 实时状态监控

---

### 6. `02-admin-model-management.html` - AI模型管理 (新增)
**功能**:
- Tab导航切换:
  - 模型提供商管理
  - AI模型列表
  - 调用记录
- 模型提供商管理:
  - 提供商卡片展示 (OpenAI, Anthropic, 智谱AI, 通义千问, DeepSeek等)
  - 提供商状态监控
  - 连接测试功能
  - 模型数量和调用统计
- AI模型管理:
  - 模型列表展示
  - 模型类型 (LLM, EMBEDDING, RERANK)
  - 价格配置 (输入/输出价格)
  - 最大Token数配置
  - 流式输出和工具调用支持
- 统计数据:
  - 提供商总数
  - 模型总数
  - 今日调用次数
  - 今日费用统计

**关键特性**:
- 基于后端需求文档的AI模型模块设计
- 多提供商统一管理
- 费用统计和监控
- 完整的模型配置管理

---

### 8. `04-workflow-editor-integrated.html` - 工作流编辑器(核心页面)
**布局结构**:
```
┌─────────────────────────────────────────────────────────┐
│  [🤖] [工作流选择器▼] [服务状态] [保存] [导出]  [状态]  │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│  会话    │                                              │
│  列表    │         ComfyUI iframe 区域                  │
│          │                                              │
│  [新建]  │                                              │
│          │                                              │
│  [返回]  │                                              │
└──────────┴──────────────────────────────────────────────┘
                                    ┌──────────────┐
                                    │  悬浮对话框  │
                                    │              │
                                    │  [最小化][×] │
                                    └──────────────┘
```

**核心功能**:

#### 顶部工具栏 (新增/增强)
- **Logo 按钮**: 点击返回用户首页
  - 有未保存修改时弹出确认对话框
  - 提供保存选项
- **工作流选择器**: 下拉菜单显示当前服务的所有工作流
  - 显示工作流名称
  - 显示会话数和最后使用时间
  - 切换工作流时检查未保存修改
  - 动态渲染工作流列表
- **服务指示器**: 显示当前连接的 ComfyUI 服务
- **保存按钮**: 保存工作流修改(Ctrl+S)
  - 检测未保存状态
  - 快捷键支持
- **导出按钮**: 导出工作流文件
- **状态指示器**: 显示编辑器状态
  - 就绪状态(绿色)
  - Agent 编辑中(红色脉冲)

#### 左侧会话列表
- 显示当前工作流的所有 Agent 会话
- 会话信息:
  - 会话状态(进行中/已完成)
  - 会话标题
  - 关联的工作流名称
  - 最后操作摘要
  - 时间戳
- 点击会话:
  - 打开悬浮对话框
  - 加载该会话的历史消息
  - 加载该会话对应的工作流版本快照
  - 切换会话时检查未保存修改
- 新建会话按钮
- 返回服务选择按钮

#### 主编辑区域
- 嵌入 ComfyUI 原生界面(iframe)
- 工作流锁定机制:
  - Agent 编辑时自动锁定界面
  - 显示锁定遮罩和提示信息
  - 编辑完成后自动解锁
  - 防止用户和 Agent 同时编辑冲突
- 未保存修改提示:
  - 实时检测工作流变化
  - 顶部显示"有未保存的修改"警告
  - 切换工作流/返回首页时提示保存
  - 保存状态实时更新

#### 悬浮 Agent 对话框
- 可拖动定位
- 可调整大小(resize)
- 最小化/还原功能
- 关闭按钮
- 消息历史显示
- 输入框和发送按钮
- 工作流操作提示卡片
- 滚动到最新消息

**关键代码示例**:
```javascript
// 工作流选择器
function selectWorkflow(workflowId) {
    if (hasUnsavedChanges) {
        if (!confirm('⚠️ 有未保存的修改\n\n切换工作流将丢失未保存的修改\n\n确定要切换吗？')) {
            return;
        }
    }
    currentWorkflowId = workflowId;
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
        currentWorkflowName = workflow.name;
        document.querySelector('.workflow-select-btn span:first-child').textContent = `📁 ${workflow.name}`;
        hasUnsavedChanges = false;
        updateWorkflowStatus();
        renderWorkflowDropdown();
    }
    toggleWorkflowDropdown();
}

// Logo 返回首页
function goHome() {
    if (hasUnsavedChanges) {
        if (!confirm('⚠️ 有未保存的修改\n\n返回首页将丢失未保存的修改\n\n确定要返回吗？')) {
            return;
        }
    }
    window.location.href = '03-user-service-selection.html';
}

// 工作流锁定/解锁
function lockWorkflow() {
    isWorkflowLocked = true;
    document.getElementById('comfyuiContainer').classList.add('locked');
    document.getElementById('statusText').textContent = 'Agent 编辑中';
}

function unlockWorkflow() {
    isWorkflowLocked = false;
    document.getElementById('comfyuiContainer').classList.remove('locked');
    document.getElementById('statusText').textContent = '就绪';
}
```

## 🔄 用户流程

### 管理员流程
```
登录 → 管理后台 → 服务管理 → 添加/编辑服务 → 保存
                ↓
              监控服务状态
```

### 普通用户流程

#### 流程 1: 新用户首次使用
```
登录页 → 服务选择页 → 选择服务 → 工作流编辑器(默认会创建一个新的未保存工作流，默认名字Unsaved Workflow[有别的这个名字的工作流这里保存名字后面带(1/2)数字] → 与 Agent 对话 → 保存工作流(需要手动给工作流命名)
```

#### 流程 2: 查看和管理工作流
```
服务选择页 → 点击"我的工作流" → 工作流列表页
                                    ↓
                            [搜索/筛选/排序工作流]
                                    ↓
                            点击工作流卡片
                                    ↓
                    自动进入该工作流最后使用的服务
                                    ↓
                            工作流编辑器(已加载工作流)
```

#### 流程 3: 编辑现有工作流

```
在一个已经加载的工作流编辑器 → 发生改变时上面提示有未保存的修改 → 用户点保存按钮或ctrl + s保存工作流当前状态到当前工作流激活态版本 → 有未保存的修改提示变成已保存
```

#### 流程 4: 切换现有工作流

```
工作流编辑器 → 选择工作流(下拉菜单) → 编辑工作流
                                        ↓
                                如果这里有未保存修改弹窗提示弹窗
                                        ↓
                                     点击保存或不保存直接切换
                                        ↓
                                    保存成功
                                        ↓
                                    左边的chat session切换到对应工作流的历史session
```

#### 流程 5: 使用 Agent 辅助编辑
```
工作流编辑器 → 点击会话/新建会话 → 悬浮对话框打开
                                        ↓
                                输入需求对话
                                        ↓
                                Agent 理解需求
                                        ↓
                            工作流自动锁定(防止冲突)
                                        ↓
                            Agent 自动编辑工作流
                                        ↓
                            工作流自动解锁
                                        ↓
                            标记为"有未保存的修改"
                                        ↓
                                用户保存工作流
```

#### 流程 5: 会话管理
```
工作流编辑器 → 左侧会话列表 → 点击历史会话
                                    ↓
                            加载该会话的消息历史
                                    ↓
                            加载该会话对应的工作流版本快照
                                    ↓
                            继续对话或查看历史
                                    ↓
                            [可选] 保存为新版本
```

#### 流程 6: 个人信息管理
```
任意页面 → 点击用户头像 → 下拉菜单
                            ↓
                    选择"个人信息"
                            ↓
                    个人信息页面
                            ↓
            [编辑信息/修改密码/查看统计]
                            ↓
                        保存修改
```
