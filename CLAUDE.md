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

项目后端使用了swagger开放API接口文档，地址`http://localhost:8080/v3/api-docs`，后端id字段使用的是Long类型，后端返回的所有Long类型都会解析成string防止前端溢出，内容：
```json
{"openapi":"3.0.1","info":{"title":"ComfyUI Pilot API","description":"ComfyUI Pilot 后端API文档","contact":{"name":"ComfyUI Pilot Team","email":"support@comfypilot.com"},"license":{"name":"Apache 2.0","url":"https://www.apache.org/licenses/LICENSE-2.0.html"},"version":"1.0.0"},"servers":[{"url":"http://localhost:8080","description":"Generated server url"}],"security":[{"bearer-jwt":[]}],"tags":[{"name":"认证管理","description":"用户认证相关接口"},{"name":"ComfyUI服务管理","description":"ComfyUI服务配置、查询、管理相关接口"},{"name":"用户管理","description":"用户信息管理接口"},{"name":"文件资源","description":"文件上传、下载、管理相关接口"},{"name":"工作流管理","description":"工作流创建、查询、编辑、锁定相关接口"},{"name":"权限管理","description":"权限相关接口"},{"name":"工作流版本管理","description":"工作流版本创建、查询相关接口"}],"paths":{"/api/v1/workflows/{id}":{"get":{"tags":["工作流管理"],"summary":"查询工作流详情","description":"根据工作流ID查询详细信息","operationId":"getWorkflowById","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}},"put":{"tags":["工作流管理"],"summary":"更新工作流信息","description":"更新工作流的基本信息（名称、描述、缩略图）","operationId":"updateWorkflow","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/UpdateWorkflowRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}},"delete":{"tags":["工作流管理"],"summary":"删除工作流","description":"删除指定的工作流","operationId":"deleteWorkflow","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}},"/api/v1/users/me":{"get":{"tags":["用户管理"],"summary":"获取当前用户信息","description":"获取当前登录用户的详细信息","operationId":"getCurrentUser","responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultUserDTO"}}}}}},"put":{"tags":["用户管理"],"summary":"更新用户信息","description":"更新当前用户的基本信息（用户名、头像等）","operationId":"updateUser","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/UpdateUserRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultUserDTO"}}}}}}},"/api/v1/comfyui-servers/{id}":{"get":{"tags":["ComfyUI服务管理"],"summary":"查询服务详情","description":"根据服务ID查询详细信息","operationId":"getServerById","parameters":[{"name":"id","in":"path","description":"服务ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultComfyuiServerDTO"}}}}}},"put":{"tags":["ComfyUI服务管理"],"summary":"更新服务信息","description":"更新ComfyUI服务信息，权限根据来源类型自动控制","operationId":"updateServer","parameters":[{"name":"id","in":"path","description":"服务ID","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/UpdateServerRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultComfyuiServerDTO"}}}}}},"delete":{"tags":["ComfyUI服务管理"],"summary":"删除服务","description":"删除ComfyUI服务（代码注册的服务不允许删除）","operationId":"deleteServer","parameters":[{"name":"id","in":"path","description":"服务ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}},"/api/v1/workflows":{"get":{"tags":["工作流管理"],"summary":"查询工作流列表","description":"查询工作流列表，支持按ComfyUI服务、锁定状态、创建人过滤","operationId":"listWorkflows","parameters":[{"name":"comfyuiServerId","in":"query","description":"ComfyUI服务ID","required":false,"schema":{"type":"integer","format":"int64"}},{"name":"isLocked","in":"query","description":"是否锁定","required":false,"schema":{"type":"boolean"}},{"name":"createBy","in":"query","description":"创建人ID","required":false,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListWorkflowDTO"}}}}}},"post":{"tags":["工作流管理"],"summary":"创建工作流","description":"创建新的工作流","operationId":"createWorkflow","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateWorkflowRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}}},"/api/v1/workflows/{workflowId}/versions":{"get":{"tags":["工作流版本管理"],"summary":"查询版本列表","description":"查询指定工作流的所有版本（按版本号降序）","operationId":"listVersions","parameters":[{"name":"workflowId","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListWorkflowVersionDTO"}}}}}},"post":{"tags":["工作流版本管理"],"summary":"创建工作流版本","description":"创建新的工作流版本（Agent对话时调用）","operationId":"createVersion","parameters":[{"name":"workflowId","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateVersionRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowVersionDTO"}}}}}}},"/api/v1/workflows/{id}/unlock":{"post":{"tags":["工作流管理"],"summary":"解锁工作流","description":"解锁工作流，允许其他用户编辑","operationId":"unlockWorkflow","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}}},"/api/v1/workflows/{id}/lock":{"post":{"tags":["工作流管理"],"summary":"锁定工作流","description":"锁定工作流，防止其他用户编辑","operationId":"lockWorkflow","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}}},"/api/v1/workflows/{id}/content":{"get":{"tags":["工作流管理"],"summary":"获取工作流内容","description":"获取工作流的激活内容（JSON格式）","operationId":"getContent","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultString"}}}}}},"post":{"tags":["工作流管理"],"summary":"保存工作流内容","description":"保存工作流的激活内容（用户手动保存或Ctrl+S）","operationId":"saveContent","parameters":[{"name":"id","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/SaveWorkflowContentRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowDTO"}}}}}}},"/api/v1/files/upload":{"post":{"tags":["文件资源"],"summary":"上传单个文件","description":"上传单个文件到服务器，支持关联业务类型和业务ID","operationId":"uploadFile","parameters":[{"name":"businessType","in":"query","description":"业务类型","required":false,"schema":{"type":"string"}},{"name":"businessId","in":"query","description":"业务ID","required":false,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"required":["file"],"type":"object","properties":{"file":{"type":"string","description":"上传的文件","format":"binary"}}}}}},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultFileResourceDTO"}}}}}}},"/api/v1/files/upload/batch":{"post":{"tags":["文件资源"],"summary":"批量上传文件","description":"批量上传多个文件到服务器","operationId":"uploadFiles","parameters":[{"name":"files","in":"query","description":"上传的文件列表","required":true,"schema":{"type":"array","items":{"type":"string","format":"binary"}}},{"name":"businessType","in":"query","description":"业务类型","required":false,"schema":{"type":"string"}},{"name":"businessId","in":"query","description":"业务ID","required":false,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListFileResourceDTO"}}}}}}},"/api/v1/comfyui-servers":{"get":{"tags":["ComfyUI服务管理"],"summary":"查询服务列表","description":"查询ComfyUI服务列表，支持按来源类型和启用状态过滤","operationId":"listServers","parameters":[{"name":"sourceType","in":"query","description":"来源类型：MANUAL/CODE_BASED","required":false,"schema":{"type":"string","enum":["MANUAL","CODE_BASED"]}},{"name":"isEnabled","in":"query","description":"是否启用","required":false,"schema":{"type":"boolean"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListComfyuiServerDTO"}}}}}},"post":{"tags":["ComfyUI服务管理"],"summary":"创建ComfyUI服务","description":"管理员手动创建ComfyUI服务","operationId":"createServer","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/CreateServerRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultComfyuiServerDTO"}}}}}}},"/api/v1/auth/reset-password":{"post":{"tags":["认证管理"],"summary":"确认密码重置","description":"使用重置令牌设置新密码","operationId":"resetPassword","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/ResetPasswordRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}},"/api/v1/auth/register":{"post":{"tags":["认证管理"],"summary":"用户注册","description":"新用户注册账户","operationId":"register","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RegisterRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultRegisterResponse"}}}}}}},"/api/v1/auth/refresh":{"post":{"tags":["认证管理"],"summary":"刷新Token","description":"使用刷新令牌获取新的访问令牌","operationId":"refreshToken","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RefreshTokenRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultRefreshTokenResponse"}}}}}}},"/api/v1/auth/logout":{"post":{"tags":["认证管理"],"summary":"用户登出","description":"用户登出，撤销当前Token","operationId":"logout","responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}},"/api/v1/auth/login":{"post":{"tags":["认证管理"],"summary":"用户登录","description":"用户邮箱密码登录","operationId":"login","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/LoginRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultLoginResponse"}}}}}}},"/api/v1/auth/forgot-password":{"post":{"tags":["认证管理"],"summary":"请求密码重置","description":"发送密码重置邮件","operationId":"forgotPassword","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/ForgotPasswordRequest"}}},"required":true},"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}},"/api/v1/workflows/{workflowId}/versions/{versionId}":{"get":{"tags":["工作流版本管理"],"summary":"查询版本详情","description":"查询指定版本的详细信息","operationId":"getVersionById","parameters":[{"name":"workflowId","in":"path","description":"工作流ID","required":true,"schema":{"type":"integer","format":"int64"}},{"name":"versionId","in":"path","description":"版本ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultWorkflowVersionDTO"}}}}}}},"/api/v1/permissions/my-roles":{"get":{"tags":["权限管理"],"summary":"获取当前用户角色","operationId":"getCurrentUserRoles","responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListRoleDTO"}}}}}}},"/api/v1/permissions/my-permissions":{"get":{"tags":["权限管理"],"summary":"获取当前用户权限","operationId":"getCurrentUserPermissions","responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListString"}}}}}}},"/api/v1/files/user":{"get":{"tags":["文件资源"],"summary":"查询用户文件列表","description":"获取当前用户上传的所有文件列表","operationId":"listUserFiles","responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListFileResourceDTO"}}}}}}},"/api/v1/files/download/{fileId}":{"get":{"tags":["文件资源"],"summary":"下载文件","description":"根据文件ID下载文件","operationId":"downloadFile","parameters":[{"name":"fileId","in":"path","description":"文件ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"type":"string","format":"binary"}}}}}}},"/api/v1/files/business":{"get":{"tags":["文件资源"],"summary":"查询业务关联文件","description":"根据业务类型和业务ID查询关联的文件列表","operationId":"listBusinessFiles","parameters":[{"name":"businessType","in":"query","description":"业务类型","required":true,"schema":{"type":"string"}},{"name":"businessId","in":"query","description":"业务ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultListFileResourceDTO"}}}}}}},"/api/v1/comfyui-servers/key/{serverKey}":{"get":{"tags":["ComfyUI服务管理"],"summary":"根据标识符查询","description":"根据服务唯一标识符查询服务信息","operationId":"getServerByKey","parameters":[{"name":"serverKey","in":"path","description":"服务唯一标识符","required":true,"schema":{"type":"string"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultComfyuiServerDTO"}}}}}}},"/api/v1/files/{fileId}":{"delete":{"tags":["文件资源"],"summary":"删除文件","description":"根据文件ID删除文件（逻辑删除）","operationId":"deleteFile","parameters":[{"name":"fileId","in":"path","description":"文件ID","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"404":{"description":"Not Found","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"401":{"description":"Unauthorized","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"400":{"description":"Bad Request","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"500":{"description":"Internal Server Error","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}},"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ResultVoid"}}}}}}}},"components":{"schemas":{"ResultVoid":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"object"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"UpdateWorkflowRequest":{"type":"object","properties":{"workflowName":{"maxLength":100,"minLength":2,"type":"string","description":"工作流名称","example":"更新后的工作流名称"},"description":{"maxLength":500,"minLength":0,"type":"string","description":"工作流描述","example":"更新后的描述"},"thumbnailUrl":{"maxLength":500,"minLength":0,"type":"string","description":"工作流缩略图URL","example":"https://example.com/thumbnail.png"}},"description":"更新工作流请求"},"ResultWorkflowDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/WorkflowDTO"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"WorkflowDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"createTime":{"type":"string","format":"date-time"},"updateTime":{"type":"string","format":"date-time"},"workflowName":{"type":"string","description":"工作流名称"},"description":{"type":"string","description":"工作流描述"},"comfyuiServerId":{"type":"integer","description":"所属ComfyUI服务ID","format":"int64"},"comfyuiServerKey":{"type":"string","description":"所属ComfyUI服务唯一标识符"},"activeContent":{"type":"string","description":"当前激活版本的内容（JSON格式）"},"activeContentHash":{"type":"string","description":"激活内容的SHA-256哈希值"},"thumbnailUrl":{"type":"string","description":"工作流缩略图URL"},"isLocked":{"type":"boolean","description":"是否锁定"},"lockedBy":{"type":"integer","description":"锁定人ID","format":"int64"},"lockedAt":{"type":"string","description":"锁定时间","format":"date-time"}},"description":"工作流信息"},"UpdateUserRequest":{"type":"object","properties":{"username":{"maxLength":50,"minLength":1,"type":"string","description":"用户名","example":"张三"},"avatarUrl":{"type":"string","description":"头像URL","example":"https://example.com/avatar.jpg"}},"description":"更新用户信息请求"},"ResultUserDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/UserDTO"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"UserDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"createTime":{"type":"string","format":"date-time"},"updateTime":{"type":"string","format":"date-time"},"email":{"type":"string","description":"邮箱地址"},"username":{"type":"string","description":"用户名"},"avatarUrl":{"type":"string","description":"头像URL"},"status":{"type":"string","description":"用户状态","enum":["ACTIVE","INACTIVE","LOCKED","DELETED"]},"lastLoginTime":{"type":"string","description":"最后登录时间","format":"date-time"}},"description":"用户信息"},"UpdateServerRequest":{"type":"object","properties":{"serverName":{"maxLength":100,"minLength":0,"type":"string","description":"服务名称"},"description":{"maxLength":500,"minLength":0,"type":"string","description":"服务描述"},"baseUrl":{"maxLength":255,"minLength":0,"type":"string","description":"ComfyUI服务地址（仅MANUAL类型可修改）"},"authMode":{"maxLength":20,"minLength":0,"type":"string","description":"认证模式（仅MANUAL类型可修改）"},"apiKey":{"maxLength":255,"minLength":0,"type":"string","description":"API密钥（仅MANUAL类型可修改）"},"timeoutSeconds":{"type":"integer","description":"请求超时时间（秒）（仅MANUAL类型可修改）","format":"int32"},"maxRetries":{"type":"integer","description":"最大重试次数（仅MANUAL类型可修改）","format":"int32"},"isEnabled":{"type":"boolean","description":"是否启用（仅MANUAL类型可修改）"}},"description":"更新ComfyUI服务请求"},"ComfyuiServerDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"createTime":{"type":"string","format":"date-time"},"updateTime":{"type":"string","format":"date-time"},"serverKey":{"type":"string","description":"服务唯一标识符"},"serverName":{"type":"string","description":"服务名称"},"description":{"type":"string","description":"服务描述"},"baseUrl":{"type":"string","description":"ComfyUI服务地址"},"authMode":{"type":"string","description":"认证模式"},"apiKey":{"type":"string","description":"API密钥"},"timeoutSeconds":{"type":"integer","description":"请求超时时间（秒）","format":"int32"},"maxRetries":{"type":"integer","description":"最大重试次数","format":"int32"},"sourceType":{"type":"string","description":"注册来源：MANUAL/CODE_BASED"},"isEnabled":{"type":"boolean","description":"是否启用"},"lastHealthCheckTime":{"type":"string","description":"最后健康检查时间","format":"date-time"},"healthStatus":{"type":"string","description":"健康状态：HEALTHY/UNHEALTHY/UNKNOWN"}},"description":"ComfyUI服务信息"},"ResultComfyuiServerDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/ComfyuiServerDTO"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"CreateWorkflowRequest":{"required":["comfyuiServerId","comfyuiServerKey","workflowName"],"type":"object","properties":{"workflowName":{"maxLength":100,"minLength":2,"type":"string","description":"工作流名称","example":"我的工作流"},"description":{"maxLength":500,"minLength":0,"type":"string","description":"工作流描述","example":"这是一个测试工作流"},"comfyuiServerId":{"type":"integer","description":"所属ComfyUI服务ID","format":"int64","example":1234567890},"comfyuiServerKey":{"type":"string","description":"所属ComfyUI服务唯一标识符","example":"my-comfyui-server"}},"description":"创建工作流请求"},"CreateVersionRequest":{"required":["content"],"type":"object","properties":{"content":{"type":"string","description":"版本内容（JSON格式）","example":"{\"nodes\":[],\"links\":[]}"},"changeSummary":{"maxLength":500,"minLength":0,"type":"string","description":"变更摘要","example":"添加了图像处理节点"},"sessionId":{"type":"integer","description":"关联的会话ID","format":"int64","example":5555555555}},"description":"创建工作流版本请求"},"ResultWorkflowVersionDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/WorkflowVersionDTO"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"WorkflowVersionDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"createTime":{"type":"string","format":"date-time"},"updateTime":{"type":"string","format":"date-time"},"workflowId":{"type":"integer","description":"所属工作流ID","format":"int64"},"versionNumber":{"type":"integer","description":"版本号","format":"int32"},"content":{"type":"string","description":"版本内容（JSON格式）"},"contentHash":{"type":"string","description":"内容的SHA-256哈希值"},"changeSummary":{"type":"string","description":"变更摘要"},"sessionId":{"type":"integer","description":"关联的会话ID","format":"int64"}},"description":"工作流版本信息"},"SaveWorkflowContentRequest":{"required":["content"],"type":"object","properties":{"content":{"type":"string","description":"工作流内容（JSON格式）","example":"{\"nodes\":[],\"links\":[]}"}},"description":"保存工作流内容请求"},"FileResourceDTO":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"createTime":{"type":"string","format":"date-time"},"updateTime":{"type":"string","format":"date-time"},"fileName":{"type":"string","description":"原始文件名"},"storedName":{"type":"string","description":"存储文件名"},"fileSize":{"type":"integer","description":"文件大小（字节）","format":"int64"},"fileType":{"type":"string","description":"文件MIME类型"},"fileExtension":{"type":"string","description":"文件扩展名"},"businessType":{"type":"string","description":"业务类型"},"businessId":{"type":"integer","description":"业务关联ID","format":"int64"},"downloadCount":{"type":"integer","description":"下载次数","format":"int32"}},"description":"文件资源信息"},"ResultFileResourceDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/FileResourceDTO"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ResultListFileResourceDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"$ref":"#/components/schemas/FileResourceDTO"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"CreateServerRequest":{"required":["baseUrl","serverName"],"type":"object","properties":{"serverKey":{"maxLength":100,"minLength":0,"type":"string","description":"服务唯一标识符（可选，不填则自动生成UUID）"},"serverName":{"maxLength":100,"minLength":0,"type":"string","description":"服务名称"},"description":{"maxLength":500,"minLength":0,"type":"string","description":"服务描述"},"baseUrl":{"maxLength":255,"minLength":0,"type":"string","description":"ComfyUI服务地址"},"authMode":{"maxLength":20,"minLength":0,"type":"string","description":"认证模式"},"apiKey":{"maxLength":255,"minLength":0,"type":"string","description":"API密钥"},"timeoutSeconds":{"type":"integer","description":"请求超时时间（秒）","format":"int32","example":30},"maxRetries":{"type":"integer","description":"最大重试次数","format":"int32","example":3}},"description":"创建ComfyUI服务请求"},"ResetPasswordRequest":{"required":["newPassword","token"],"type":"object","properties":{"token":{"type":"string","description":"重置令牌"},"newPassword":{"maxLength":2147483647,"minLength":8,"pattern":"^(?=.*[A-Za-z])(?=.*\\d).+$","type":"string","description":"新密码（最小8位，包含字母和数字）","example":"newpassword123"}},"description":"重置密码请求"},"RegisterRequest":{"required":["email","password","username"],"type":"object","properties":{"email":{"type":"string","description":"邮箱地址","example":"user@example.com"},"username":{"maxLength":50,"minLength":2,"type":"string","description":"用户名","example":"张三"},"password":{"maxLength":2147483647,"minLength":8,"pattern":"^(?=.*[A-Za-z])(?=.*\\d).+$","type":"string","description":"密码（最小8位，包含字母和数字）","example":"password123"}},"description":"用户注册请求"},"RegisterResponse":{"type":"object","properties":{"userId":{"type":"integer","description":"用户ID","format":"int64"},"email":{"type":"string","description":"邮箱地址"}},"description":"注册响应"},"ResultRegisterResponse":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/RegisterResponse"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"RefreshTokenRequest":{"required":["refreshToken"],"type":"object","properties":{"refreshToken":{"type":"string","description":"刷新令牌"}},"description":"刷新Token请求"},"RefreshTokenResponse":{"type":"object","properties":{"accessToken":{"type":"string","description":"新的访问令牌"},"expiresIn":{"type":"integer","description":"访问令牌过期时间（秒）","format":"int64"}},"description":"刷新Token响应"},"ResultRefreshTokenResponse":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/RefreshTokenResponse"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"LoginRequest":{"required":["email","password"],"type":"object","properties":{"email":{"type":"string","description":"邮箱地址","example":"user@example.com"},"password":{"type":"string","description":"密码","example":"password123"}},"description":"用户登录请求"},"LoginResponse":{"type":"object","properties":{"accessToken":{"type":"string","description":"访问令牌"},"refreshToken":{"type":"string","description":"刷新令牌"},"expiresIn":{"type":"integer","description":"访问令牌过期时间（秒）","format":"int64"},"user":{"$ref":"#/components/schemas/UserDTO"}},"description":"登录响应"},"ResultLoginResponse":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"$ref":"#/components/schemas/LoginResponse"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ForgotPasswordRequest":{"required":["email"],"type":"object","properties":{"email":{"type":"string","description":"邮箱地址","example":"user@example.com"}},"description":"忘记密码请求"},"ResultListWorkflowDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowDTO"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ResultListWorkflowVersionDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"$ref":"#/components/schemas/WorkflowVersionDTO"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ResultString":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"string"},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ResultListRoleDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"$ref":"#/components/schemas/RoleDTO"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"RoleDTO":{"type":"object","properties":{"roleCode":{"type":"string","description":"角色编码"},"roleName":{"type":"string","description":"角色名称"}},"description":"角色信息"},"ResultListString":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"type":"string"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}},"ResultListComfyuiServerDTO":{"type":"object","properties":{"code":{"type":"integer","format":"int32"},"message":{"type":"string"},"data":{"type":"array","items":{"$ref":"#/components/schemas/ComfyuiServerDTO"}},"traceId":{"type":"string"},"timestamp":{"type":"integer","format":"int64"}}}},"securitySchemes":{"bearer-jwt":{"type":"http","description":"JWT认证Token","scheme":"bearer","bearerFormat":"JWT"}}}}
```

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
