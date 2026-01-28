<template>
  <div class="g-workflow-editor">
    <!-- 顶部导航栏 -->
    <TopNavBar
      @open-mcp-config="showMcpConfig = true"
      @open-agent-config="showAgentConfigModal = true"
    />

    <div class="m-editor-container">
      <!-- 左侧会话管理区域 -->
      <SessionSidebar
        :sessions="sessions"
        :current-session-code="currentSessionCode"
        @create-session="handleOpenCreateSessionModal"
        @select-session="handleSelectSession"
        @edit-session="handleOpenEditSessionModal"
        @delete-session="handleDeleteSessionWithConfirm"
        @go-back="handleGoBack"
      />

      <!-- 主工作区域 -->
      <div class="m-main-workspace">
        <!-- 工具栏 -->
        <WorkflowToolbar
          :workflows="workflows"
          :current-workflow="currentWorkflow"
          :current-workflow-id="currentWorkflowId"
          :service-name="currentService?.serverName || null"
          :is-service-available="isServiceAvailable"
          :has-unsaved-changes="hasUnsavedChanges"
          :can-undo="canUndo"
          :can-redo="canRedo"
          @create-workflow="showCreateModal = true"
          @select-workflow="handleSelectWorkflow"
          @save-workflow="handleSaveWorkflow"
          @undo="handleUndo"
          @redo="handleRedo"
        />

        <!-- ComfyUI 容器和视图 -->
        <WorkflowViewer
          ref="workflowViewerRef"
          :comfyui-url="comfyuiUrl"
          :current-view="currentView"
          :editable-json-content="editableJsonContent"
          :json-edit-error="jsonEditError"
          :view-toggle-position="viewTogglePosition"
          :is-dragging-view-toggle="isDraggingViewToggle"
          :is-iframe-connected="isIframeConnected"
          :is-checking-connection="isCheckingConnection"
          @switch-view="switchView"
          @copy-json="copyJsonToClipboard"
          @format-json="formatJson"
          @update:editable-json-content="editableJsonContent = $event"
          @validate-json="handleJsonValidate"
          @view-toggle-mousedown="handleViewToggleMouseDown"
        />

        <!-- Agent 对话框 -->
        <ChatDialog
          v-if="isChatVisible"
          :visible="isChatVisible"
          :is-minimized="isChatMinimized"
          :session-title="currentSession?.title || null"
          :session-code="currentSessionCode"
          :messages="messages"
          :workflow-content="editableJsonContent"
          :is-service-available="isServiceAvailable"
          @toggle-minimize="toggleMinimize"
          @close="handleCloseChat"
          @refresh-messages="handleRefreshMessages"
        />
      </div>
    </div>

    <!-- 创建工作流弹窗 -->
    <CreateWorkflowModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @confirm="handleConfirmCreateWorkflow"
    />

    <!-- 会话弹窗 -->
    <SessionModal
      v-model:visible="showSessionModal"
      :is-edit="isEditMode"
      :session-code="editingSessionCode"
      :comfyui-server-id="serviceId"
      :comfyui-server-name="currentService?.serverName || ''"
      @confirm="handleConfirmSession"
    />

    <!-- Agent 配置弹窗 -->
    <AgentConfigModal v-model:visible="showAgentConfigModal" />

    <!-- 删除会话确认弹窗 -->
    <DeleteSessionModal
      v-model:visible="showDeleteModal"
      :session-title="deletingSessionTitle"
      @confirm="handleConfirmDelete"
    />

    <!-- MCP 工具配置弹窗 -->
    <McpConfigDialog
      v-model:visible="showMcpConfig"
      @change="handleMcpConfigChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from '@/utils/toast'
import { compareWorkflowContent } from '@/utils/workflow-compare'

// 组件导入
import TopNavBar from '@/components/user/TopNavBar.vue'
import SessionSidebar from '@/components/workflow/SessionSidebar.vue'
import WorkflowToolbar from '@/components/workflow/WorkflowToolbar.vue'
import WorkflowViewer from '@/components/workflow/WorkflowViewer.vue'
import ChatDialog from '@/components/workflow/ChatDialog.vue'
import CreateWorkflowModal from '@/components/workflow/CreateWorkflowModal.vue'
import SessionModal from '@/components/workflow/SessionModal.vue'
import DeleteSessionModal from '@/components/workflow/DeleteSessionModal.vue'
import AgentConfigModal from '@/components/user/AgentConfigModal.vue'
import McpConfigDialog from '@/components/mcp/McpConfigDialog.vue'

// Composables 导入
import { useSessionManagement } from '@/composables/workflow/useSessionManagement'
import { useChatDialog } from '@/composables/workflow/useChatDialog'
import { useComfyUIIntegration } from '@/composables/workflow/useComfyUIIntegration'
import { useWorkflowHistory } from '@/composables/workflow/useWorkflowHistory'

// Store 导入
import { useWorkflowStore } from '@/stores/workflow'
import { useServiceStore } from '@/stores/service'
import { useUserAgentConfigStore } from '@/stores/userAgentConfig'

// MCP 工具系统导入
import { mcpToolRegistry, mcpConfigManager, ComfyUIToolSet } from '@/mcp'

// 路由和 Store
const route = useRoute()
const router = useRouter()
const workflowStore = useWorkflowStore()
const serviceStore = useServiceStore()
const userAgentConfigStore = useUserAgentConfigStore()

// 从路由获取服务 ID
const serviceId = route.params.serviceId as string

// 初始化 Composables
const sessionManagement = useSessionManagement(serviceId)
const chatDialog = useChatDialog()
const comfyUIIntegration = useComfyUIIntegration()
const workflowHistory = useWorkflowHistory()

// 从 sessionManagement 解构状态和方法
const {
  sessions,
  currentSessionCode,
  currentSession,
  messages,
  loadSessions,
  selectSession,
  unselectSession,
  handleCreateSession,
  handleUpdateSession,
  handleDeleteSession
} = sessionManagement

// 从 chatDialog 解构状态和方法
const {
  isChatVisible,
  isChatMinimized,
  toggleMinimize,
  showChat,
  hideChat
} = chatDialog

// 从 comfyUIIntegration 解构状态和方法
const {
  currentView,
  editableJsonContent,
  jsonEditError,
  viewTogglePosition,
  isDraggingViewToggle,
  isIframeConnected,
  isCheckingConnection,
  setComfyuiFrame,
  checkIframeConnection,
  switchView,
  loadWorkflowInComfyUI,
  fetchWorkflowFromIframe,
  copyJsonToClipboard,
  formatJson,
  handleJsonValidate,
  handleViewToggleMouseDown
} = comfyUIIntegration

// 从 workflowHistory 解构状态和方法
const {
  canUndo,
  canRedo,
  isApplyingHistory,
  pushHistory,
  undo,
  redo,
  resetHistory
} = workflowHistory

// 本地状态
const showCreateModal = ref(false)
const showSessionModal = ref(false)
const showAgentConfigModal = ref(false)
const showMcpConfig = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const editingSessionCode = ref<string | undefined>(undefined)
const deletingSessionCode = ref<string | undefined>(undefined)
const deletingSessionTitle = ref<string>('')
const workflowViewerRef = ref<InstanceType<typeof WorkflowViewer> | null>(null)
const currentWorkflowId = ref<string | null>(null)
const originalContent = ref<string>('')
const pendingWorkflowContent = ref<string>('') // 待保存的工作流内容
let syncTimer: number | null = null // 定时同步定时器

// 从 Store 获取状态
const workflows = computed(() => workflowStore.workflows)
const currentWorkflow = computed(() => workflowStore.currentWorkflow)
const currentService = computed(() => serviceStore.selectedService)
const isServiceAvailable = computed(() => currentService.value?.healthStatus === 'HEALTHY')

// 是否有未保存的修改（使用深度比较避免格式差异导致的误判）
const hasUnsavedChanges = computed(() => {
  if (!currentWorkflow.value || !editableJsonContent.value) return false

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

  return !compareWorkflowContent(editableJsonContent.value, originalContent.value, shouldIgnorePath)
})

// ComfyUI URL
const comfyuiUrl = computed(() => {
  if (!currentService.value) return ''
  return currentService.value.baseUrl
})

// 监听工作流内容变化，推入历史记录
watch(
  () => editableJsonContent.value,
  (newContent, oldContent) => {
    // 如果正在应用历史记录，不推入新记录
    if (isApplyingHistory.value) {
      return
    }

    // 如果没有当前工作流，不推入历史记录
    if (!currentWorkflow.value) {
      return
    }

    // 如果新旧内容相同，不推入历史记录
    if (newContent === oldContent) {
      return
    }

    // 检查是否有实质性变化（使用与 hasUnsavedChanges 相同的比较逻辑）
    const shouldIgnorePath = (path: string[]): boolean => {
      if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'offset') {
        return true
      }
      if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'scale') {
        return true
      }
      if (path.length >= 4 && path[0] === 'nodes' && path[2] === 'properties' && path[3] === 'Node name for S&R') {
        return true
      }
      return false
    }

    // 只有当内容与原始内容不同时才推入历史记录
    const hasChanges = !compareWorkflowContent(newContent, originalContent.value, shouldIgnorePath)

    if (hasChanges && newContent) {
      // 推入新内容到历史栈（而不是旧内容）
      pushHistory(newContent)
    }
  }
)

// 会话相关方法
async function handleSelectSession(sessionCode: string): Promise<void> {
  await selectSession(sessionCode)
  showChat()
}

// 打开新建会话弹窗
function handleOpenCreateSessionModal(): void {
  isEditMode.value = false
  editingSessionCode.value = undefined
  showSessionModal.value = true
}

// 打开编辑会话弹窗
function handleOpenEditSessionModal(sessionCode: string): void {
  isEditMode.value = true
  editingSessionCode.value = sessionCode
  showSessionModal.value = true
}

// 打开删除会话确认弹窗
function handleDeleteSessionWithConfirm(sessionCode: string): void {
  const session = sessions.value.find(s => s.sessionCode === sessionCode)
  deletingSessionCode.value = sessionCode
  deletingSessionTitle.value = session?.title || '未命名会话'
  showDeleteModal.value = true
}

// 确认删除会话
async function handleConfirmDelete(): Promise<void> {
  if (!deletingSessionCode.value) return

  try {
    await handleDeleteSession(deletingSessionCode.value)
    showDeleteModal.value = false
  } catch (error) {
    console.error('删除会话失败:', error)
  }
}

// 确认会话操作(新建或编辑)
async function handleConfirmSession(data: { title?: string; rules?: string }): Promise<void> {
  try {
    if (isEditMode.value && editingSessionCode.value) {
      // 编辑模式
      await handleUpdateSession(editingSessionCode.value, {
        title: data.title,
        rules: data.rules
      })
    } else {
      // 新建模式
      await handleCreateSession({
        comfyuiServerId: serviceId,
        title: data.title,
        rules: data.rules
      })
    }
    showSessionModal.value = false
  } catch (error) {
    // 错误已在handleCreateSession/handleUpdateSession中处理
    console.error('会话操作失败:', error)
  }
}

function handleGoBack(): void {
  router.push('/services')
}

// MCP 配置变更处理
async function handleMcpConfigChange(): Promise<void> {
  try {
    console.log('[WorkflowEditor] MCP 配置已变更')
    toast.success('MCP 配置已更新')
  } catch (error) {
    console.error('[WorkflowEditor] MCP 配置变更处理失败:', error)
    toast.error('配置更新失败')
  }
}

// 关闭对话框
function handleCloseChat(): void {
  hideChat()
  unselectSession()
}

// 刷新消息列表
async function handleRefreshMessages(): Promise<void> {
  if (!currentSessionCode.value) return

  try {
    console.log('[WorkflowEditor] 刷新消息列表')
    // 重新加载当前会话的消息
    await selectSession(currentSessionCode.value)
  } catch (error) {
    console.error('[WorkflowEditor] 刷新消息失败:', error)
  }
}

// 工作流相关方法
async function handleSelectWorkflow(workflowId: string): Promise<void> {
  try {
    currentWorkflowId.value = workflowId
    await workflowStore.fetchWorkflowById(workflowId)
    await workflowStore.fetchWorkflowContent(workflowId)

    // 加载工作流内容到编辑器
    const content = workflowStore.currentWorkflowContent || '{}'
    editableJsonContent.value = content
    originalContent.value = content

    // 切换工作流时重置历史记录
    resetHistory()

    // 将初始内容推入历史栈
    pushHistory(content)

    // 只有在 iframe 连接成功时才加载到 ComfyUI
    if (isIframeConnected.value) {
      await loadWorkflowInComfyUI(content)
    }

    toast.success('工作流已加载')
  } catch (error) {
    console.error('加载工作流失败:', error)
    toast.error('加载工作流失败')
  }
}

async function handleConfirmCreateWorkflow(name: string, description?: string): Promise<void> {
  try {
    if (!currentService.value) {
      toast.error('请先选择服务')
      return
    }

    const workflow = await workflowStore.createNewWorkflow({
      workflowName: name,
      description,
      comfyuiServerId: currentService.value.id,
      comfyuiServerKey: currentService.value.serverKey
    })

    showCreateModal.value = false
    await handleSelectWorkflow(workflow.id)
    toast.success('工作流创建成功')
  } catch (error) {
    console.error('创建工作流失败:', error)
    toast.error('创建工作流失败')
  }
}

async function handleSaveWorkflow(): Promise<void> {
  try {
    if (!currentWorkflowId.value) {
      toast.error('请先选择工作流')
      return
    }

    // 只有在 iframe 连接成功时才从 ComfyUI 获取最新内容
    if (isIframeConnected.value) {
      await new Promise<void>((resolve) => {
        fetchWorkflowFromIframe()
          .then(content => {
            pendingWorkflowContent.value = content
            resolve()
          })
          .catch(() => {
            resolve() // 即使失败也继续
          })
      })
    }

    // 使用待保存内容或当前编辑内容
    const content = pendingWorkflowContent.value || editableJsonContent.value

    // 保存到后端
    await workflowStore.saveWorkflowContent(
      currentWorkflowId.value,
      content
    )

    // 更新本地状态
    originalContent.value = content
    editableJsonContent.value = content
    pendingWorkflowContent.value = content

    // 保存后不重置历史记录，只更新 originalContent
    // 用户仍然可以撤销到保存之前的状态

    toast.success('工作流已保存')
  } catch (error) {
    console.error('保存工作流失败:', error)
    toast.error('保存工作流失败')
  }
}

// 撤销操作
async function handleUndo(): Promise<void> {
  const previousContent = undo()

  if (previousContent === null) {
    console.warn('[WorkflowEditor] 撤销失败：无法获取历史内容')
    return
  }

  // 在 nextTick 之后更新内容，确保 isApplyingHistory 标志已经设置
  await nextTick()

  // 更新编辑器内容
  editableJsonContent.value = previousContent

  // 如果 iframe 连接成功，直接设置工作流内容（不创建新标签页）
  if (isIframeConnected.value && comfyUIIntegration.comfyuiFrame.value?.contentWindow) {
    try {
      const workflowData = JSON.parse(previousContent)
      // 直接发送 set-workflow 消息，不创建新标签页
      comfyUIIntegration.comfyuiFrame.value.contentWindow.postMessage(
        {
          type: 'comfy-pilot:set-workflow',
          payload: workflowData,
          requestId: `undo_${Date.now()}_${Math.random()}`
        },
        '*'
      )
    } catch (error) {
      console.error('同步撤销内容到 ComfyUI 失败:', error)
    }
  }
}

// 回退撤销操作
async function handleRedo(): Promise<void> {
  const nextContent = redo()

  if (nextContent === null) {
    console.warn('[WorkflowEditor] 回退撤销失败：无法获取历史内容')
    return
  }

  // 在 nextTick 之后更新内容，确保 isApplyingHistory 标志已经设置
  await nextTick()

  // 更新编辑器内容
  editableJsonContent.value = nextContent

  // 如果 iframe 连接成功，直接设置工作流内容（不创建新标签页）
  if (isIframeConnected.value && comfyUIIntegration.comfyuiFrame.value?.contentWindow) {
    try {
      const workflowData = JSON.parse(nextContent)
      // 直接发送 set-workflow 消息，不创建新标签页
      comfyUIIntegration.comfyuiFrame.value.contentWindow.postMessage(
        {
          type: 'comfy-pilot:set-workflow',
          payload: workflowData,
          requestId: `redo_${Date.now()}_${Math.random()}`
        },
        '*'
      )
    } catch (error) {
      console.error('同步回退撤销内容到 ComfyUI 失败:', error)
    }
  }
}

// 启动定时同步
function startAutoSync(): void {
  stopAutoSync()
  syncTimer = window.setInterval(() => {
    if (currentWorkflowId.value && currentView.value === 'comfyui') {
      fetchWorkflowFromIframe()
        .then(content => {
          // 更新待保存内容
          pendingWorkflowContent.value = content
          // 同时更新可编辑内容，以便 hasUnsavedChanges 能正确计算
          editableJsonContent.value = content
        })
        .catch(() => {
          // 忽略错误
        })
    }
  }, 1000) // 每1秒同步一次
}

// 停止定时同步
function stopAutoSync(): void {
  if (syncTimer !== null) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}


// 生命周期钩子
onMounted(async () => {
  try {
    // 注册 ComfyUI 工具集
    const comfyUIToolSet = new ComfyUIToolSet(comfyUIIntegration, serviceStore)
    mcpToolRegistry.registerToolSet(comfyUIToolSet)

    // 确保工具集配置存在（默认启用）
    const existingConfig = mcpConfigManager.getToolSetConfig(comfyUIToolSet.id)
    if (!existingConfig) {
      mcpConfigManager.updateToolSetConfig(comfyUIToolSet.id, {
        enabled: true,
        executionPolicy: 'ask-every-time'
      })
    }

    console.log('[WorkflowEditor] ComfyUI 工具集已注册')

    // 加载服务列表并选择当前服务
    await serviceStore.fetchEnabledServices()
    serviceStore.selectService(serviceId)

    // 初始化用户 Agent 配置
    await userAgentConfigStore.initData()

    // 加载会话列表
    await loadSessions()

    // 加载工作流列表
    await workflowStore.fetchWorkflows({
      comfyuiServerId: serviceId
    })

    // 连接 iframe ref (等待 WorkflowViewer 挂载)
    await nextTick()
    if (workflowViewerRef.value?.comfyuiFrame) {
      setComfyuiFrame(workflowViewerRef.value.comfyuiFrame)

      // 尝试检测 iframe 连接状态
      console.log('[WorkflowEditor] 开始检测 ComfyUI 连接...')
      const connected = await checkIframeConnection()

      if (connected) {
        console.log('[WorkflowEditor] ComfyUI 连接成功，启动定时同步')
        // 启动定时同步
        startAutoSync()
      } else {
        console.log('[WorkflowEditor] ComfyUI 连接失败，使用默认展示')
      }
    }
  } catch (error) {
    console.error('初始化失败:', error)
    toast.error('初始化失败')
  }
})

// 清理
onUnmounted(() => {
  stopAutoSync()
})
</script>

<style scoped lang="scss">
// 页面级样式
.g-workflow-editor {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  overflow: hidden;
}

// 编辑器容器
.m-editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 主工作区域
.m-main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
