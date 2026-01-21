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

All code must strictly adhere to these patterns and standards for consistency and maintainability.

---

注意：以下的代码有很多都是之前的旧设计，可能在当前代码里已经发生改变但没有同步，以下内容仅供参考。对某个模块的代码进行修改时必须要阅读完这个模块当前的代码再做决定

## 前端模块划分

基于 UI 设计图和项目需求，前端模块划分如下：

### 1️⃣ 认证模块 (Auth Module)

**路径**: `src/views/auth/`

**页面组件**

**共享组件**: `src/components/auth/`

**Store**: `src/stores/auth.ts`

**API**: `src/services/auth.ts`

---

### 2️⃣ 管理员后台模块 (Admin Module)

**路径**: `src/views/admin/`

**页面组件**

**共享组件**: `src/components/admin/`

**Store**: `src/stores/admin.ts`

**API**: `src/services/admin.ts`

---

### 3️⃣ 用户工作区模块 (User Workspace Module)

**路径**: `src/views/user/`

**页面组件**

**共享组件**: `src/components/user/`

**Store**: `src/stores/user.ts`

**API**: `src/services/user.ts`

---

### 4️⃣ 工作流编辑器模块 (Workflow Editor Module)

**路径**: `src/views/workflow/`

**页面组件**

**共享组件**: `src/components/workflow/`

**Composables**: `src/composables/workflow/`

**Store**: `src/stores/workflow.ts`

**API**: `src/services/workflow.ts`


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
