<template>
  <div class="g-workflow-editor">
    <!-- 顶部导航栏 -->
    <TopNavBar />

    <div class="m-editor-container">
      <!-- 左侧会话管理区域 -->
      <div class="m-session-sidebar">
        <div class="f-session-header">
          <h2 class="f-session-title">
            <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            <span>Agent 会话</span>
          </h2>
          <button class="f-new-session-btn" @click="handleCreateSession">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            <span>新建会话</span>
          </button>
        </div>

        <div class="f-session-list">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="f-session-item"
            :class="{ active: currentSessionCode === session.sessionCode }"
            @click="handleSelectSession(session.sessionCode)"
          >
            <div class="f-session-header">
              <span class="f-status-dot" :class="{ idle: session.status !== 'ACTIVE' }"></span>
              <span class="f-session-name">{{ session.title || '未命名会话' }}</span>
            </div>
            <div class="f-session-meta">
              <div class="f-meta-row">
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{{ formatTime(session.updateTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="f-session-footer">
          <button class="f-back-btn" @click="handleGoBack">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            <span>返回服务选择</span>
          </button>
        </div>
      </div>

      <!-- 主工作区域 -->
      <div class="m-main-workspace">
        <!-- 工具栏 -->
        <div class="f-toolbar">
          <div class="f-toolbar-left">
            <button class="f-toolbar-btn" @click="handleCreateWorkflow">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              <span>新建</span>
            </button>

            <!-- 工作流选择器 -->
            <div class="f-workflow-selector" :class="{ active: showWorkflowDropdown }">
              <button class="f-workflow-btn" @click="toggleWorkflowDropdown">
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
                </svg>
                <span>{{ currentWorkflow?.workflowName || '选择工作流' }}</span>
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>

              <div v-if="showWorkflowDropdown" class="f-workflow-dropdown">
                <!-- 空状态提示 -->
                <div v-if="workflows.length === 0" class="f-dropdown-empty">
                  <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                  <div class="f-empty-text">暂无工作流</div>
                  <div class="f-empty-hint">点击"新建"按钮创建工作流</div>
                </div>

                <!-- 工作流列表 -->
                <div
                  v-for="workflow in workflows"
                  :key="workflow.id"
                  class="f-dropdown-item"
                  :class="{ active: currentWorkflowId === workflow.id }"
                  @click="handleSelectWorkflow(workflow.id)"
                >
                  <div class="f-workflow-name">{{ workflow.workflowName }}</div>
                  <div class="f-workflow-meta">
                    <span>{{ formatTime(workflow.updateTime) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="f-service-indicator" :class="{ error: !isServiceAvailable }">
              <span class="f-service-dot" :class="{ error: !isServiceAvailable }"></span>
              <span>{{ isServiceAvailable ? (currentService?.serverName || 'ComfyUI 服务') : 'ComfyUI 服务不可用' }}</span>
            </div>

            <div class="f-workflow-status" :class="{ saved: !hasUnsavedChanges, unsaved: hasUnsavedChanges }">
              <svg v-if="!hasUnsavedChanges" class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              <svg v-else class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              <span>{{ hasUnsavedChanges ? '有未保存的修改' : '已保存' }}</span>
            </div>

            <button class="f-toolbar-btn primary" :disabled="!hasUnsavedChanges" @click="handleSaveWorkflow">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
              </svg>
              <span>保存</span>
            </button>
          </div>

          <div class="f-toolbar-right">
            <div class="f-status-indicator">
              <div class="f-status-dot" :class="{ locked: isWorkflowLocked }"></div>
              <span>{{ isWorkflowLocked ? 'Agent 编辑中' : '就绪' }}</span>
            </div>
          </div>
        </div>

        <!-- ComfyUI 容器 -->
        <div class="f-comfyui-container" :class="{ locked: isWorkflowLocked }">
          <!-- 视图切换按钮 -->
          <div class="f-view-toggle">
            <button
              class="f-view-btn"
              :class="{ active: currentView === 'comfyui' }"
              @click="switchView('comfyui')"
            >
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <span>ComfyUI 视图</span>
            </button>
            <button
              class="f-view-btn"
              :class="{ active: currentView === 'json' }"
              @click="switchView('json')"
            >
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
              </svg>
              <span>JSON 原型</span>
            </button>
          </div>

          <!-- ComfyUI 视图 -->
          <div v-show="currentView === 'comfyui'" class="f-comfyui-view">
            <iframe
              ref="comfyuiFrame"
              class="f-comfyui-iframe"
              :src="comfyuiUrl"
            ></iframe>
          </div>

          <!-- JSON 视图 -->
          <div v-show="currentView === 'json'" class="f-json-view">
            <div class="f-json-header">
              <div class="f-json-title">工作流 JSON 原型</div>
              <button class="f-json-copy-btn" @click="handleCopyJson">
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                <span>复制 JSON</span>
              </button>
            </div>
            <pre class="f-json-content">{{ workflowJsonContent }}</pre>
          </div>

          <!-- 锁定遮罩 -->
          <div v-if="isWorkflowLocked" class="f-lock-overlay">
            <div class="f-lock-icon">
              <svg class="f-icon f-icon-xl" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
            <div class="f-lock-text">Agent 正在编辑工作流...</div>
            <div class="f-lock-hint">请稍候，编辑完成后将自动解锁</div>
          </div>
        </div>

        <!-- 创建工作流弹窗 -->
        <div v-if="showCreateWorkflowModal" class="f-modal-overlay" @click.self="showCreateWorkflowModal = false">
          <div class="f-modal">
            <div class="f-modal-header">
              <h3>新建工作流</h3>
              <button class="f-close-btn" @click="showCreateWorkflowModal = false">×</button>
            </div>
            <div class="f-modal-body">
              <div class="f-form-group">
                <label>工作流名称 *</label>
                <input v-model="newWorkflowName" type="text" placeholder="请输入工作流名称" />
              </div>
              <div class="f-form-group">
                <label>描述</label>
                <textarea v-model="newWorkflowDescription" placeholder="请输入工作流描述（可选）" rows="3"></textarea>
              </div>
            </div>
            <div class="f-modal-footer">
              <button class="f-modal-btn" @click="showCreateWorkflowModal = false">取消</button>
              <button class="f-modal-btn primary" :disabled="!newWorkflowName.trim()" @click="handleConfirmCreateWorkflow">创建</button>
            </div>
          </div>
        </div>

        <!-- Agent 对话框 -->
        <div v-if="currentSessionCode" class="f-chat-dialog" :class="{ minimized: isChatMinimized }">
          <div class="f-chat-header">
            <div class="f-chat-title">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
              </svg>
              <span>{{ currentSession?.title || '会话' }}</span>
            </div>
            <div class="f-chat-controls">
              <button class="f-control-btn" @click="toggleChatMinimize">−</button>
            </div>
          </div>

          <div v-show="!isChatMinimized" class="f-chat-messages" ref="chatMessages">
            <div
              v-for="message in messages"
              :key="message.id"
              class="f-message"
              :class="{ user: message.role === 'USER' }"
            >
              <div class="f-avatar">{{ message.role === 'USER' ? 'U' : 'AI' }}</div>
              <div class="f-message-content">{{ message.content }}</div>
            </div>
          </div>

          <div v-show="!isChatMinimized" class="f-chat-input">
            <input
              v-model="chatInput"
              type="text"
              placeholder="输入你的需求..."
              @keypress.enter="handleSendMessage"
            />
            <button class="f-send-btn" :disabled="!chatInput.trim()" @click="handleSendMessage">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TopNavBar from '@/components/user/TopNavBar.vue'
import { listWorkflows, getWorkflowById, createWorkflow, getWorkflowContent, saveWorkflowContent } from '@/services/workflow'
import { listActiveSessions, getSessionByCode, getSessionMessages, createSession } from '@/services/session'
import { getServerById } from '@/services/service'
import { WebSocketClient } from '@/utils/websocket'
import { toast } from '@/utils/toast'
import { compareWorkflowContent } from '@/utils/workflow-compare'
import type { Workflow } from '@/types/workflow'
import type { ChatSession, ChatMessage } from '@/types/session'
import type { ComfyUIService } from '@/types/service'

// 路由
const route = useRoute()
const router = useRouter()

// 服务ID（从路由参数获取）
const serviceId = ref<string>(route.params.serviceId as string)

// 当前服务信息
const currentService = ref<ComfyUIService | null>(null)

// 会话相关状态
const sessions = ref<ChatSession[]>([])
const currentSessionCode = ref<string | null>(null)
const currentSession = ref<ChatSession | null>(null)
const messages = ref<ChatMessage[]>([])
const chatInput = ref('')
const isChatMinimized = ref(false)

// 工作流相关状态
const workflows = ref<Workflow[]>([])
const currentWorkflowId = ref<string | null>(null)
const currentWorkflow = ref<Workflow | null>(null)
const savedWorkflowContent = ref('') // 已保存的工作流内容
const pendingWorkflowContent = ref('') // 待保存的工作流内容
const workflowJsonContent = computed(() => pendingWorkflowContent.value) // JSON视图显示待保存内容

// 工作流变更检测（使用深度对象比较，忽略特定字段）
const hasUnsavedChanges = computed(() => {
  if (!currentWorkflowId.value) {
    // 当前为加载工作流
    return false;
  }
  return !compareWorkflowContent(
    savedWorkflowContent.value,
    pendingWorkflowContent.value,
    (path) => {
      // 忽略 extra.ds.offset
      if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'offset') {
        return true
      }

      // 忽略 extra.ds.scale
      if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'scale') {
        return true
      }

      // 忽略 nodes[*].properties["Node name for S&R"]
      if (path.length >= 4 && path[0] === 'nodes' && path[2] === 'properties' && path[3] === 'Node name for S&R') {
        return true
      }

      return false
    }
  )
})

const isWorkflowLocked = ref(false)

// UI状态
const showWorkflowDropdown = ref(false)
const currentView = ref<'comfyui' | 'json'>('comfyui')
const showCreateWorkflowModal = ref(false)
const newWorkflowName = ref('')
const newWorkflowDescription = ref('')
const isServiceAvailable = ref(true)

// WebSocket客户端
let wsClient: WebSocketClient | null = null

// ComfyUI iframe引用
const comfyuiFrame = ref<HTMLIFrameElement | null>(null)
const chatMessages = ref<HTMLDivElement | null>(null)

// 定时同步定时器
let syncTimer: number | null = null

// 计算ComfyUI URL
const comfyuiUrl = computed(() => {
  if (!currentService.value) return ''
  return currentService.value.baseUrl
})

// 格式化时间
function formatTime(time: string): string {
  const now = new Date()
  const target = new Date(time)
  const diff = now.getTime() - target.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return target.toLocaleDateString()
}

// 加载服务信息
async function loadServiceInfo(): Promise<void> {
  try {
    console.log("初始化加载服务信息");
    currentService.value = await getServerById(serviceId.value)

    // 等待 iframe 加载
    await nextTick()
    if (comfyuiFrame.value) {
      comfyuiFrame.value.onerror = () => {
        isServiceAvailable.value = false
        toast.error('ComfyUI 服务连接失败')
      }
    }
  } catch (error) {
    console.error('加载服务信息失败:', error)
    toast.error('加载服务信息失败')
  }
}

// 加载会话列表
async function loadSessions(): Promise<void> {
  try {
    sessions.value = await listActiveSessions(serviceId.value)
  } catch (error) {
    console.error('加载会话列表失败:', error)
    toast.error('加载会话列表失败')
  }
}

// 加载工作流列表
async function loadWorkflows(): Promise<void> {
  try {
    workflows.value = await listWorkflows({ comfyuiServerId: serviceId.value })
  } catch (error) {
    console.error('加载工作流列表失败:', error)
    toast.error('加载工作流列表失败')
  }
}

// 选择会话
async function handleSelectSession(sessionCode: string): Promise<void> {
  if (currentSessionCode.value === sessionCode) return

  // 断开旧的WebSocket连接
  if (wsClient) {
    wsClient.close()
    wsClient = null
  }

  currentSessionCode.value = sessionCode

  try {
    // 加载会话详情和消息
    currentSession.value = await getSessionByCode(sessionCode)
    messages.value = await getSessionMessages(sessionCode)

    // 滚动到底部
    await nextTick()
    scrollToBottom()

    // 建立WebSocket连接
    connectWebSocket(sessionCode)
  } catch (error) {
    console.error('加载会话失败:', error)
    toast.error('加载会话失败')
  }
}

// 建立WebSocket连接
function connectWebSocket(sessionCode: string): void {
  wsClient = new WebSocketClient({
    sessionCode,
    onMessage: handleWebSocketMessage,
    onError: (error) => {
      console.error('WebSocket错误:', error)
    },
    onClose: () => {
      console.log('WebSocket连接已关闭')
    },
    onOpen: () => {
      console.log('WebSocket连接成功')
    }
  })

  wsClient.connect()
}

// 处理WebSocket消息
function handleWebSocketMessage(data: any): void {
  console.log('收到WebSocket消息:', data)
  // 根据消息类型处理
  // TODO: 实现具体的消息处理逻辑
}

// 选择工作流
async function handleSelectWorkflow(workflowId: string): Promise<void> {
  if (currentWorkflowId.value === workflowId) {
    showWorkflowDropdown.value = false
    return
  }

  currentWorkflowId.value = workflowId
  showWorkflowDropdown.value = false

  try {
    // 加载工作流信息和内容
    currentWorkflow.value = await getWorkflowById(workflowId)
    const content = await getWorkflowContent(workflowId)

    // 设置已保存内容和待保存内容
    savedWorkflowContent.value = content
    pendingWorkflowContent.value = content

    // 在 ComfyUI 中加载工作流
    await loadWorkflowInComfyUI(content)
  } catch (error) {
    console.error('加载工作流失败:', error)
    toast.error('加载工作流失败')
  }
}

// 切换工作流下拉菜单
function toggleWorkflowDropdown(): void {
  showWorkflowDropdown.value = !showWorkflowDropdown.value
}

// 在 ComfyUI 中加载工作流
async function loadWorkflowInComfyUI(content: string): Promise<void> {
  if (!comfyuiFrame.value?.contentWindow) {
    return
  }

  try {
    // 1. 创建新的工作流标签页    
    await sendComfyUIMessage('comfy-pilot:new-workflow', null)

    // 2. 如果内容不为空，设置工作流内容
    if (content && content.trim()) {
      const workflowData = JSON.parse(content)
      await sendComfyUIMessage('comfy-pilot:set-workflow', workflowData)
    }
  } catch (error) {
    console.error('加载工作流到 ComfyUI 失败:', error)
  }
}

// 发送消息到 ComfyUI 并等待响应
function sendComfyUIMessage(type: string, payload: any): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!comfyuiFrame.value?.contentWindow) {
      reject(new Error('ComfyUI iframe 未就绪'))
      return
    }

    const requestId = `req_${Date.now()}`

    comfyuiFrame.value.contentWindow.postMessage({
      type,
      payload,
      requestId
    }, '*')

    const handleMessage = (event: MessageEvent) => {
      const { requestId: resId, type: resType, payload: resPayload } = event.data || {}

      if (resId === requestId) {
        window.removeEventListener('message', handleMessage)
        if (resType?.includes('error')) {
          reject(new Error(resPayload?.message || '操作失败'))
        } else {
          resolve(resPayload)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    setTimeout(() => {
      window.removeEventListener('message', handleMessage)
      reject(new Error('操作超时'))
    }, 5000)
  })
}

// 切换视图
function switchView(view: 'comfyui' | 'json'): void {
  currentView.value = view
  if (view === 'json') {
    fetchWorkflowFromIframe()
  }
}

// 从 iframe 获取工作流内容（更新待保存内容）
function fetchWorkflowFromIframe(): void {
  if (!comfyuiFrame.value?.contentWindow) {
    return
  }

  try {
    const requestId = `req_${Date.now()}`

    comfyuiFrame.value.contentWindow.postMessage({
      type: 'comfy-pilot:get-workflow',
      requestId
    }, '*')

    const handleMessage = (event: MessageEvent) => {
      const { type, payload, requestId: resId } = event.data || {}

      if (resId === requestId) {
        if (type === 'comfy-pilot:workflow-data' && payload) {
          pendingWorkflowContent.value = JSON.stringify(payload, null, 2)
        }
        window.removeEventListener('message', handleMessage)
      }
    }

    window.addEventListener('message', handleMessage)

    setTimeout(() => {
      window.removeEventListener('message', handleMessage)
    }, 5000)
  } catch (error) {
    console.error('获取工作流内容失败:', error)
  }
}

// 处理 ComfyUI 主动推送的消息
function handleComfyUIMessage(event: MessageEvent): void {
  const { type, payload } = event.data || {}

  // 处理工作流内容变化事件
  if (type === 'comfy-pilot:workflow-graph-changed' && payload) {
    pendingWorkflowContent.value = JSON.stringify(payload, null, 2)
  }
}

// 创建会话
function handleCreateSession(): void {
  // TODO: 实现创建会话弹窗
  toast.info('创建会话功能待实现')
}

// 创建工作流
function handleCreateWorkflow(): void {
  showCreateWorkflowModal.value = true
  newWorkflowName.value = ''
  newWorkflowDescription.value = ''
}

// 确认创建工作流
async function handleConfirmCreateWorkflow(): Promise<void> {
  if (!newWorkflowName.value.trim() || !currentService.value) return

  try {
    const workflow = await createWorkflow({
      workflowName: newWorkflowName.value.trim(),
      description: newWorkflowDescription.value.trim() || undefined,
      comfyuiServerId: serviceId.value,
      comfyuiServerKey: currentService.value.serverKey
    })

    showCreateWorkflowModal.value = false
    toast.success('工作流创建成功')

    // 重新加载工作流列表
    await loadWorkflows()

    // 自动选择新创建的工作流
    await handleSelectWorkflow(workflow.id)
  } catch (error) {
    console.error('创建工作流失败:', error)
    toast.error('创建工作流失败')
  }
}

// 保存工作流
async function handleSaveWorkflow(): Promise<void> {
  if (!currentWorkflow.value) return

  try {
    // 先从 ComfyUI 获取最新内容并等待
    await new Promise<void>((resolve) => {
      fetchWorkflowFromIframe()
      setTimeout(resolve, 500)
    })

    // 手动保存
    await saveWorkflowContent(
      currentWorkflow.value.id,
      { content: pendingWorkflowContent.value }
    )

    // 更新已保存内容
    savedWorkflowContent.value = pendingWorkflowContent.value
    toast.success('工作流已保存')
  } catch (error) {
    console.error('保存工作流失败:', error)
    toast.error('保存工作流失败')
  }
}

// 复制JSON
function handleCopyJson(): void {
  if (!workflowJsonContent.value) {
    toast.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(workflowJsonContent.value)
    .then(() => {
      toast.success('JSON已复制到剪贴板')
    })
    .catch(() => {
      toast.error('复制失败')
    })
}

// 发送消息
function handleSendMessage(): void {
  if (!chatInput.value.trim() || !wsClient) return

  wsClient.send({
    type: 'message',
    content: chatInput.value
  })

  chatInput.value = ''
}

// 切换对话框最小化
function toggleChatMinimize(): void {
  isChatMinimized.value = !isChatMinimized.value
}

// 滚动到底部
function scrollToBottom(): void {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

// 返回服务选择页面
function handleGoBack(): void {
  router.push('/services')
}

// 启动定时同步
function startAutoSync(): void {
  stopAutoSync()
  syncTimer = window.setInterval(() => {
    if (currentWorkflow.value && currentView.value === 'comfyui') {
      fetchWorkflowFromIframe()
    }
  }, 3000) // 每3秒同步一次
}

// 停止定时同步
function stopAutoSync(): void {
  if (syncTimer !== null) {
    clearInterval(syncTimer)
    syncTimer = null
  }
}

// 初始化
onMounted(async () => {
  await loadServiceInfo()
  await loadSessions()
  await loadWorkflows()
  startAutoSync()

  // 注册全局消息监听器，接收 ComfyUI 主动推送
  window.addEventListener('message', handleComfyUIMessage)
})

// 清理
onUnmounted(() => {
  stopAutoSync()
  window.removeEventListener('message', handleComfyUIMessage)

  if (wsClient) {
    wsClient.close()
    wsClient = null
  }
})
</script>

<style scoped lang="scss">
// 基础布局
.g-workflow-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #cccccc;
  overflow: hidden;
}

.m-editor-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;

  &-lg {
    width: 20px;
    height: 20px;
  }

  &-xl {
    width: 48px;
    height: 48px;
  }
}

// 左侧会话管理区域
.m-session-sidebar {
  width: 280px;
  background: #282828;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #3a3a3a;
  z-index: 100;
}

.f-session-header {
  padding: 12px;
  border-bottom: 1px solid #3a3a3a;
  background: #242424;
}

.f-session-title {
  font-size: 13px;
  margin-bottom: 10px;
  color: #999999;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.f-new-session-btn {
  width: 100%;
  padding: 6px 10px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  color: #cccccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #454545;
    border-color: #555555;
    color: #ffffff;
  }
}

.f-session-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.f-session-item {
  padding: 10px;
  margin-bottom: 4px;
  background: #2a2a2a;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    background: #333333;
    border-color: #3a3a3a;
  }

  &.active {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }
}

.f-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  flex-shrink: 0;

  &.idle {
    background: #999999;
  }
}

.f-session-name {
  flex: 1;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #cccccc;
}

.f-session-item.active .f-session-name {
  color: #ffffff;
}

.f-session-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: #777777;
}

.f-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.f-session-footer {
  padding: 12px;
  border-top: 1px solid #444444;
}

.f-back-btn {
  width: 100%;
  padding: 8px 12px;
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}

// 主工作区域
.m-main-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 工具栏
.f-toolbar {
  background: #242424;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3a3a3a;
}

.f-toolbar-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.f-toolbar-btn {
  padding: 4px 10px;
  background: #2a2a2a;
  color: #999999;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    background: #333333;
    border-color: #4a4a4a;
    color: #cccccc;
  }

  &.primary {
    background: #3a3a3a;
    color: #cccccc;
    border-color: #4a4a4a;

    &:hover:not(:disabled) {
      background: #454545;
      border-color: #555555;
      color: #ffffff;
    }
  }

  &:disabled {
    background: #242424;
    color: #555555;
    cursor: not-allowed;
    border-color: #2a2a2a;
  }
}

.f-toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.f-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #cccccc;
}

.f-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;

  &.locked {
    background: #e74c3c;
    animation: pulse 1.5s infinite;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 工作流选择器
.f-workflow-selector {
  position: relative;

  &.active .f-workflow-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.f-workflow-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  color: #cccccc;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 180px;

  &:hover {
    background: #333333;
    border-color: #4a4a4a;
    color: #ffffff;
  }
}

.f-workflow-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #353535;
  border: 1px solid #444444;
  border-radius: 6px;
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.f-dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #999999;

  .f-icon {
    margin-bottom: 12px;
    opacity: 0.6;
  }

  .f-empty-text {
    font-size: 14px;
    color: #cccccc;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .f-empty-hint {
    font-size: 12px;
    color: #777777;
  }
}

.f-dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #444444;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #2a2a2a;
  }

  &.active {
    background: #4a9eff;
  }
}

.f-workflow-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 4px;
}

.f-workflow-meta {
  font-size: 11px;
  color: #999999;
}

.f-dropdown-item.active .f-workflow-meta {
  color: rgba(255, 255, 255, 0.8);
}

// 服务指示器
.f-service-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;
  color: #cccccc;

  &.error {
    border-color: #e74c3c;
    color: #e74c3c;
  }
}

.f-service-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  animation: pulse 2s infinite;

  &.error {
    background: #e74c3c;
  }
}

// 工作流状态
.f-workflow-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;

  &.saved {
    color: #27ae60;
    border-color: #27ae60;
  }

  &.unsaved {
    color: #f39c12;
    border-color: #f39c12;
  }
}

// ComfyUI 容器
.f-comfyui-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #252525;

  &.locked::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10;
    pointer-events: none;
  }
}

// 视图切换
.f-view-toggle {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  gap: 0;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.f-view-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  color: #999999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #cccccc;
    background: #333333;
  }

  &.active {
    background: #3a3a3a;
    color: #ffffff;
    border: 1px solid #4a4a4a;
  }
}

// ComfyUI 视图
.f-comfyui-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.f-empty-state {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 16px;
  gap: 16px;
}

.f-comfyui-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

// JSON 视图
.f-json-view {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  overflow: auto;
  padding: 20px;
}

.f-json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3a3a;
}

.f-json-title {
  font-size: 14px;
  color: #cccccc;
  font-weight: 500;
}

.f-json-copy-btn {
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #333333;
    border-color: #4a4a4a;
  }
}

.f-json-content {
  background: #252525;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-wrap: break-word;
}

// 锁定遮罩
.f-lock-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(231, 76, 60, 0.95);
  color: white;
  padding: 24px 40px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.f-lock-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.f-lock-text {
  margin-bottom: 8px;
}

.f-lock-hint {
  font-size: 12px;
  opacity: 0.9;
}

// Agent 对话框
.f-chat-dialog {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 380px;
  height: 520px;
  background: #282828;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 200;
  transition: all 0.2s ease;

  &.minimized {
    height: 48px;
  }
}

.f-chat-header {
  background: #242424;
  color: #cccccc;
  padding: 8px 10px;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
}

.f-chat-title {
  font-size: 12px;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  overflow: hidden;
}

.f-chat-controls {
  display: flex;
  gap: 4px;
}

.f-control-btn {
  background: transparent;
  border: none;
  color: #777777;
  width: 22px;
  height: 22px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover {
    background: #3a3a3a;
    color: #cccccc;
  }
}

.f-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #242424;
}

.f-message {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  animation: slideIn 0.2s ease;

  &.user {
    flex-direction: row-reverse;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.f-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-weight: 500;
  font-size: 11px;
  flex-shrink: 0;
}

.f-message.user .f-avatar {
  background: #4a4a4a;
  color: #cccccc;
}

.f-message-content {
  max-width: 75%;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #3a3a3a;
  font-size: 12px;
  line-height: 1.5;
  color: #cccccc;
}

.f-message.user .f-message-content {
  background: #3a3a3a;
  color: #cccccc;
  border-color: #4a4a4a;
}

.f-chat-input {
  padding: 10px;
  background: #242424;
  border-top: 1px solid #3a3a3a;
  border-radius: 0 0 4px 4px;
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 6px 10px;
    background: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 3px;
    font-size: 12px;
    color: #cccccc;
    outline: none;
    transition: border-color 0.15s;

    &:focus {
      border-color: #555555;
    }

    &::placeholder {
      color: #555555;
    }
  }
}

.f-send-btn {
  padding: 6px 14px;
  background: #3a3a3a;
  color: #cccccc;
  border: 1px solid #4a4a4a;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 400;
  font-size: 12px;
  transition: all 0.15s;

  &:hover {
    background: #454545;
    border-color: #555555;
    color: #ffffff;
  }

  &:disabled {
    background: #2a2a2a;
    color: #555555;
    cursor: not-allowed;
    border-color: #333333;
  }
}

// 模态框
.f-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.f-modal {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.f-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
  }
}

.f-close-btn {
  background: transparent;
  border: none;
  color: #777777;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #cccccc;
  }
}

.f-modal-body {
  padding: 20px;
}

.f-form-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #cccccc;
    font-weight: 400;
  }

  input,
  textarea {
    width: 100%;
    padding: 8px 12px;
    background: #1e1e1e;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    font-size: 13px;
    color: #cccccc;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;

    &:focus {
      border-color: #555555;
    }

    &::placeholder {
      color: #555555;
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
}

.f-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.f-modal-btn {
  padding: 8px 20px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #333333;
    border-color: #4a4a4a;
  }

  &.primary {
    background: #3a3a3a;
    border-color: #4a4a4a;

    &:hover:not(:disabled) {
      background: #454545;
      border-color: #555555;
      color: #ffffff;
    }
  }

  &:disabled {
    background: #242424;
    color: #555555;
    cursor: not-allowed;
    border-color: #2a2a2a;
  }
}
</style>
