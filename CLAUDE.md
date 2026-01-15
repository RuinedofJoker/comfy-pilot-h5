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



All code must strictly adhere to these patterns and standards for consistency and maintainability.
