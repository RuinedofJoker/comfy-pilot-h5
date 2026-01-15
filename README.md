# Comfy Pilot H5

基于 Vue 3 + TypeScript + Vite + Vant 的移动端 H5 项目模板

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Vant 4.x (移动端)
- **样式方案**: Tailwind CSS + SCSS
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **代码规范**: ESLint + Prettier

## 项目结构

```
src/
├── assets/        # 静态资源
├── components/    # 通用组件
├── views/         # 页面级组件
├── stores/        # Pinia stores
├── composables/   # 组合式逻辑（useXxx）
├── services/      # API / Axios 封装
├── router/        # 路由定义
├── styles/        # 全局样式 / 变量
├── utils/         # 工具函数
└── types/         # 全局类型定义
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint

# 代码格式化
npm run format
```

## 开发规范

项目遵循严格的编码规范，详见 `.cursor/rules/` 目录下的规则文件。
