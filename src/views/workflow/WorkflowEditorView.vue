<template>
  <div class="g-workflow-editor">
    <!-- 顶部导航栏 -->
    <TopNavBar />

    <div class="m-editor-container">
      <!-- 左侧会话管理区域 -->
      <SessionSidebar
        :sessions="sessions"
        :current-session-code="currentSessionCode"
        @create-session="handleCreateSession"
        @select-session="handleSelectSession"
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
          @create-workflow="showCreateModal = true"
          @select-workflow="handleSelectWorkflow"
          @save-workflow="handleSaveWorkflow"
          @execute-workflow="handleExecuteWorkflow"
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
          :messages="messages"
          @toggle-minimize="toggleMinimize"
          @send-message="handleSendMessage"
        />
      </div>
    </div>

    <!-- 创建工作流弹窗 -->
    <CreateWorkflowModal
      :visible="showCreateModal"
      @close="showCreateModal = false"
      @confirm="handleConfirmCreateWorkflow"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
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

// Composables 导入
import { useSessionManagement } from '@/composables/workflow/useSessionManagement'
import { useChatDialog } from '@/composables/workflow/useChatDialog'
import { useComfyUIIntegration } from '@/composables/workflow/useComfyUIIntegration'

// Store 导入
import { useWorkflowStore } from '@/stores/workflow'
import { useServiceStore } from '@/stores/service'

// 类型导入
import type { Workflow } from '@/types/workflow'

// 路由和 Store
const route = useRoute()
const router = useRouter()
const workflowStore = useWorkflowStore()
const serviceStore = useServiceStore()

// 从路由获取服务 ID
const serviceId = route.params.serviceId as string

// 初始化 Composables
const sessionManagement = useSessionManagement(serviceId)
const chatDialog = useChatDialog()
const comfyUIIntegration = useComfyUIIntegration()

// 从 sessionManagement 解构状态和方法
const {
  sessions,
  currentSessionCode,
  currentSession,
  messages,
  loadSessions,
  selectSession,
  handleCreateSession
} = sessionManagement

// 从 chatDialog 解构状态和方法
const {
  isChatVisible,
  isChatMinimized,
  toggleMinimize,
  showChat,
  handleSendMessage: sendMessageToChat
} = chatDialog

// 从 comfyUIIntegration 解构状态和方法
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
  executeWorkflow,
  copyJsonToClipboard,
  formatJson,
  handleJsonValidate,
  handleViewToggleMouseDown
} = comfyUIIntegration

// 本地状态
const showCreateModal = ref(false)
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

// 会话相关方法
async function handleSelectSession(sessionCode: string): Promise<void> {
  await selectSession(sessionCode)
  showChat()
}

function handleGoBack(): void {
  router.push('/services')
}

// 消息发送包装函数
async function handleSendMessage(content: string): Promise<void> {
  if (!currentSessionCode.value) {
    toast.error('请先选择会话')
    return
  }
  await sendMessageToChat(currentSessionCode.value, content, messages.value)
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

    // 加载到 ComfyUI iframe
    await loadWorkflowInComfyUI(content)

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

    // 从 ComfyUI 获取最新内容并等待
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

    toast.success('工作流已保存')
  } catch (error) {
    console.error('保存工作流失败:', error)
    toast.error('保存工作流失败')
  }
}

// 显示输出文件
function showOutputFiles(outputs: Record<string, any>): void {
  const filesByType = {
    images: [] as string[],
    videos: [] as string[],
    gifs: [] as string[],
    audio: [] as string[]
  }

  // 收集所有输出文件
  for (const nodeOutput of Object.values(outputs)) {
    const output = nodeOutput as any

    // 收集图片
    if (output.images && Array.isArray(output.images)) {
      output.images.forEach((img: any) => {
        if (img.fullUrl) {
          filesByType.images.push(img.fullUrl)
        }
      })
    }

    // 收集视频
    if (output.videos && Array.isArray(output.videos)) {
      output.videos.forEach((video: any) => {
        if (video.fullUrl) {
          filesByType.videos.push(video.fullUrl)
        }
      })
    }

    // 收集 GIF
    if (output.gifs && Array.isArray(output.gifs)) {
      output.gifs.forEach((gif: any) => {
        if (gif.fullUrl) {
          filesByType.gifs.push(gif.fullUrl)
        }
      })
    }

    // 收集音频
    if (output.audio && Array.isArray(output.audio)) {
      output.audio.forEach((audio: any) => {
        if (audio.fullUrl) {
          filesByType.audio.push(audio.fullUrl)
        }
      })
    }
  }

  // 构建提示消息
  const messages: string[] = []

  if (filesByType.images.length > 0) {
    messages.push(`🖼️ 图片 (${filesByType.images.length})`)
    filesByType.images.forEach((url, index) => {
      messages.push(`  ${index + 1}. ${url}`)
    })
  }

  if (filesByType.videos.length > 0) {
    messages.push(`🎬 视频 (${filesByType.videos.length})`)
    filesByType.videos.forEach((url, index) => {
      messages.push(`  ${index + 1}. ${url}`)
    })
  }

  if (filesByType.gifs.length > 0) {
    messages.push(`🎞️ GIF (${filesByType.gifs.length})`)
    filesByType.gifs.forEach((url, index) => {
      messages.push(`  ${index + 1}. ${url}`)
    })
  }

  if (filesByType.audio.length > 0) {
    messages.push(`🎵 音频 (${filesByType.audio.length})`)
    filesByType.audio.forEach((url, index) => {
      messages.push(`  ${index + 1}. ${url}`)
    })
  }

  // 显示提示
  if (messages.length > 0) {
    const message = messages.join('\n')
    // 使用较长的持续时间显示
    toast.success(message)
    console.log('📁 输出文件列表:\n' + message)
  } else {
    toast.info('工作流执行成功，但没有生成输出文件')
  }
}

// 运行工作流
async function handleExecuteWorkflow(): Promise<void> {
  try {
    if (!currentWorkflowId.value) {
      toast.error('请先选择工作流')
      return
    }

    if (!currentService.value) {
      toast.error('ComfyUI 服务未连接')
      return
    }

    // 执行工作流，传入 ComfyUI 服务地址
    const result = await executeWorkflow(currentService.value.baseUrl)

    // 在控制台打印执行结果
    console.log('=== 工作流执行结果 ===')
    console.log('完整结果对象:', JSON.stringify(result))
    console.log('执行状态:', result.success ? '成功' : '失败')
    console.log('Prompt ID:', result.promptId)

    if (result.success) {
      // 执行成功
      toast.success(`工作流执行成功 (Prompt ID: ${result.promptId})`)

      // 检查是否有输出数据
      if (result.outputs && result.outputs.outputs) {
        console.log('执行输出:', result.outputs)

        // 显示输出文件
        showOutputFiles(result.outputs.outputs)
      } else if (result.outputError) {
        // 执行成功但获取输出失败
        console.warn('获取输出失败:', result.outputError)
        console.log('可以稍后使用 Prompt ID 手动查询:', result.promptId)
      } else {
        // 执行成功但没有输出
        console.log('工作流执行成功，但没有输出数据')
      }
    } else {
      // 执行失败
      console.error('执行错误:', result.error)
      toast.error(`工作流执行失败: ${result.error || '未知错误'}`)
    }
  } catch (error) {
    console.error('运行工作流失败:', error)
    toast.error('运行工作流失败')
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
    // 加载服务列表并选择当前服务
    await serviceStore.fetchEnabledServices()
    serviceStore.selectService(serviceId)

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
    }

    // 启动定时同步
    startAutoSync()
  } catch (error) {
    console.error('初始化失败:', error)
    toast.error('初始化失败')
  }
})

// 监听工作流内容变化
watch(
  () => editableJsonContent.value,
  (newContent) => {
    if (currentView.value === 'json' && isJsonValid.value) {
      // JSON 视图中内容变化时，标记为未保存
      // 实际同步会在切换回 ComfyUI 视图时进行
    }
  }
)

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
