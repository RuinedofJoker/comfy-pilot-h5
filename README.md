# ComfyUI Pilot H5 前端

ComfyUI 工作流管理和 AI 辅助编辑系统的移动端 H5 应用。

## 功能概述

- **统一管理**: 集中管理多个 ComfyUI 服务实例
- **AI 辅助编辑**: 通过自然语言对话创建和修改工作流
- **Skills 扩展**: 支持可复用的 AI 能力模块

## 快速开始

### 环境要求

- Node.js 16+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env` 文件配置后端 API 地址：

```bash
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:8080
```

### 启动服务

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

应用将在 `http://localhost:5173` 启动。

## 核心配置

### Skills 配置

Skills 配置在后端服务中完成，详见后端 [Skills 快速指南](../comfy-pilot-backend/docs/Skills快速指南.md)。

### ComfyUI 服务配置

启动后通过管理员账号在 Web 界面添加 ComfyUI 服务：
- 配置 ComfyUI 的访问地址（如 `http://localhost:8188`）

高级配置：
- 允许Agent在ComfyUI服务所在机器上执行命令
- **本地服务**: ComfyUI服务在本机上运行，将直接执行本地命令
- **远程服务**: 配置 SSH 连接信息和 ComfyUI 地址

### AI 模型配置

在管理界面配置 AI 模型提供商（可选）：
- OpenAI（GPT-4、GPT-3.5 等）

### 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 通用组件
├── views/         # 页面组件
│   ├── auth/      # 认证相关页面（登录、注册）
│   ├── user/      # 用户功能页面（工作流列表、个人中心）
│   ├── workflow/  # 工作流编辑页面
│   └── admin/     # 管理员页面
├── stores/        # Pinia 状态管理
├── composables/   # 组合式逻辑
├── services/      # API 服务
├── router/        # 路由配置
├── styles/        # 全局样式
├── utils/         # 工具函数
└── types/         # 类型定义
```

### 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件**: Vant 4.x
- **样式**: Tailwind CSS + SCSS
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios

### 编码规范

项目遵循严格的编码规范，详见 `.cursor/rules/` 目录。

## 常见问题

### ComfyUI 服务连接失败
- 确认 ComfyUI 服务已启动
- 如果使用反向代理访问ComfyUI访问，检查是否配置了 WebSocket 的代理
- 对于远程服务，检查 SSH 连接配置

### AI 模型调用失败
- 检查 API Key 是否正确
- 确认网络连接正常
- 查看模型配置是否启用

## 许可证

[GPL-3.0 License](LICENSE)

## 支持

如有问题，请提交 Issue 或联系开发团队。
