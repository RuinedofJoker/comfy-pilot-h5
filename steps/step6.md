# Step 6: 权限系统完善 & 工作流模块重构

## 目标
1. 完善用户权限系统（角色、权限管理）
2. 修复管理员权限守卫
3. 重构工作流模块以适配最新后端 API

## 实施范围

### 1. 权限系统完善
- [x] `src/services/permission.ts` - 权限 API 服务
- [x] `src/stores/permission.ts` - 权限状态管理
- [x] `src/router/guards/auth.ts` - 认证守卫（自动加载用户信息、角色、权限）
- [x] `src/router/guards/permission.ts` - 权限守卫（管理员角色检查）
- [x] `src/stores/auth.ts` - 认证 Store（集成权限加载）

### 2. 工作流模块重构
- [x] `src/types/workflow.ts` - 工作流类型定义（与后端 API 对应）
- [x] `src/services/workflow.ts` - 工作流 API 服务（完整实现）
- [x] `src/stores/workflow.ts` - 工作流状态管理（完整实现）
- [ ] `src/views/user/WorkflowListView.vue` - 工作流列表页面（待修复）
- [ ] `src/views/workflow/WorkflowEditorView.vue` - 工作流编辑器页面（待修复）
- [ ] `src/components/workflow/WorkflowCard.vue` - 工作流卡片组件（待创建）

## 技术规范遵循
- ✅ TypeScript 严格模式
- ✅ Vue 3 Composition API + `<script setup>`
- ✅ SOLID 原则（单一职责、开闭原则）
- ✅ DRY 原则（避免重复代码）
- ✅ KISS 原则（保持简洁）
- ✅ YAGNI 原则（仅实现当前所需功能）

---

## 第一部分：权限系统完善

### 问题背景
在 Step 5 完成管理员后台后，发现权限系统存在以下问题：
1. 缺少权限 API 服务和 Store
2. 进入页面时未自动加载用户角色和权限
3. 管理员权限守卫使用了错误的数据源（`userInfo.roles` 而非 `permissionStore`）

### 实施记录

#### 1. 创建权限 API 服务 ✅
**文件**: `src/services/permission.ts`

**实现内容**:
```typescript
/**
 * 获取当前用户角色
 */
export function getCurrentUserRoles(): Promise<RoleInfo[]> {
  return http.get('/api/v1/permissions/my-roles')
}

/**
 * 获取当前用户权限
 */
export function getCurrentUserPermissions(): Promise<string[]> {
  return http.get('/api/v1/permissions/my-permissions')
}
```

**对应后端接口**:
- `GET /api/v1/permissions/my-roles` - 获取当前用户角色
- `GET /api/v1/permissions/my-permissions` - 获取当前用户权限

---

#### 2. 创建权限状态管理 Store ✅
**文件**: `src/stores/permission.ts`

**状态定义**:
- `roles: RoleInfo[]` - 角色列表
- `permissions: string[]` - 权限列表
- `isLoading: boolean` - 加载状态

**计算属性**:
- `rolesCodes` - 所有角色编码数组
- `isAdmin` - 是否是管理员（检查是否包含 'ADMIN' 角色）

**核心方法**:
- `fetchRoles()` - 获取用户角色
- `fetchPermissions()` - 获取用户权限
- `fetchRolesAndPermissions()` - 并行获取角色和权限
- `hasPermission(permission)` - 检查是否有指定权限
- `hasRole(roleCode)` - 检查是否有指定角色
- `clearPermissionData()` - 清除权限数据

**设计原则**:
- 使用 `Promise.all` 并行加载角色和权限，优化性能
- 提供便捷的权限检查方法
- 与 `authStore` 和 `userStore` 协同工作

---

#### 3. 修改认证守卫 ✅
**文件**: `src/router/guards/auth.ts`

**修改内容**:
1. 添加 `usePermissionStore` 导入
2. 在进入需要认证的页面时，自动加载用户信息、角色和权限
3. 使用 `Promise.all` 并行加载，优化性能
4. 添加错误处理，加载失败时清除数据并跳转登录页

**关键代码**:
```typescript
// 如果已登录且需要认证，加载用户信息
if (token && requiresAuth) {
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()

  // 如果用户信息未加载，则加载
  if (!userStore.userInfo) {
    try {
      // 并行加载用户信息、角色和权限
      await Promise.all([
        userStore.fetchUserInfo(),
        permissionStore.fetchRolesAndPermissions()
      ])
    } catch (error) {
      console.error('加载用户信息失败:', error)
      showToast({ type: 'fail', message: '加载用户信息失败，请重新登录' })

      // 清除 token 并跳转到登录页
      userStore.clearUserData()
      permissionStore.clearPermissionData()

      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
}
```

**加载时机**:
- 进入需要认证的页面时（`requiresAuth: true`）
- 检测到有 token 但 `userStore.userInfo` 为空时
- 并行调用三个 API：
  1. `/api/v1/users/me` → 存入 `userStore.userInfo`
  2. `/api/v1/permissions/my-roles` → 存入 `permissionStore.roles`
  3. `/api/v1/permissions/my-permissions` → 存入 `permissionStore.permissions`

---

#### 4. 修复权限守卫 ✅
**文件**: `src/router/guards/permission.ts`

**问题**:
- 原实现从 `userStore.userInfo.roles` 中检查管理员角色
- 但 `userInfo.roles` 字段可能为空（后端 API 返回的 `UserDTO` 中 `roles` 是可选字段）
- 角色数据实际存储在 `permissionStore.roles` 中

**修复前**:
```typescript
const userStore = useUserStore()
const hasAdminRole = userStore.userInfo?.roles?.some(
  role => role.roleCode === 'ADMIN'
)
```

**修复后**:
```typescript
const permissionStore = usePermissionStore()
if (!permissionStore.isAdmin) {
  showToast({ type: 'fail', message: '无权访问管理后台' })
  next('/')
  return
}
```

**优势**:
- 使用正确的数据源（`permissionStore`）
- 代码更简洁（直接使用 `isAdmin` 计算属性）
- 避免空值问题
- 性能更好（不需要额外的 API 调用）

---

#### 5. 修改认证 Store ✅
**文件**: `src/stores/auth.ts`

**修改内容**:
1. 在 `login` 方法中，登录成功后加载角色和权限
2. 在 `clearAuth` 方法中，清除权限数据
3. 更新 `isAdmin` 计算属性，使用 `permissionStore.isAdmin`

**关键代码**:
```typescript
// 登录方法
async function login(params: LoginParams): Promise<void> {
  // ... 保存 token 和用户信息
  
  // 加载用户详细信息、角色和权限
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  
  userStore.setUserInfo(response.user)
  await permissionStore.fetchRolesAndPermissions()
}

// 清除认证信息
function clearAuth(): void {
  // ... 清除 token 和用户信息
  
  const userStore = useUserStore()
  const permissionStore = usePermissionStore()
  userStore.clearUserData()
  permissionStore.clearPermissionData()
}

// isAdmin 计算属性
const isAdmin = computed(() => {
  const permissionStore = usePermissionStore()
  return permissionStore.isAdmin
})
```

---

### 权限系统完善总结

✅ **完成的工作**:
1. 创建权限 API 服务（2 个接口）
2. 创建权限状态管理 Store（完整的状态、计算属性、方法）
3. 修改认证守卫（自动加载用户信息、角色、权限）
4. 修复权限守卫（使用正确的数据源）
5. 修改认证 Store（集成权限加载和清除）

✅ **数据流**:
```
登录成功
  ↓
保存 Token 和用户信息
  ↓
并行加载角色和权限
  ↓
存储到 permissionStore
  ↓
可以使用 isAdmin、hasPermission、hasRole 等方法

进入需要认证的页面
  ↓
检查 token 是否存在
  ↓
检查 userInfo 是否已加载
  ↓
如果未加载，并行加载用户信息、角色、权限
  ↓
加载成功，允许访问
  ↓
如果需要管理员权限，检查 permissionStore.isAdmin
```

✅ **技术亮点**:
- 使用 `Promise.all` 并行加载，优化性能
- 统一的权限数据源（`permissionStore`）
- 完善的错误处理和用户提示
- 自动加载机制，无需手动调用
- 类型安全，无 `any` 类型


---

## 第二部分：工作流模块重构

### 问题背景
在检查现有工作流代码时，发现以下问题：
1. **类型定义不匹配**：使用了 `status`、`serviceId` 等后端不存在的字段
2. **API 路径错误**：使用 `/api/workflows` 而非 `/api/v1/workflows`
3. **缺少接口**：缺少锁定/解锁、内容管理、版本管理等接口
4. **Store 方法过时**：方法名和参数与新 API 不匹配

### 后端 API 分析

根据最新的后端 OpenAPI 文档，工作流相关接口包括：

**基础 CRUD**:
- `GET /api/v1/workflows` - 查询列表（支持过滤）
- `POST /api/v1/workflows` - 创建工作流
- `GET /api/v1/workflows/{id}` - 查询详情
- `PUT /api/v1/workflows/{id}` - 更新信息
- `DELETE /api/v1/workflows/{id}` - 删除

**锁定管理**:
- `POST /api/v1/workflows/{id}/lock` - 锁定工作流
- `POST /api/v1/workflows/{id}/unlock` - 解锁工作流

**内容管理**:
- `GET /api/v1/workflows/{id}/content` - 获取内容
- `POST /api/v1/workflows/{id}/content` - 保存内容

**版本管理**:
- `GET /api/v1/workflows/{workflowId}/versions` - 版本列表
- `POST /api/v1/workflows/{workflowId}/versions` - 创建版本
- `GET /api/v1/workflows/{workflowId}/versions/{versionId}` - 版本详情


### 实施记录

#### 1. 更新工作流类型定义 ✅
**文件**: `src/types/workflow.ts`

**主要变更**:
- 移除了 `status` 字段（draft/published/archived）
- 将 `serviceId`/`serviceName` 改为 `comfyuiServerId`/`comfyuiServerKey`
- 将 `jsonData` 对象改为 `activeContent` 字符串
- 添加锁定相关字段：`isLocked`、`lockedBy`、`lockedAt`
- 添加内容哈希字段：`activeContentHash`
- 添加缩略图字段：`thumbnailUrl`

**新增类型**:
- `CreateWorkflowRequest` - 创建工作流请求
- `UpdateWorkflowRequest` - 更新工作流请求
- `SaveWorkflowContentRequest` - 保存内容请求
- `ListWorkflowsParams` - 查询列表参数
- `WorkflowVersion` - 工作流版本信息
- `CreateVersionRequest` - 创建版本请求
- `WorkflowJsonData` - ComfyUI JSON 数据结构
- `WorkflowNode`、`WorkflowLink`、`WorkflowGroup` - ComfyUI 节点、连接、分组

**与后端对应关系**:
```typescript
// 前端 Workflow 接口 ↔ 后端 WorkflowDTO
interface Workflow {
  id: string                    // Long → string
  createTime: string            // LocalDateTime
  updateTime: string            // LocalDateTime
  workflowName: string          // String
  description: string | null    // String (nullable)
  comfyuiServerId: string       // Long → string
  comfyuiServerKey: string      // String
  activeContent: string | null  // String (JSON)
  activeContentHash: string | null
  thumbnailUrl: string | null
  isLocked: boolean
  lockedBy: string | null       // Long → string
  lockedAt: string | null       // LocalDateTime
}
```


---

#### 2. 更新工作流 API 服务 ✅
**文件**: `src/services/workflow.ts`

**主要变更**:
1. 修正所有 API 路径为 `/api/v1/workflows`
2. 移除不存在的接口（`/my`、`/save`、`/export`、`/import`）
3. 添加锁定/解锁接口
4. 添加内容管理接口
5. 添加版本管理接口

**完整接口列表**:
```typescript
// 基础 CRUD
listWorkflows(params?)           // GET /api/v1/workflows
getWorkflowById(id)              // GET /api/v1/workflows/{id}
createWorkflow(data)             // POST /api/v1/workflows
updateWorkflow(id, data)         // PUT /api/v1/workflows/{id}
deleteWorkflow(id)               // DELETE /api/v1/workflows/{id}

// 锁定管理
lockWorkflow(id)                 // POST /api/v1/workflows/{id}/lock
unlockWorkflow(id)               // POST /api/v1/workflows/{id}/unlock

// 内容管理
getWorkflowContent(id)           // GET /api/v1/workflows/{id}/content
saveWorkflowContent(id, data)    // POST /api/v1/workflows/{id}/content

// 版本管理
listWorkflowVersions(workflowId) // GET /api/v1/workflows/{workflowId}/versions
createWorkflowVersion(workflowId, data) // POST /api/v1/workflows/{workflowId}/versions
getWorkflowVersionById(workflowId, versionId) // GET /api/v1/workflows/{workflowId}/versions/{versionId}
```


---

#### 3. 更新工作流 Store ✅
**文件**: `src/stores/workflow.ts`

**新增状态**:
- `currentWorkflowContent: string | null` - 当前工作流内容
- `versions: WorkflowVersion[]` - 版本列表
- `isSaving: boolean` - 保存状态

**更新计算属性**:
- 移除：`draftWorkflows`、`publishedWorkflows`（基于 status）
- 新增：`lockedWorkflows`、`unlockedWorkflows`（基于 isLocked）

**更新方法**:
```typescript
// 查询相关
fetchWorkflows(params?)          // 替代 fetchMyWorkflows
fetchWorkflowById(id)            // 替代 fetchWorkflowDetail
fetchWorkflowContent(id)         // 新增

// 创建/更新
createNewWorkflow(data)          // 参数类型更新
updateWorkflowInfo(id, data)     // 替代 updateWorkflowData
saveWorkflowContent(id, content) // 新增

// 锁定管理
lockWorkflow(id)                 // 新增
unlockWorkflow(id)               // 新增

// 版本管理
fetchWorkflowVersions(workflowId) // 新增
createVersion(workflowId, data)   // 新增
```


**设计亮点**:
1. **内容分离管理**：工作流基本信息和内容分开存储和加载
2. **锁定机制**：支持工作流锁定，防止并发编辑冲突
3. **版本管理**：完整的版本创建和查询功能
4. **状态同步**：所有操作都会同步更新列表和当前工作流
5. **保存状态**：独立的 `isSaving` 状态，优化用户体验

---

#### 4. 修复工作流页面组件 ✅

**修复时间**: 继续 Step 6 工作

**修复文件**:
1. `src/composables/useWorkflowList.ts` - 工作流列表逻辑
2. `src/components/user/WorkflowCard.vue` - 工作流卡片组件
3. `src/views/user/WorkflowListView.vue` - 工作流列表页面

---

##### 4.1 修复 useWorkflowList.ts ✅

**问题**:
1. 第 9 行：使用了不存在的 `CreateWorkflowParams` 类型
2. 第 15 行：sortBy 类型与 Workflow 字段不匹配（`lastUsed`/`createdAt`/`updatedAt`）
3. 第 26-27 行：使用了 `w.name` 和 `w.description`（应该是 `w.workflowName`）
4. 第 90 行：调用了不存在的 `fetchMyWorkflows()` 方法

**修复内容**:
```typescript
// 1. 修复类型导入
- import type { CreateWorkflowParams } from '@/types/workflow'
+ import type { CreateWorkflowRequest } from '@/types/workflow'

// 2. 修复 sortBy 类型和默认值
- const sortBy = ref<'lastUsed' | 'createdAt' | 'updatedAt'>('lastUsed')
+ const sortBy = ref<'createTime' | 'updateTime'>('updateTime')

// 3. 修复搜索过滤字段
- w.name.toLowerCase().includes(keyword) ||
+ w.workflowName.toLowerCase().includes(keyword) ||

// 4. 修复 createWorkflow 参数类型
- async function createWorkflow(params: CreateWorkflowParams): Promise<void>
+ async function createWorkflow(params: CreateWorkflowRequest): Promise<void>

// 5. 修复 Store 方法调用
- await workflowStore.fetchMyWorkflows()
+ await workflowStore.fetchWorkflows()
```

---

##### 4.2 修复 WorkflowCard.vue ✅

**问题**:
1. 第 4 行：使用了 `workflow.name`（应该是 `workflow.workflowName`）
2. 第 31 行：使用了 `workflow.updatedAt`（应该是 `workflow.updateTime`）

**修复内容**:
```vue
<!-- 1. 修复工作流名称字段 -->
- <h3 class="f-workflow-card__name">{{ workflow.name }}</h3>
+ <h3 class="f-workflow-card__name">{{ workflow.workflowName }}</h3>

<!-- 2. 修复更新时间字段 -->
- {{ formatRelativeTime(workflow.updatedAt) }}
+ {{ formatRelativeTime(workflow.updateTime) }}
```

---

##### 4.3 修复 WorkflowListView.vue ✅

**问题**:
1. 第 126-130 行：sortOptions 的值与后端字段不匹配
2. 第 121-124 行：createForm 字段名不匹配（`name` 应该是 `workflowName`）
3. 第 156 行：使用了 `workflow.name`（应该是 `workflow.workflowName`）
4. 第 164-167 行：创建工作流时缺少必需的 `comfyuiServerId` 和 `comfyuiServerKey`

**修复内容**:

1. **添加 serviceStore 导入和使用**:
```typescript
import { useServiceStore } from '@/stores/service'
import { showToast } from 'vant'

const serviceStore = useServiceStore()
```

2. **修复 sortOptions**:
```typescript
const sortOptions = [
  { text: '更新时间', value: 'updateTime' },
  { text: '创建时间', value: 'createTime' }
]
```

3. **修复 createForm 字段名**:
```typescript
const createForm = reactive({
  workflowName: '',
  description: ''
})
```

4. **修复模板中的表单字段**:
```vue
<van-field
  v-model="createForm.workflowName"
  label="工作流名称"
  placeholder="请输入工作流名称"
  required
/>
```

5. **修复 handleDeleteWorkflow**:
```typescript
function handleDeleteWorkflow(workflow: Workflow): void {
  deleteWorkflow(workflow.id, workflow.workflowName)
}
```

6. **修复 handleBeforeClose - 添加服务检查和必需字段**:
```typescript
async function handleBeforeClose(action: string): Promise<boolean> {
  if (action === 'confirm') {
    if (!createForm.workflowName.trim()) {
      return false
    }

    // 检查是否选择了服务
    if (!serviceStore.selectedService) {
      showToast({
        type: 'fail',
        message: '请先选择 ComfyUI 服务'
      })
      return false
    }

    await createWorkflow({
      workflowName: createForm.workflowName,
      description: createForm.description || undefined,
      comfyuiServerId: serviceStore.selectedService.id,
      comfyuiServerKey: serviceStore.selectedService.serverKey
    })
    createForm.workflowName = ''
    createForm.description = ''
  }
  return true
}
```

**关键改进**:
- 创建工作流时会检查是否选择了 ComfyUI 服务
- 自动从 serviceStore 获取当前选择的服务 ID 和 Key
- 如果未选择服务，会提示用户先选择服务

---

### 工作流模块重构总结

✅ **完成的工作**:
1. 更新工作流类型定义（与后端 API 完全对应）
2. 更新工作流 API 服务（12 个接口，完整实现）
3. 更新工作流 Store（完整的状态管理和方法）
4. 修复 `useWorkflowList.ts` - 工作流列表逻辑（类型、方法调用、字段名）
5. 修复 `WorkflowCard.vue` - 工作流卡片组件（字段名适配）
6. 修复 `WorkflowListView.vue` - 工作流列表页面（完整适配新 API）

⏳ **待完成的工作**:
1. ⏳ 修复 `WorkflowEditorView.vue` - 工作流编辑器页面（待完成）


**现有页面组件问题分析**:

1. **WorkflowListView.vue**: ✅ 已修复
   - ~~使用了旧的 Store 方法名（`fetchMyWorkflows`）~~ → 已修复
   - ~~使用了不存在的 `workflow.status` 字段~~ → 已修复
   - ~~缺少 `WorkflowCard` 组件~~ → 组件已存在并修复
   - ~~需要适配新的 API 和数据结构~~ → 已完成

2. **WorkflowEditorView.vue**: ⏳ 待修复
   - 需要适配新的工作流内容获取/保存 API
   - 需要实现锁定/解锁机制
   - 需要集成版本管理功能
   - 需要处理 `activeContent` 字符串格式

3. **WorkflowCard.vue**: ✅ 已修复
   - ~~使用了 `workflow.name`~~ → 已改为 `workflow.workflowName`
   - ~~使用了 `workflow.updatedAt`~~ → 已改为 `workflow.updateTime`


---

## Step 6 总结

### ✅ 已完成的工作

#### 权限系统完善（100%）
1. ✅ 创建权限 API 服务（2 个接口）
2. ✅ 创建权限状态管理 Store
3. ✅ 修改认证守卫（自动加载用户信息、角色、权限）
4. ✅ 修复权限守卫（使用正确的数据源）
5. ✅ 修改认证 Store（集成权限加载）

#### 工作流模块重构（86%）
1. ✅ 更新工作流类型定义（与后端 API 完全对应）
2. ✅ 更新工作流 API 服务（12 个接口）
3. ✅ 更新工作流 Store（完整的状态管理）
4. ✅ 修复工作流列表页面（完整适配新 API）
5. ✅ 修复工作流卡片组件（字段名适配）
6. ✅ 修复工作流列表逻辑（类型和方法调用）
7. ⏳ 修复工作流编辑器页面（待完成）

### 📊 完成度统计
- **权限系统**: 5/5 (100%)
- **工作流模块**: 6/7 (86%)
- **总体进度**: 11/12 (92%)

## 工作流业务逻辑

### 工作流与ComfyUI服务的关系

**关联关系**：
- 一个ComfyUI服务对应多个工作流（一对多）
- 每个工作流必须关联一个ComfyUI服务
- 工作流记录服务的ID和唯一标识符（server_id + server_key）

**业务规则**：
- 创建工作流时必须指定ComfyUI服务
- 删除ComfyUI服务时需要检查是否有关联的工作流
- 工作流可以查询所属的ComfyUI服务信息

---

### 激活内容机制

**激活内容（active_content）**：
- 存储当前工作流的最新内容
- 与工作流是一对一关系，直接存储在workflow表中
- 初始状态为空（NULL）

**保存机制**：
- 用户点击保存按钮或按Ctrl+S触发保存
- 保存时更新active_content字段
- 同时计算并更新active_content_hash

**哈希计算**：
- 使用SHA-256算法对内容生成哈希值
- 用于快速判断内容是否发生变化
- 在版本生成时用于去重判断

---

### 版本管理机制

**版本创建时机**：
- 仅在Agent对话修改工作流内容时创建版本
- 用户手动保存（Ctrl+S）不创建版本，只更新active_content

**版本生成流程**：
1. Agent对话完成后，计算修改后内容的SHA-256哈希值
2. 查询是否存在相同哈希值的版本
3. 如果哈希值相同，进一步比对完整内容
4. 如果内容完全一致，复用已有版本（不创建新版本）
5. 如果内容不同，创建新版本（version_number自动递增）

**版本去重策略**：
- 使用content_hash快速判断（O(1)复杂度）
- 哈希值相同时再比对完整内容（确保准确性）
- 避免存储重复的版本内容

**版本只读性**：
- 版本一旦创建就不能修改
- 保证版本历史的完整性和可追溯性
- 版本号严格递增，不允许跳号

---

### 工作流锁定机制

**锁定目的**：
- 防止多人同时编辑同一个工作流
- 避免内容冲突和数据丢失

**锁定规则**：
- 用户打开工作流编辑页面时自动锁定
- 锁定时记录locked_by（用户ID）和locked_at（锁定时间）
- 其他用户无法编辑已锁定的工作流

**解锁规则**：
- 用户关闭编辑页面时自动解锁
- 锁定超时自动解锁（如30分钟无操作）
- 锁定人可以主动解锁
- 管理员可以强制解锁