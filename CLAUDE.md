# CLAUDE.md

Always respond in Chinese-simplified

## 项目概述

Comfy Pilot H5 是一个基于 Vue 3 + TypeScript + Vite + Vant 的移动端 H5 项目。



## Cursor Rules Specifications Summary

The project maintains comprehensive coding standards and patterns in `.cursor/rules/` directory.In every new conversation, you should read all the rules and then follow them.



## 技术栈

- Vue 3 (Composition API + `<script setup>`)
- TypeScript (严格模式)
- Vite (构建工具)
- Vant 4.x (移动端 UI 组件库)
- Tailwind CSS + SCSS (样式方案)
- Pinia (状态管理)
- Vue Router 4 (路由)
- Axios (HTTP 客户端)

## 编码规范

本项目严格遵循目录 `.cursor/rules/` 中定义的所有编码规范，包括：

- Vue 开发规范 (vue.mdc, vuejs.mdc)
- TypeScript 规范 (typescript.mdc)
- 样式规范 (style.mdc, tailwind.mdc, css.mdc)
- 目录结构规范 (directory.mdc, project-structure.mdc)
- 通用规范 (core.mdc, general.mdc)

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 通用组件（BaseXxx）
├── views/         # 页面级组件
├── stores/        # Pinia stores
├── composables/   # 组合式逻辑（useXxx）
├── services/      # API / Axios 封装
├── router/        # 路由定义
├── styles/        # 全局样式 / 变量
├── utils/         # 工具函数
└── types/         # 全局类型定义
```

## 开发约定

1. **组件命名**: 使用 PascalCase，基础组件使用 `Base` 前缀
2. **样式命名**:
   - `g-` 页面级
   - `m-` 模块级
   - `f-` 功能级
3. **状态管理**: 全局状态使用 Pinia，按业务域拆分 Store
4. **路由懒加载**: 所有页面组件必须使用懒加载
5. **类型安全**: 启用 TypeScript 严格模式，避免使用 `any`

项目后端使用了swagger开放API接口文档，地址`http://localhost:8080/v3/api-docs`，后端id字段使用的是Long类型，后端返回的所有Long类型都会解析成string防止前端溢出

当前阶段为模块实现阶段：
据UI设计图里的页面和需求文档设计指定模块的文档和代码
当前阶段每一步实现都会在当前后端代码仓库根目录下的steps目录下新建一个step[x].md(x为当前该目录下最大的值+1，如之前最大的是step1.md，当前步记录文件为step2.md)
用户会告诉你当前是在第多少步(如当前我们在step1)，当前步结束时用户会告诉你我需要新建一步，这时你需要将当前步的内容记录到当前步文件里，然后新建一个新的步文件开始新的步
新的步创建时需要继承上一步没有做完的事，如果需要新步的大纲也需要在根据老步创建新步时指定到新步文件里
每一步都只需要看上一步做了什么，不需要关注更之前的步

All code must strictly adhere to these patterns and standards for consistency and maintainability.

---

## 前端模块划分

基于 UI 设计图和项目需求，前端模块划分如下：

### 1️⃣ 认证模块 (Auth Module)

**路径**: `src/views/auth/`

**页面组件**:
- `LoginView.vue` - 登录页面
- `RegisterView.vue` - 注册页面
- `ForgotPasswordView.vue` - 忘记密码页面
- `ResetPasswordView.vue` - 重置密码页面

**共享组件**: `src/components/auth/`
- `BaseAuthModal.vue` - 认证模态框基础组件
- `BasePasswordInput.vue` - 密码输入框组件（带显示/隐藏切换）

**Store**: `src/stores/auth.ts`
- 用户登录状态
- Token 管理
- 用户信息缓存

**API**: `src/services/auth.ts`
- `login()` - 登录
- `register()` - 注册
- `forgotPassword()` - 发送重置密码邮件
- `resetPassword()` - 重置密码

---

### 2️⃣ 管理员后台模块 (Admin Module)

**路径**: `src/views/admin/`

**页面组件**:
- `AdminLayout.vue` - 管理后台布局（侧边栏+主内容区）
- `ServiceManagementView.vue` - ComfyUI 服务管理
- `AgentManagementView.vue` - Agent 配置管理
- `ModelManagementView.vue` - 模型管理
- `UserManagementView.vue` - 用户管理（预留）
- `SystemMonitorView.vue` - 系统监控（预留）

**共享组件**: `src/components/admin/`
- `AdminSidebar.vue` - 管理后台侧边栏
- `ServiceCard.vue` - 服务卡片组件
- `AgentTable.vue` - Agent 列表表格
- `ModelProviderCard.vue` - 模型提供商卡片
- `BaseModal.vue` - 通用模态框组件

**Store**: `src/stores/admin.ts`
- 服务列表管理
- Agent 配置管理
- 模型管理

**API**: `src/services/admin.ts`
- 服务 CRUD 操作
- Agent CRUD 操作
- 模型 CRUD 操作

---

### 3️⃣ 用户工作区模块 (User Workspace Module)

**路径**: `src/views/user/`

**页面组件**:
- `ServiceSelectionView.vue` - 服务选择页面
- `WorkflowListView.vue` - 我的工作流列表
- `UserProfileView.vue` - 个人信息页面

**共享组件**: `src/components/user/`
- `TopNavBar.vue` - 顶部导航栏
- `UserMenu.vue` - 用户下拉菜单
- `ServiceCard.vue` - 服务选择卡片
- `WorkflowCard.vue` - 工作流卡片

**Store**: `src/stores/user.ts`
- 用户信息
- 工作流列表
- 服务选择状态

**API**: `src/services/user.ts`
- 获取用户信息
- 更新用户信息
- 获取工作流列表

---

### 4️⃣ 工作流编辑器模块 (Workflow Editor Module)

**路径**: `src/views/workflow/`

**页面组件**:
- `WorkflowEditorView.vue` - 工作流编辑器主页面

**共享组件**: `src/components/workflow/`
- `SessionSidebar.vue` - 左侧会话管理侧边栏
- `SessionList.vue` - 会话列表
- `SessionItem.vue` - 会话项
- `SessionModal.vue` - 新建/编辑会话模态框
- `WorkflowToolbar.vue` - 顶部工具栏
- `WorkflowSelector.vue` - 工作流选择下拉菜单
- `WorkflowStatusIndicator.vue` - 工作流保存状态指示器
- `ComfyUIContainer.vue` - ComfyUI iframe 容器
- `ViewToggle.vue` - 视图切换按钮组
- `JsonViewer.vue` - JSON 视图组件
- `ChatDialog.vue` - 悬浮 Agent 对话框
- `ChatMessage.vue` - 聊天消息组件

**Composables**: `src/composables/workflow/`
- `useWorkflowEditor.ts` - 工作流编辑逻辑
- `useWorkflowLock.ts` - 工作流锁定机制
- `useSessionManagement.ts` - 会话管理逻辑
- `useChatDialog.ts` - 对话框拖拽和状态管理
- `useIframeComm.ts` - iframe 通信机制

**Store**: `src/stores/workflow.ts`
- 当前工作流状态
- 工作流列表
- 会话列表
- 保存状态管理

**API**: `src/services/workflow.ts`
- 工作流 CRUD 操作
- 会话 CRUD 操作
- Agent 对话 API

---

### 5️⃣ 通用基础组件模块 (Base Components)

**路径**: `src/components/base/`

**组件列表**:
- `BaseButton.vue` - 基础按钮
- `BaseInput.vue` - 基础输入框
- `BaseSelect.vue` - 基础下拉选择
- `BaseTextarea.vue` - 基础文本域
- `BaseModal.vue` - 基础模态框
- `BaseCard.vue` - 基础卡片
- `BaseIcon.vue` - SVG 图标组件
- `BaseLoading.vue` - 加载状态组件
- `BaseEmpty.vue` - 空状态组件

---

### 6️⃣ 路由模块 (Router)

**路径**: `src/router/`

**文件结构**:
```
router/
├── index.ts              # 路由主文件
├── routes/
│   ├── auth.ts          # 认证路由
│   ├── admin.ts         # 管理后台路由
│   ├── user.ts          # 用户路由
│   └── workflow.ts      # 工作流路由
└── guards/
    ├── auth.ts          # 认证守卫
    └── permission.ts    # 权限守卫
```

---

### 7️⃣ 状态管理模块 (Stores)

**路径**: `src/stores/`

**Store 列表**:
- `auth.ts` - 认证状态
- `user.ts` - 用户信息
- `admin.ts` - 管理后台状态
- `workflow.ts` - 工作流状态
- `service.ts` - ComfyUI 服务状态
- `agent.ts` - Agent 配置状态

---

### 8️⃣ API 服务模块 (Services)

**路径**: `src/services/`

**文件结构**:
```
services/
├── http.ts              # Axios 实例配置
├── auth.ts              # 认证 API
├── user.ts              # 用户 API
├── admin.ts             # 管理后台 API
├── workflow.ts          # 工作流 API
├── service.ts           # ComfyUI 服务 API
├── agent.ts             # Agent API
└── model.ts             # 模型 API
```

---

### 9️⃣ 工具函数模块 (Utils)

**路径**: `src/utils/`

**文件列表**:
- `storage.ts` - LocalStorage 封装
- `validator.ts` - 表单验证工具
- `format.ts` - 格式化工具（日期、数字等）
- `clipboard.ts` - 剪贴板操作
- `iframe.ts` - iframe 通信工具

---

### 🔟 类型定义模块 (Types)

**路径**: `src/types/`

**文件列表**:
- `auth.ts` - 认证相关类型
- `user.ts` - 用户相关类型
- `workflow.ts` - 工作流相关类型
- `service.ts` - 服务相关类型
- `agent.ts` - Agent 相关类型
- `session.ts` - 会话相关类型
- `api.ts` - API 响应类型

---

## 模块依赖关系图

```
认证模块 (Auth)
    ↓
用户工作区模块 (User Workspace)
    ↓
工作流编辑器模块 (Workflow Editor)
    ↓
通用基础组件 (Base Components)

管理员后台模块 (Admin) ← 独立分支
```

---

## 开发优先级建议

### Phase 1: 基础设施层
- 通用基础组件 (Base Components)
- API 服务模块 (Services)
- 工具函数模块 (Utils)
- 类型定义模块 (Types)
- 路由模块基础结构

### Phase 2: 认证模块
- 登录页面
- 注册页面
- 忘记密码/重置密码页面
- 认证状态管理
- 路由守卫

### Phase 3: 用户工作区模块
- 服务选择页面
- 我的工作流列表页面
- 个人信息页面
- 顶部导航栏组件

### Phase 4: 工作流编辑器核心功能
- 工作流编辑器主页面布局
- ComfyUI iframe 集成
- 工作流工具栏
- 工作流保存/加载功能
- JSON 视图功能

### Phase 5: Agent 对话功能
- 会话管理侧边栏
- 悬浮对话框
- Agent 对话 API 集成
- 工作流锁定机制
- iframe 通信机制

### Phase 6: 管理员后台模块
- 管理后台布局
- 服务管理页面
- Agent 配置管理页面
- 模型管理页面

---

## 模块实现注意事项

### 编码规范遵循
- ✅ **SOLID 原则**: 单一职责、开闭原则、依赖倒置
- ✅ **DRY 原则**: 组件复用、逻辑抽离到 composables
- ✅ **KISS 原则**: 保持代码简洁直观
- ✅ **YAGNI 原则**: 仅实现当前明确所需的功能

### 样式规范
- 使用 Tailwind CSS 处理布局、间距、flex
- 使用 SCSS 处理业务级样式和主题变量
- 样式命名使用 `g-`、`m-`、`f-` 前缀
- 保持 ComfyUI 深色主题风格一致

### 组件设计原则
- 所有页面组件必须使用懒加载
- Props 必须定义明确的 TypeScript 类型
- 复用逻辑必须抽离为 composables
- 避免使用 `any` 类型，优先使用 `unknown` 或泛型

### API 调用规范
- 统一使用 Axios 实例
- 错误处理必须统一封装
- 请求/响应拦截器统一配置
- API 响应类型必须明确定义

---

**说明**: 以上模块划分基于 `docs/uis/` 目录下的 UI 设计图和项目需求分析得出，严格遵循项目编码规范。在实现每个模块时，请参考对应的 UI 设计图文件和 `.cursor/rules/` 中的规范文件。

---

## 后端 API 接口文档

### API 基本信息

- **API 标题**: ComfyUI Pilot API
- **API 版本**: 1.0.0
- **服务器地址**: http://localhost:8080
- **认证方式**: JWT Bearer Token
- **文档地址**: http://localhost:8080/v3/api-docs

### 通用响应格式

```typescript
interface Result<T> {
  code: number        // 状态码
  message: string     // 响应消息
  data: T            // 响应数据
  traceId: string    // 追踪ID
  timestamp: number  // 时间戳
}
```

**注意**: 后端所有 ID 字段使用 Long 类型 (int64)，前端接收时会自动转换为 string 类型防止溢出。

---

### 1️⃣ 认证管理 API

#### 用户登录
- **接口**: `POST /api/v1/auth/login`
- **描述**: 用户邮箱密码登录
- **请求体**: `{ email: string, password: string }`
- **响应**: `{ accessToken: string, refreshToken: string, expiresIn: number, user: UserDTO }`

#### 用户注册
- **接口**: `POST /api/v1/auth/register`
- **描述**: 新用户注册账户
- **请求体**: `{ email: string, username: string, password: string }`
- **响应**: `{ userId: string, email: string }`

#### 用户登出
- **接口**: `POST /api/v1/auth/logout`
- **描述**: 用户登出，撤销当前Token
- **需要认证**: 是

#### 刷新Token
- **接口**: `POST /api/v1/auth/refresh`
- **描述**: 使用刷新令牌获取新的访问令牌
- **请求体**: `{ refreshToken: string }`
- **响应**: `{ accessToken: string, expiresIn: number }`

#### 请求密码重置
- **接口**: `POST /api/v1/auth/forgot-password`
- **描述**: 发送密码重置邮件
- **请求体**: `{ email: string }`

#### 确认密码重置
- **接口**: `POST /api/v1/auth/reset-password`
- **描述**: 使用重置令牌设置新密码
- **请求体**: `{ token: string, newPassword: string }`

---

### 2️⃣ 用户管理 API

#### 获取当前用户信息
- **接口**: `GET /api/v1/users/me`
- **描述**: 获取当前登录用户的详细信息
- **需要认证**: 是
- **响应**: `UserDTO`

#### 更新用户信息
- **接口**: `PUT /api/v1/users/me`
- **描述**: 更新当前用户的基本信息
- **需要认证**: 是
- **请求体**: `{ username?: string, avatarUrl?: string }`
- **响应**: `UserDTO`

---

### 3️⃣ 工作流管理 API

#### 查询工作流列表
- **接口**: `GET /api/v1/workflows`
- **描述**: 查询工作流列表，支持按服务、锁定状态、创建人过滤
- **需要认证**: 是
- **查询参数**: `comfyuiServerId?: string, isLocked?: boolean, createBy?: string`
- **响应**: `WorkflowDTO[]`

#### 创建工作流
- **接口**: `POST /api/v1/workflows`
- **描述**: 创建新的工作流
- **需要认证**: 是
- **请求体**: `{ workflowName: string, description?: string, comfyuiServerId: string, comfyuiServerKey: string }`
- **响应**: `WorkflowDTO`

#### 查询工作流详情
- **接口**: `GET /api/v1/workflows/{id}`
- **描述**: 根据工作流ID查询详细信息
- **需要认证**: 是
- **响应**: `WorkflowDTO`

#### 更新工作流信息
- **接口**: `PUT /api/v1/workflows/{id}`
- **描述**: 更新工作流的基本信息（名称、描述、缩略图）
- **需要认证**: 是
- **请求体**: `{ workflowName?: string, description?: string, thumbnailUrl?: string }`
- **响应**: `WorkflowDTO`

#### 删除工作流
- **接口**: `DELETE /api/v1/workflows/{id}`
- **描述**: 删除指定的工作流
- **需要认证**: 是
- **查询参数**: `messageId: string` (必需) - 消息ID

#### 锁定工作流
- **接口**: `POST /api/v1/workflows/{id}/lock`
- **描述**: 锁定工作流，防止其他消息编辑
- **需要认证**: 是
- **查询参数**: `messageId: string` (必需) - 消息ID
- **响应**: `WorkflowDTO`

#### 解锁工作流
- **接口**: `POST /api/v1/workflows/{id}/unlock`
- **描述**: 解锁工作流，允许其他消息编辑
- **需要认证**: 是
- **查询参数**: `messageId: string` (必需) - 消息ID
- **响应**: `WorkflowDTO`

#### 获取工作流内容
- **接口**: `GET /api/v1/workflows/{id}/content`
- **描述**: 获取工作流的激活内容（JSON格式）
- **需要认证**: 是
- **响应**: `string` (JSON字符串)

#### 保存工作流内容
- **接口**: `POST /api/v1/workflows/{id}/content`
- **描述**: 保存工作流的激活内容（用户手动保存或Ctrl+S）
- **需要认证**: 是
- **查询参数**: `messageId: string` (必需) - 消息ID
- **请求体**: `{ content: string }`
- **响应**: `WorkflowDTO`

---

### 4️⃣ 工作流版本管理 API

#### 查询版本列表
- **接口**: `GET /api/v1/workflows/{workflowId}/versions`
- **描述**: 查询指定工作流的所有版本（按版本号降序）
- **需要认证**: 是
- **响应**: `WorkflowVersionDTO[]`

#### 创建工作流版本
- **接口**: `POST /api/v1/workflows/{workflowId}/versions`
- **描述**: 创建新的工作流版本（Agent对话时调用）
- **需要认证**: 是
- **请求体**: `{ content: string, changeSummary?: string, sessionId?: string }`
- **响应**: `WorkflowVersionDTO`

#### 查询版本详情
- **接口**: `GET /api/v1/workflows/{workflowId}/versions/{versionId}`
- **描述**: 查询指定版本的详细信息
- **需要认证**: 是
- **响应**: `WorkflowVersionDTO`

---

### 5️⃣ 会话管理 API（新增模块）

#### 创建会话
- **接口**: `POST /api/v1/sessions`
- **描述**: 创建一个新的对话会话（返回会话编码）
- **需要认证**: 是
- **请求体**: `{ title?: string }`
- **响应**: `string` (会话编码)

#### 查询用户会话列表
- **接口**: `GET /api/v1/sessions`
- **描述**: 查询当前用户的所有会话
- **需要认证**: 是
- **响应**: `ChatSessionDTO[]`

#### 查询会话详情
- **接口**: `GET /api/v1/sessions/{sessionCode}`
- **描述**: 根据会话编码查询会话详情
- **需要认证**: 是
- **响应**: `ChatSessionDTO`

#### 查询消息历史
- **接口**: `GET /api/v1/sessions/{sessionCode}/messages`
- **描述**: 查询会话的所有消息历史
- **需要认证**: 是
- **响应**: `ChatMessageDTO[]`

#### 归档会话
- **接口**: `POST /api/v1/sessions/{sessionCode}/archive`
- **描述**: 归档指定的会话
- **需要认证**: 是

---

### 6️⃣ Agent 管理 API（新增模块）

#### 获取所有Agent
- **接口**: `GET /api/v1/agents`
- **描述**: 获取系统中所有Agent配置列表
- **需要认证**: 是
- **响应**: `AgentConfigDTO[]`

#### 获取已启用的Agent
- **接口**: `GET /api/v1/agents/enabled`
- **描述**: 获取系统中所有已启用的Agent配置列表，供用户页面使用
- **需要认证**: 是
- **响应**: `AgentConfigDTO[]`

#### 根据ID获取Agent
- **接口**: `GET /api/v1/agents/{id}`
- **描述**: 根据Agent ID获取详细配置信息
- **需要认证**: 是
- **响应**: `AgentConfigDTO`

#### 根据编码获取Agent
- **接口**: `GET /api/v1/agents/code/{agentCode}`
- **描述**: 根据Agent编码获取详细配置信息
- **需要认证**: 是
- **响应**: `AgentConfigDTO`

#### 更新Agent信息
- **接口**: `PUT /api/v1/agents/{id}`
- **描述**: 更新Agent的名称和描述（仅管理员可编辑）
- **需要认证**: 是（需要管理员权限）
- **查询参数**: `name: string, description: string`
- **响应**: `AgentConfigDTO`

#### 启用Agent
- **接口**: `POST /api/v1/agents/{id}/enable`
- **描述**: 启用指定的Agent
- **需要认证**: 是（需要管理员权限）

#### 禁用Agent
- **接口**: `POST /api/v1/agents/{id}/disable`
- **描述**: 禁用指定的Agent
- **需要认证**: 是（需要管理员权限）

#### 执行Agent
- **接口**: `POST /api/v1/agents/{agentCode}/execute`
- **描述**: 执行指定的Agent并返回结果
- **需要认证**: 是
- **请求体**: `{ sessionId?: string, input: string, userId?: string, isStreamable?: boolean }`
- **响应**: `AgentExecutionResponse`

---

### 7️⃣ ComfyUI 服务管理 API

#### 查询服务列表
- **接口**: `GET /api/v1/comfyui-servers`
- **描述**: 查询ComfyUI服务列表,支持按启用状态过滤（管理员使用）
- **需要认证**: 是
- **查询参数**: `isEnabled?: boolean`
- **响应**: `ComfyuiServerDTO[]`

#### 查询已启用的服务列表
- **接口**: `GET /api/v1/comfyui-servers/enabled`
- **描述**: 查询所有已启用的ComfyUI服务列表（前台用户使用）
- **需要认证**: 是
- **查询参数**: 无
- **响应**: `ComfyuiServerDTO[]`

#### 创建ComfyUI服务
- **接口**: `POST /api/v1/comfyui-servers`
- **描述**: 管理员手动创建ComfyUI服务
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ serverKey?: string, serverName: string, description?: string, baseUrl: string, authMode?: string, apiKey?: string, timeoutSeconds?: number, maxRetries?: number, advancedFeaturesEnabled?: boolean, advancedFeatures?: ComfyuiServerAdvancedFeaturesDTO }`
- **响应**: `ComfyuiServerDTO`

#### 查询服务详情
- **接口**: `GET /api/v1/comfyui-servers/{id}`
- **描述**: 根据服务ID查询详细信息
- **需要认证**: 是
- **响应**: `ComfyuiServerDTO`

#### 根据标识符查询服务
- **接口**: `GET /api/v1/comfyui-servers/key/{serverKey}`
- **描述**: 根据服务唯一标识符查询服务信息
- **需要认证**: 是
- **响应**: `ComfyuiServerDTO`

#### 更新服务信息
- **接口**: `PUT /api/v1/comfyui-servers/{id}`
- **描述**: 更新ComfyUI服务信息
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ serverName?: string, description?: string, baseUrl?: string, authMode?: string, apiKey?: string, timeoutSeconds?: number, maxRetries?: number, isEnabled?: boolean, advancedFeaturesEnabled?: boolean, advancedFeatures?: ComfyuiServerAdvancedFeaturesDTO }`
- **响应**: `ComfyuiServerDTO`

#### 删除服务
- **接口**: `DELETE /api/v1/comfyui-servers/{id}`
- **描述**: 删除ComfyUI服务
- **需要认证**: 是（需要管理员权限）

---

### 8️⃣ AI 模型管理 API

#### 查询所有AI模型
- **接口**: `GET /api/v1/models`
- **描述**: 查询系统中所有的AI模型列表
- **需要认证**: 是
- **响应**: `AiModelDTO[]`

#### 创建AI模型
- **接口**: `POST /api/v1/models`
- **描述**: 创建新的AI模型（通过API创建的模型标记为远程API来源）
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ modelName: string, modelIdentifier: string, accessType: string, modelType: string, providerId?: string, modelConfig?: string, description?: string }`
- **响应**: `AiModelDTO`

#### 根据ID查询AI模型
- **接口**: `GET /api/v1/models/{id}`
- **描述**: 根据模型ID查询模型详细信息
- **需要认证**: 是
- **响应**: `AiModelDTO`

#### 更新AI模型
- **接口**: `PUT /api/v1/models/{id}`
- **描述**: 更新AI模型信息（代码预定义的模型只能更新基本信息）
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ modelName?: string, modelConfig?: string, description?: string }`
- **响应**: `AiModelDTO`

#### 删除AI模型
- **接口**: `DELETE /api/v1/models/{id}`
- **描述**: 删除AI模型（只能删除远程API创建的模型）
- **需要认证**: 是（需要管理员权限）

#### 启用AI模型
- **接口**: `POST /api/v1/models/{id}/enable`
- **描述**: 启用指定的AI模型
- **需要认证**: 是（需要管理员权限）

#### 禁用AI模型
- **接口**: `POST /api/v1/models/{id}/disable`
- **描述**: 禁用指定的AI模型
- **需要认证**: 是（需要管理员权限）

---

### 9️⃣ 模型提供商管理 API

#### 查询所有提供商
- **接口**: `GET /api/v1/model-providers`
- **描述**: 查询系统中所有的模型提供商列表
- **需要认证**: 是
- **响应**: `ModelProviderDTO[]`

#### 创建模型提供商
- **接口**: `POST /api/v1/model-providers`
- **描述**: 创建新的模型提供商
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ providerName: string, providerType: string, apiBaseUrl?: string, description?: string }`
- **响应**: `ModelProviderDTO`

#### 根据ID查询提供商
- **接口**: `GET /api/v1/model-providers/{id}`
- **描述**: 根据提供商ID查询详细信息
- **需要认证**: 是
- **响应**: `ModelProviderDTO`

#### 更新提供商
- **接口**: `PUT /api/v1/model-providers/{id}`
- **描述**: 更新模型提供商信息
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ providerName?: string, apiBaseUrl?: string, description?: string }`
- **响应**: `ModelProviderDTO`

#### 删除提供商
- **接口**: `DELETE /api/v1/model-providers/{id}`
- **描述**: 删除模型提供商
- **需要认证**: 是（需要管理员权限）

---

### 🔟 模型 API 密钥管理 API

#### 创建API密钥
- **接口**: `POST /api/v1/model-api-keys`
- **描述**: 为指定提供商创建新的API密钥
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ providerId: string, keyName: string, apiKey: string }`
- **响应**: `ModelApiKeyDTO`

#### 查询提供商的所有密钥
- **接口**: `GET /api/v1/model-api-keys/provider/{providerId}`
- **描述**: 查询指定提供商的所有API密钥
- **需要认证**: 是
- **响应**: `ModelApiKeyDTO[]`

#### 根据ID查询API密钥
- **接口**: `GET /api/v1/model-api-keys/{id}`
- **描述**: 根据密钥ID查询详细信息
- **需要认证**: 是
- **响应**: `ModelApiKeyDTO`

#### 更新API密钥
- **接口**: `PUT /api/v1/model-api-keys/{id}`
- **描述**: 更新API密钥信息
- **需要认证**: 是（需要管理员权限）
- **请求体**: `{ keyName?: string }`
- **响应**: `ModelApiKeyDTO`

#### 删除API密钥
- **接口**: `DELETE /api/v1/model-api-keys/{id}`
- **描述**: 删除指定的API密钥
- **需要认证**: 是（需要管理员权限）

---

### 1️⃣1️⃣ 文件资源管理 API

#### 上传单个文件
- **接口**: `POST /api/v1/files/upload`
- **描述**: 上传单个文件到服务器，支持关联业务类型和业务ID
- **需要认证**: 是
- **请求**: `multipart/form-data`
- **查询参数**: `businessType?: string, businessId?: string`
- **响应**: `FileResourceDTO`

#### 批量上传文件
- **接口**: `POST /api/v1/files/upload/batch`
- **描述**: 批量上传多个文件到服务器
- **需要认证**: 是
- **请求**: `multipart/form-data`
- **查询参数**: `businessType?: string, businessId?: string`
- **响应**: `FileResourceDTO[]`

#### 下载文件
- **接口**: `GET /api/v1/files/download/{fileId}`
- **描述**: 根据文件ID下载文件
- **需要认证**: 是
- **响应**: 文件流

#### 查询用户文件列表
- **接口**: `GET /api/v1/files/user`
- **描述**: 获取当前用户上传的所有文件列表
- **需要认证**: 是
- **响应**: `FileResourceDTO[]`

#### 查询业务关联文件
- **接口**: `GET /api/v1/files/business`
- **描述**: 根据业务类型和业务ID查询关联的文件列表
- **需要认证**: 是
- **查询参数**: `businessType: string, businessId: string`
- **响应**: `FileResourceDTO[]`

#### 删除文件
- **接口**: `DELETE /api/v1/files/{fileId}`
- **描述**: 根据文件ID删除文件（逻辑删除）
- **需要认证**: 是

---

### 1️⃣2️⃣ 权限管理 API

#### 获取当前用户角色
- **接口**: `GET /api/v1/permissions/my-roles`
- **描述**: 获取当前登录用户的所有角色
- **需要认证**: 是
- **响应**: `RoleDTO[]`

#### 获取当前用户权限
- **接口**: `GET /api/v1/permissions/my-permissions`
- **描述**: 获取当前登录用户的所有权限
- **需要认证**: 是
- **响应**: `string[]` (权限代码列表)

---

## 数据模型定义

### UserDTO
```typescript
{
  id: string
  createTime: string
  updateTime: string
  email: string
  username: string
  avatarUrl?: string
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'DELETED'
  lastLoginTime?: string
}
```

### WorkflowDTO
```typescript
{
  id: string
  createTime: string
  updateTime: string
  workflowName: string
  description?: string
  comfyuiServerId: string
  comfyuiServerKey: string
  activeContent?: string        // JSON格式
  activeContentHash?: string
  thumbnailUrl?: string
  lockedByMessageId?: string    // 锁定消息ID（在哪个消息里被锁定）
  lockedAt?: string
}
```

### ComfyuiServerDTO
```typescript
{
  id: string
  createTime: string
  updateTime: string
  serverKey: string
  serverName: string
  description?: string
  baseUrl: string
  authMode?: string
  apiKey?: string
  timeoutSeconds: number
  maxRetries: number
  isEnabled: boolean
  lastHealthCheckTime?: string
  healthStatus: 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN'
  advancedFeaturesEnabled: boolean
  advancedFeatures?: ComfyuiServerAdvancedFeaturesDTO
}
```

### AiModelDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  modelName: string
  modelIdentifier: string
  accessType: string           // remote_api/local
  modelType: string            // llm/embedding等
  modelSource: string          // remote_api/code_defined
  providerId?: string
  modelConfig?: string         // JSON格式
  description?: string
  isEnabled: boolean
}
```

### ModelProviderDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  providerName: string
  providerType: string
  apiBaseUrl?: string
  apiKey?: string             // API密钥
  description?: string
  isEnabled: boolean
}
```

### ModelApiKeyDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  providerId: string
  keyName: string
  apiKey: string              // 脱敏显示
  isEnabled: boolean
}
```

### WorkflowVersionDTO
```typescript
{
  id: string
  createTime: string
  updateTime: string
  workflowId: string
  versionNumber: number
  content: string             // JSON格式
  contentHash: string
  changeSummary?: string
  sessionId?: string
}
```

### FileResourceDTO
```typescript
{
  id: string
  createTime: string
  updateTime: string
  fileName: string
  storedName: string
  fileSize: number
  fileType: string
  fileExtension: string
  businessType?: string
  businessId?: string
  downloadCount: number
}
```

### RoleDTO
```typescript
{
  roleCode: string
  roleName: string
}
```

### ChatSessionDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  sessionCode: string
  userId: string
  agentId: string
  title?: string
  status: 'ACTIVE' | 'ARCHIVED'
}
```

### ChatMessageDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  sessionId: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  metadata?: Record<string, any>
}
```

### AgentConfigDTO（新增）
```typescript
{
  id: string
  createTime: string
  updateTime: string
  agentCode: string
  agentName: string
  description?: string
  version: string
  agentScopeConfig?: Record<string, any>
  config?: Record<string, any>
  status: string
}
```

### AgentExecutionResponse（新增）
```typescript
{
  logId: string
  output: string
  status: string
  errorMessage?: string
  executionTimeMs: number
  executionStartMs: number
}
```

### ComfyuiServerAdvancedFeaturesDTO（新增）
```typescript
{
  connectionType: string           // 连接方式类型（LOCAL/SSH）
  sshConfig?: SshConnectionConfigDTO
  osType?: string                  // 服务器操作系统类型
  workingDirectory?: string        // 工作目录路径
  environmentInitScript?: string   // 环境初始化脚本
  pythonCommand?: string           // Python命令路径
  directoryConfig?: ComfyuiDirectoryConfigDTO
  lastConnectionTestTime?: string  // 最后连接测试时间
  connectionStatus?: string        // 连接状态
}
```

### SshConnectionConfigDTO（新增）
```typescript
{
  enabled: boolean                 // 是否启用SSH连接
  host?: string                    // SSH主机地址
  port?: number                    // SSH端口
  username?: string                // SSH用户名
  authType?: string                // SSH认证方式（PASSWORD/KEY）
  password?: string                // SSH密码（加密存储）
  privateKeyPath?: string          // SSH私钥路径
}
```

### ComfyuiDirectoryConfigDTO（新增）
```typescript
{
  comfyuiInstallPath?: string      // ComfyUI安装目录路径
  baseDirectory?: string           // 基础目录路径（--base-directory）
  outputDirectory?: string         // 输出目录路径（--output-directory）
  tempDirectory?: string           // 临时目录路径（--temp-directory）
  inputDirectory?: string          // 输入目录路径（--input-directory）
  userDirectory?: string           // 用户目录路径（--user-directory）
  frontEndRoot?: string            // 前端根目录路径（--front-end-root）
  extraModelPathsConfig?: string   // 额外模型路径配置文件列表
}
```

---

**更新日期**: 2026-01-18
**API 版本**: 1.0.0
**新增模块**: 会话管理、Agent管理、AI模型管理、模型提供商管理、模型API密钥管理
**重要变更**:
- 工作流锁定机制改为基于消息ID（`lockedByMessageId`）
- 工作流操作（锁定/解锁/保存/删除）需要传递 `messageId` 参数
- ComfyUI服务新增高级功能配置支持（SSH连接、目录配置等）
- ComfyUI服务移除 `sourceType` 字段，新增 `advancedFeaturesEnabled` 和 `advancedFeatures` 字段
- 模型提供商新增 `apiKey` 字段
