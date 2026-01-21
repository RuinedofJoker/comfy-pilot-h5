# 工作流编辑器重构总结

## 修改日期
2026-01-21

## 重构目标
将 `useWorkflowEditor.ts` 中的有价值逻辑迁移到 `WorkflowEditorView.vue`，并删除冗余文件。

---

## 1️⃣ 迁移的核心逻辑

### ComfyUI 元数据字段忽略规则

从 `useWorkflowEditor.ts` 迁移到 `WorkflowEditorView.vue` 的关键逻辑：

```typescript
// 忽略 ComfyUI 特定的元数据字段（画布偏移、缩放等）
const shouldIgnorePath = (path: string[]): boolean => {
  // 忽略画布偏移量 (extra.ds.offset)
  if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'offset') {
    return true
  }
  // 忽略画布缩放 (extra.ds.scale)
  if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'scale') {
    return true
  }
  // 忽略节点内部名称 (nodes[*].properties['Node name for S&R'])
  if (path.length >= 4 && path[0] === 'nodes' && path[2] === 'properties' && path[3] === 'Node name for S&R') {
    return true
  }
  return false
}
```

### 为什么需要忽略这些字段？

1. **`extra.ds.offset`** - 画布偏移量
   - 用户拖动画布时会改变
   - 不影响工作流逻辑
   - 不应触发"未保存"状态

2. **`extra.ds.scale`** - 画布缩放级别
   - 用户缩放画布时会改变
   - 不影响工作流逻辑
   - 不应触发"未保存"状态

3. **`nodes[*].properties['Node name for S&R']`** - 节点内部名称
   - ComfyUI 内部使用的标识符
   - 用户不可见
   - 不应触发"未保存"状态

---

## 2️⃣ 修改的文件

### `src/views/workflow/WorkflowEditorView.vue`

#### 修改 1：添加导入
```typescript
import { compareWorkflowContent } from '@/utils/workflow-compare'
```

#### 修改 2：更新 `hasUnsavedChanges` 计算属性
```typescript
// 是否有未保存的修改（使用深度比较避免格式差异导致的误判）
const hasUnsavedChanges = computed(() => {
  if (!currentWorkflow.value || !editableJsonContent.value) return false

  // 忽略 ComfyUI 特定的元数据字段（画布偏移、缩放等）
  const shouldIgnorePath = (path: string[]): boolean => {
    // ... 忽略逻辑
  }

  return !compareWorkflowContent(editableJsonContent.value, originalContent.value, shouldIgnorePath)
})
```

**改进点：**
- ✅ 使用深度 JSON 比较而非字符串比较
- ✅ 忽略 ComfyUI 元数据字段
- ✅ 避免因格式差异导致的误判
- ✅ 避免因画布操作导致的误判

---

## 3️⃣ 删除的文件

### `src/composables/workflow/useWorkflowEditor.ts`

**删除原因：**
1. ❌ 没有任何地方引用这个文件
2. ❌ 所有功能已在其他地方实现
3. ❌ 保留会造成代码冗余和维护困惑

**功能迁移对照表：**

| useWorkflowEditor 功能 | 当前实现位置 |
|---|---|
| `workflows` 状态 | `useWorkflowStore` |
| `currentWorkflow` 状态 | `useWorkflowStore` |
| `loadWorkflows()` | `workflowStore.fetchWorkflows()` |
| `selectWorkflow()` | `WorkflowEditorView.handleSelectWorkflow()` |
| `handleCreateWorkflow()` | `WorkflowEditorView.handleConfirmCreateWorkflow()` |
| `saveWorkflow()` | `WorkflowEditorView.handleSaveWorkflow()` |
| `hasUnsavedChanges` | `WorkflowEditorView` 计算属性 ✅ |
| **忽略逻辑** | **已迁移到 WorkflowEditorView** ✅ |

---

## 4️⃣ 当前 Composables 结构

```
src/composables/workflow/
├── useChatDialog.ts           # Agent 对话框管理
├── useComfyUIIntegration.ts   # ComfyUI iframe 通信
└── useSessionManagement.ts    # 会话管理
```

**职责清晰：**
- ✅ 每个 composable 职责单一
- ✅ 没有冗余代码
- ✅ 易于维护和测试

---

## 5️⃣ 测试检查清单

### ✅ 基本功能测试
- [ ] 选择工作流后正确显示"已保存"状态
- [ ] 修改工作流内容后显示"有未保存的修改"
- [ ] 保存工作流后恢复"已保存"状态

### ✅ 元数据忽略测试
- [ ] 拖动画布（改变 offset）不触发"未保存"状态
- [ ] 缩放画布（改变 scale）不触发"未保存"状态
- [ ] 修改节点内部名称不触发"未保存"状态

### ✅ 深度比较测试
- [ ] JSON 格式差异（空格、换行）不触发"未保存"状态
- [ ] 实际内容修改正确触发"未保存"状态

---

## 6️⃣ 遵循的编码原则

### SOLID 原则
- **单一职责（S）**：每个 composable 职责明确
- **开闭原则（O）**：忽略规则易于扩展

### DRY 原则
- 删除冗余的 `useWorkflowEditor.ts`
- 复用 `compareWorkflowContent` 工具函数

### KISS 原则
- 忽略逻辑清晰直观
- 使用简单的路径匹配

### YAGNI 原则
- 只保留实际使用的代码
- 删除未使用的功能

---

## 7️⃣ 后续优化建议

### 可选：提取忽略规则配置

如果未来需要更多忽略规则，可以考虑提取为配置：

```typescript
// src/config/workflow-ignore-paths.ts
export const WORKFLOW_IGNORE_PATHS = [
  ['extra', 'ds', 'offset'],
  ['extra', 'ds', 'scale'],
  ['nodes', '*', 'properties', 'Node name for S&R']
]
```

但目前规则简单，直接内联即可（遵循 YAGNI 原则）。

---

## 8️⃣ 总结

✅ **完成的工作：**
1. 迁移了 ComfyUI 元数据字段忽略逻辑
2. 更新了 `hasUnsavedChanges` 计算属性
3. 删除了冗余的 `useWorkflowEditor.ts` 文件
4. 保持了代码库的整洁和可维护性

✅ **改进的效果：**
1. 避免因画布操作导致的误判
2. 避免因 JSON 格式差异导致的误判
3. 减少了代码冗余
4. 提高了代码可维护性

✅ **遵循的原则：**
- SOLID、DRY、KISS、YAGNI 原则
- 单一职责、代码复用、简洁明了
