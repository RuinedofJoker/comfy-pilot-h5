# 工作流页面未使用代码分析报告

## 分析日期
2026-01-21

## 分析范围
- `src/composables/workflow/` - 工作流相关 composables
- `src/components/workflow/` - 工作流相关组件
- `src/views/workflow/` - 工作流页面

---

## 🔴 发现的未使用代码

### 1. useChatDialog.ts 中的拖拽功能（未使用）

**文件**: `src/composables/workflow/useChatDialog.ts`

**未使用的代码**:
```typescript
// 行 10-11: 拖拽相关状态
const chatPosition = ref({ x: 0, y: 0 })
const isDraggingChat = ref(false)

// 行 14-15: 拖拽起始位置
const dragStartPos = ref({ x: 0, y: 0 })
const dragStartChatPos = ref({ x: 0, y: 0 })

// 行 34-61: 拖拽相关方法
function handleChatMouseDown(event: MouseEvent): void { ... }
function handleChatMouseMove(event: MouseEvent): void { ... }
function handleChatMouseUp(): void { ... }

// 行 105-106, 112: 导出但未使用
chatPosition,
isDraggingChat,
handleChatMouseDown,
```

**原因**:
- ChatDialog 组件使用固定定位 (`position: absolute; right: 12px; bottom: 12px;`)
- 没有实现拖拽功能
- WorkflowEditorView.vue 中没有使用这些拖拽相关的状态和方法

**影响**: 约 50 行未使用代码

---

### 2. useChatDialog.ts 中的 hideChat 方法（未使用）

**文件**: `src/composables/workflow/useChatDialog.ts`

**未使用的代码**:
```typescript
// 行 24-26
function hideChat(): void {
  isChatVisible.value = false
}

// 行 110: 导出但未使用
hideChat,
```

**原因**:
- WorkflowEditorView.vue 中没有关闭对话框的功能
- 对话框只能最小化，不能关闭

**影响**: 约 5 行未使用代码

---

### 3. useComfyUIIntegration.ts 中的未使用方法

**文件**: `src/composables/workflow/useComfyUIIntegration.ts`

**未使用的代码**:
```typescript
// 行 73-85: loadWorkflowFromComfyUI 方法
function loadWorkflowFromComfyUI(content: string): void { ... }

// 行 210-213: getWorkflowFromComfyUI 方法（兼容旧接口）
function getWorkflowFromComfyUI(): Promise<string> {
  return fetchWorkflowFromIframe()
}
```

**原因**:
- `loadWorkflowFromComfyUI` 在 WorkflowEditorView.vue 中解构但从未调用
- `getWorkflowFromComfyUI` 是 `fetchWorkflowFromIframe` 的别名，但实际使用的是 `fetchWorkflowFromIframe`

**影响**: 约 20 行未使用代码

---

## 📊 统计汇总

| 文件 | 未使用代码行数 | 严重程度 |
|------|---------------|---------|
| `useChatDialog.ts` | ~55 行 | 中等 |
| `useComfyUIIntegration.ts` | ~20 行 | 低 |
| **总计** | **~75 行** | - |

---

## ✅ 清理建议

### 优先级 1: 清理 useChatDialog.ts

**删除拖拽相关代码**:
```typescript
// 删除以下代码（行 10-11, 14-15, 34-61, 105-106, 112）
- const chatPosition = ref({ x: 0, y: 0 })
- const isDraggingChat = ref(false)
- const dragStartPos = ref({ x: 0, y: 0 })
- const dragStartChatPos = ref({ x: 0, y: 0 })
- function handleChatMouseDown(event: MouseEvent): void { ... }
- function handleChatMouseMove(event: MouseEvent): void { ... }
- function handleChatMouseUp(): void { ... }
```

**删除 hideChat 方法**:
```typescript
// 删除以下代码（行 24-26, 110）
- function hideChat(): void {
-   isChatVisible.value = false
- }
```

**清理后的 return 语句**:
```typescript
return {
  // 状态
  isChatVisible,
  isChatMinimized,

  // 方法
  showChat,
  toggleMinimize,
  handleSendMessage
}
```

---

### 优先级 2: 清理 useComfyUIIntegration.ts

**删除未使用的方法**:
```typescript
// 删除以下代码（行 73-85）
- function loadWorkflowFromComfyUI(content: string): void {
-   try {
-     JSON.parse(content)
-     editableJsonContent.value = content
-     jsonEditError.value = ''
-     isJsonValid.value = true
-   } catch (error) {
-     console.error('工作流内容格式错误:', error)
-     toast.error('工作流内容格式错误')
-   }
- }

// 删除以下代码（行 210-213）
- function getWorkflowFromComfyUI(): Promise<string> {
-   return fetchWorkflowFromIframe()
- }
```

**更新 return 语句**:
```typescript
return {
  // ... 其他导出

  // 方法
  setComfyuiFrame,
  switchView,
  // loadWorkflowFromComfyUI, // ❌ 删除
  loadWorkflowInComfyUI,
  // getWorkflowFromComfyUI, // ❌ 删除
  fetchWorkflowFromIframe,
  copyJsonToClipboard,
  formatJson,
  handleJsonValidate,
  handleViewToggleMouseDown
}
```

---

### 优先级 3: 清理 WorkflowEditorView.vue 中的未使用解构

**删除未使用的解构变量**:
```typescript
// 当前代码（行 131-149）
const {
  comfyuiFrame,
  currentView,
  editableJsonContent,
  jsonEditError,
  isJsonValid,
  viewTogglePosition,
  isDraggingViewToggle,
  setComfyuiFrame,
  switchView,
  loadWorkflowFromComfyUI,  // ❌ 未使用
  loadWorkflowInComfyUI,
  getWorkflowFromComfyUI,   // ❌ 未使用
  fetchWorkflowFromIframe,
  copyJsonToClipboard,
  formatJson,
  handleJsonValidate,
  handleViewToggleMouseDown
} = comfyUIIntegration

// 清理后
const {
  currentView,
  editableJsonContent,
  jsonEditError,
  isJsonValid,
  viewTogglePosition,
  isDraggingViewToggle,
  setComfyuiFrame,
  switchView,
  loadWorkflowInComfyUI,
  fetchWorkflowFromIframe,
  copyJsonToClipboard,
  formatJson,
  handleJsonValidate,
  handleViewToggleMouseDown
} = comfyUIIntegration
```

---

## 🎯 清理后的预期效果

1. **代码量减少**: 删除约 75 行未使用代码
2. **可维护性提升**: 减少代码复杂度，降低维护成本
3. **性能优化**: 减少不必要的响应式状态和事件监听器
4. **代码清晰度**: 更清晰地表达实际使用的功能

---

## ⚠️ 注意事项

1. **保留 comfyuiFrame**: 虽然在解构中未直接使用，但在 `onMounted` 中通过 `workflowViewerRef.value?.comfyuiFrame` 访问
2. **测试验证**: 清理后需要完整测试工作流编辑器的所有功能
3. **Git 提交**: 建议单独提交，便于回滚

---

## 📝 清理步骤

1. 清理 `useChatDialog.ts` 中的拖拽功能和 hideChat 方法
2. 清理 `useComfyUIIntegration.ts` 中的未使用方法
3. 清理 `WorkflowEditorView.vue` 中的未使用解构
4. 运行 `npm run type-check` 确保类型检查通过
5. 测试工作流编辑器所有功能
6. 提交代码

---
