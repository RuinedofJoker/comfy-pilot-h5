<template>
  <div
    v-if="visible"
    ref="chatDialog"
    class="f-chat-dialog"
    :class="{ minimized: isMinimized, dragging: isDragging, resizing: isResizing }"
    :style="{
      left: dialogPosition.x ? `${dialogPosition.x}px` : undefined,
      top: dialogPosition.y ? `${dialogPosition.y}px` : undefined,
      right: dialogPosition.x ? 'auto' : undefined,
      bottom: dialogPosition.y ? 'auto' : undefined,
      width: `${dialogSize.width}px`,
      height: isMinimized ? '48px' : `${dialogSize.height}px`
    }"
  >
    <div ref="chatHeader" class="f-chat-header" @mousedown="handleMouseDown">
      <div class="f-chat-title">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
        <span>{{ sessionTitle || '会话' }}</span>
      </div>
      <div class="f-chat-controls">
        <button class="f-control-btn" @click="$emit('toggle-minimize')" title="最小化">−</button>
        <button class="f-control-btn" @click="$emit('close')" title="关闭">×</button>
      </div>
    </div>

    <div v-show="!isMinimized" class="f-chat-messages" ref="chatMessages">
      <!-- 本地消息列表 - 简洁展示，类似终端输出 -->
      <template v-for="(message, index) in localMessages" :key="message.id">
        <!-- 用户消息 -->
        <div v-if="message.role === 'USER'" class="f-message-user">
          <div class="f-user-message-box">
            {{ getMessageDisplayContent(message) }}
          </div>
        </div>

        <!-- AI/系统消息 - 带小点和连接线 -->
        <div v-else class="f-message-assistant-wrapper">
          <div class="f-message-indicator">
            <div class="f-indicator-dot"></div>
            <div
              v-if="shouldShowConnectLine(index)"
              class="f-indicator-line"
            ></div>
          </div>
          <div class="f-message-assistant-content">
            {{ getMessageDisplayContent(message) }}
          </div>
        </div>
      </template>

      <!-- 当前流式输出的消息 -->
      <div v-if="isStreaming && currentStreamingMessage" class="f-message-assistant-wrapper">
        <div class="f-message-indicator">
          <div class="f-indicator-dot"></div>
        </div>
        <div class="f-message-assistant-content" :class="{ 'f-streaming': !isStreamComplete }">
          {{ currentStreamingMessage }}<span v-if="!isStreamComplete" class="f-cursor">▋</span>
        </div>
      </div>

      <!-- 动态提示指示器 -->
      <AgentPromptIndicator
        :visible="isShowingPrompt"
        :text="currentPromptMessage"
      />

      <!-- 附件预览区域 -->
      <div v-if="selectedFiles.length > 0" class="f-attachments-preview">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="f-attachment-item"
        >
          <!-- 图片预览 -->
          <div v-if="file.type === 'image'" class="f-attachment-preview">
            <img :src="getPreviewUrl(file)" alt="预览" class="f-preview-image" />
            <button class="f-attachment-remove-overlay" @click="removeAttachment(index)" title="移除">
              ×
            </button>
          </div>

          <!-- 视频预览 -->
          <div v-else-if="file.type === 'video'" class="f-attachment-preview">
            <video :src="getPreviewUrl(file)" class="f-preview-video"></video>
            <button class="f-attachment-remove-overlay" @click="removeAttachment(index)" title="移除">
              ×
            </button>
          </div>

          <!-- 其他文件类型 -->
          <div v-else class="f-attachment-file">
            <div class="f-file-icon">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
            </div>
            <div class="f-file-info">
              <span class="f-file-name">{{ getFileName(file) }}</span>
            </div>
            <button class="f-attachment-remove-btn" @click="removeAttachment(index)" title="移除">
              ×
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!isMinimized" class="f-chat-input">
      <button class="f-attach-btn" @click="handleAttachClick" title="添加附件">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
      </button>
      <input
        ref="fileInput"
        type="file"
        multiple
        style="display: none"
        @change="handleFileSelect"
      />
      <textarea
        ref="textareaRef"
        v-model="inputValue"
        placeholder="输入你的需求... (Shift+Enter 换行)"
        rows="1"
        @keydown="handleKeyDown"
        @input="adjustTextareaHeight"
      />
      <button class="f-send-btn" :disabled="!inputValue.trim()" @click="handleSend">
        发送
      </button>
    </div>

    <!-- 调整大小手柄 -->
    <div v-show="!isMinimized" class="f-resize-handles">
      <!-- 四个角 -->
      <div class="f-resize-handle f-resize-nw" @mousedown="handleResizeStart($event, 'nw')"></div>
      <div class="f-resize-handle f-resize-ne" @mousedown="handleResizeStart($event, 'ne')"></div>
      <div class="f-resize-handle f-resize-sw" @mousedown="handleResizeStart($event, 'sw')"></div>
      <div class="f-resize-handle f-resize-se" @mousedown="handleResizeStart($event, 'se')"></div>

      <!-- 四条边 -->
      <div class="f-resize-handle f-resize-n" @mousedown="handleResizeStart($event, 'n')"></div>
      <div class="f-resize-handle f-resize-s" @mousedown="handleResizeStart($event, 's')"></div>
      <div class="f-resize-handle f-resize-w" @mousedown="handleResizeStart($event, 'w')"></div>
      <div class="f-resize-handle f-resize-e" @mousedown="handleResizeStart($event, 'e')"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ChatMessage } from '@/types/session'
import type { ChatContent } from '@/types/chat-content'
import { AgentWebSocketManager } from '@/utils/websocket'
import { useAuthStore } from '@/stores/auth'
import { AGENT_PROMPT_DEFAULT_MESSAGES } from '@/types/websocket'
import type { AgentToolCallRequestData, AgentPromptType } from '@/types/websocket'
import { uploadFile } from '@/services/file'
import * as FileContentUtil from '@/utils/file-content'
import { toast } from '@/utils/toast'
import { mcpToolRegistry, mcpConfigManager } from '@/mcp'
import type { ToolExecutionPolicy } from '@/mcp/types'
import AgentPromptIndicator from './AgentPromptIndicator.vue'

// Props
interface Props {
  visible: boolean
  isMinimized: boolean
  sessionTitle: string | null
  sessionCode: string | null
  messages: ChatMessage[]
  workflowContent: string
  isServiceAvailable: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'toggle-minimize': []
  'close': []
  'send-message': [content: string, attachments?: ChatContent[]]
  'refresh-messages': [] // 新增：请求刷新消息列表
}>()

// Auth Store
const authStore = useAuthStore()

// 本地状态
const inputValue = ref('')
const chatMessages = ref<HTMLDivElement | null>(null)
const chatDialog = ref<HTMLDivElement | null>(null)
const chatHeader = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedFiles = ref<ChatContent[]>([])

// 本地消息列表（包含历史消息 + 新消息）
const localMessages = ref<ChatMessage[]>([])

// WebSocket 管理器
let wsManager: AgentWebSocketManager | null = null

// Agent 状态
const currentPromptType = ref<AgentPromptType | null>(null)
const currentPromptMessage = ref<string>('')
const isShowingPrompt = ref(false)

// 当前流式输出的消息
const currentStreamingMessage = ref<string>('')
const isStreaming = ref(false)
const isStreamComplete = ref(false) // 标记流式输出是否已完成

// 拖动相关状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogPosition = ref({ x: 0, y: 0 })

// 调整大小相关状态
const isResizing = ref(false)
const resizeDirection = ref<string>('')
const dialogSize = ref({ width: 480, height: 640 })
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeStartSize = ref({ width: 0, height: 0 })
const resizeStartPosition = ref({ x: 0, y: 0 })
// 保存清理函数的引用
let resizeCleanup: (() => void) | null = null

// 最小和最大尺寸限制
const MIN_WIDTH = 360
const MIN_HEIGHT = 480
const MAX_WIDTH = 1000
const MAX_HEIGHT = 900

/**
 * 初始化 WebSocket 连接
 */
function initWebSocket(sessionCode: string): void {
  // 先关闭旧连接
  disconnectWebSocket()

  const token = authStore.token
  if (!token) {
    console.error('[ChatDialog] 无法建立 WebSocket 连接：未找到 token')
    return
  }

  console.log(`[ChatDialog] 初始化 WebSocket 连接: ${sessionCode}`)
  wsManager = new AgentWebSocketManager(sessionCode, token)

  // 注册事件回调
  wsManager.on('prompt', (data) => {
    handlePromptEvent(data.promptType, data.message)
  })

  wsManager.on('stream', (content) => {
    handleStreamEvent(content)
  })

  wsManager.on('complete', () => {
    handleCompleteEvent()
  })

  wsManager.on('toolRequest', async (requestId, data) => {
    console.log('[ChatDialog] 工具调用请求:', { requestId, data })
    await handleToolCallRequest(requestId, data)
  })

  wsManager.on('error', (error) => {
    console.error('[ChatDialog] WebSocket 错误:', error)
    toast.error(`WebSocket 错误: ${error}`)
  })

  // 建立连接
  wsManager.connect()
}

/**
 * 断开 WebSocket 连接
 */
function disconnectWebSocket(): void {
  if (wsManager) {
    console.log('[ChatDialog] 断开 WebSocket 连接')
    wsManager.disconnect()
    wsManager = null
  }
}

/**
 * 处理 Prompt 事件
 */
function handlePromptEvent(promptType: AgentPromptType, message?: string): void {
  console.log('[ChatDialog] Agent 提示:', promptType, message)

  // ERROR 类型直接显示错误提示
  if (promptType === 'ERROR') {
    const errorMsg = message || AGENT_PROMPT_DEFAULT_MESSAGES[promptType]
    toast.error(errorMsg)
    isShowingPrompt.value = false
    return
  }

  // THINKING、TOOL_CALLING、SUMMARY 显示动态提示
  if (promptType === 'THINKING' || promptType === 'TOOL_CALLING' || promptType === 'SUMMARY') {
    currentPromptType.value = promptType
    currentPromptMessage.value = message || AGENT_PROMPT_DEFAULT_MESSAGES[promptType]
    isShowingPrompt.value = true
  } else {
    // 其他类型关闭动态提示
    isShowingPrompt.value = false
  }
}

/**
 * 处理流式输出事件
 */
function handleStreamEvent(content: string): void {
  // 关闭动态提示（如果有的话）
  if (isShowingPrompt.value) {
    isShowingPrompt.value = false
  }

  // 直接追加内容到当前流式消息
  currentStreamingMessage.value += content
  isStreaming.value = true
  isStreamComplete.value = false // 正在流式输出中
}

/**
 * 处理完成事件
 */
async function handleCompleteEvent(): Promise<void> {
  console.log('[ChatDialog] Agent 完成')
  isShowingPrompt.value = false

  // 如果有流式消息内容，添加到本地消息列表
  if (currentStreamingMessage.value) {
    const assistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`, // 临时 ID
      sessionId: props.sessionCode || '',
      role: 'ASSISTANT',
      content: currentStreamingMessage.value,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    localMessages.value.push(assistantMessage)

    // 滚动到底部
    await nextTick()
    scrollToBottom()
  }

  // 清空流式消息显示状态
  isStreaming.value = false
  isStreamComplete.value = false
  currentStreamingMessage.value = ''

  // 延迟刷新消息列表，与后端同步
  setTimeout(() => {
    emit('refresh-messages')
  }, 500)
}

/**
 * 处理工具调用请求
 */
async function handleToolCallRequest(requestId: string, data: AgentToolCallRequestData): Promise<void> {
  const { toolCallId, toolName, toolArgs, isClientTool } = data

  try {
    // 解析工具参数
    const args = JSON.parse(toolArgs)

    if (isClientTool) {
      // 前端工具：需要执行并返回结果
      await handleClientToolCall(requestId, toolCallId, toolName, args, toolArgs)
    } else {
      // 后端工具：仅做权限验证
      await handleServerToolCall(requestId, toolCallId, toolName, args, toolArgs)
    }
  } catch (error) {
    console.error('[ChatDialog] 工具调用处理失败:', error)
    toast.error('工具调用处理失败')
  }
}

/**
 * 处理前端工具调用
 */
async function handleClientToolCall(
  requestId: string,
  toolCallId: string,
  toolName: string,
  args: any,
  toolArgs: string
): Promise<void> {
  if (!wsManager || !props.sessionCode) return

  // 查找工具所属的工具集（异步）
  const toolSet = await mcpToolRegistry.findToolSetByToolName(toolName)
  if (!toolSet) {
    console.error(`[ChatDialog] 未找到工具: ${toolName}`)
    wsManager.sendToolResponse(requestId, toolCallId, toolName, toolArgs, true, false, undefined, false, '工具不存在')
    return
  }

  // 获取执行策略
  let executionPolicy: ToolExecutionPolicy
  if (toolSet.type === 'external-mcp') {
    // 外部 MCP 工具集使用全局执行策略
    executionPolicy = mcpConfigManager.getGlobalExecutionPolicy()
  } else {
    // 内置工具集使用各自的执行策略
    const config = mcpConfigManager.getToolSetConfig(toolSet.id)
    executionPolicy = config?.executionPolicy || 'ask-every-time'
  }

  // 根据执行策略决定是否需要用户确认
  let isAllow = false
  if (executionPolicy === 'auto-execute') {
    isAllow = true
  } else {
    // 显示确认对话框
    isAllow = await showToolConfirmDialog(toolName, args)
  }

  if (!isAllow) {
    // 用户拒绝执行
    wsManager.sendToolResponse(requestId, toolCallId, toolName, toolArgs, true, false)
    return
  }

  // 执行工具
  try {
    const executionResult = await mcpToolRegistry.executeToolByName(toolCallId, toolName, args)

    if (executionResult.success) {
      wsManager.sendToolResponse(
        requestId,
        toolCallId,
        toolName,
        toolArgs,
        true,
        true,
        JSON.stringify(executionResult.result),
        true
      )
    } else {
      wsManager.sendToolResponse(
        requestId,
        toolCallId,
        toolName,
        toolArgs,
        true,
        true,
        undefined,
        false,
        executionResult.error
      )
    }
  } catch (error) {
    wsManager.sendToolResponse(
      requestId,
      toolCallId,
      toolName,
      toolArgs,
      true,
      true,
      undefined,
      false,
      error instanceof Error ? error.message : '工具执行失败'
    )
  }
}

/**
 * 处理后端工具调用（仅权限验证）
 */
async function handleServerToolCall(
  requestId: string,
  toolCallId: string,
  toolName: string,
  args: any,
  toolArgs: string
): Promise<void> {
  if (!wsManager || !props.sessionCode) return

  // 显示确认对话框
  const isAllow = await showToolConfirmDialog(toolName, args)

  // 发送响应（仅包含 isAllow，不包含执行结果）
  wsManager.sendToolResponse(requestId, toolCallId, toolName, toolArgs, false, isAllow)
}

/**
 * 显示工具确认对话框
 */
async function showToolConfirmDialog(toolName: string, args: any): Promise<boolean> {
  // TODO: 实现一个更友好的确认对话框组件
  // 目前使用浏览器原生 confirm
  const argsStr = JSON.stringify(args, null, 2)
  return confirm(`是否允许执行工具？\n\n工具名称: ${toolName}\n参数:\n${argsStr}`)
}

/**
 * 处理文件列表，转换为 ChatContent 数组
 */
async function processFiles(files: File[]): Promise<ChatContent[]> {
  const contents: ChatContent[] = []
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

  for (const file of files) {
    const mimeType = FileContentUtil.getMimeType(file)
    const fileSize = FileContentUtil.getFileSize(file)

    // 文本类型：直接读取内容
    if (FileContentUtil.isText(mimeType)) {
      const text = await readFileAsText(file)
      contents.push({
        type: 'text',
        text
      })
      continue
    }

    // 图片类型
    if (FileContentUtil.isImage(mimeType)) {
      const content = await processMediaFile(file, 'image', mimeType, fileSize, MAX_SIZE, file.name)
      contents.push(content)
      continue
    }

    // 视频类型
    if (FileContentUtil.isVideo(mimeType)) {
      const content = await processMediaFile(file, 'video', mimeType, fileSize, MAX_SIZE, file.name)
      contents.push(content)
      continue
    }

    // 音频类型
    if (FileContentUtil.isAudio(mimeType)) {
      const content = await processMediaFile(file, 'audio', mimeType, fileSize, MAX_SIZE, file.name)
      contents.push(content)
      continue
    }

    // PDF 类型
    if (FileContentUtil.isPdf(mimeType)) {
      const content = await processMediaFile(file, 'pdfFile', mimeType, fileSize, MAX_SIZE, file.name)
      contents.push(content)
      continue
    }

    // 不支持的文件类型
    toast.warning(`不支持的文件类型: ${file.name}`)
  }

  return contents
}

/**
 * 读取文件为文本
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('读取文件失败'))
    reader.readAsText(file)
  })
}

/**
 * 处理媒体文件（图片/视频/音频/PDF）
 */
async function processMediaFile(
  file: File,
  type: 'image' | 'video' | 'audio' | 'pdfFile',
  mimeType: string,
  fileSize: number,
  maxSize: number,
  uploadFileName: string
): Promise<ChatContent> {
  // 文件大小超过 5MB，上传到服务器
  if (fileSize > maxSize) {
    const fileResource = await uploadFile(file)
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    const fullUrl = `${baseUrl}${fileResource.webPath}`

    return {
      type,
      isUseBase64: false,
      url: fullUrl,
      mimeType,
      uploadFileName
    } as ChatContent
  }

  // 文件大小小于等于 5MB，转换为 Base64
  const base64Data = await FileContentUtil.toBase64(file)
  return {
    type,
    isUseBase64: true,
    base64Data,
    mimeType,
    uploadFileName
  } as ChatContent
}

// 点击附件按钮
function handleAttachClick(): void {
  fileInput.value?.click()
}

// 文件选择处理
async function handleFileSelect(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  try {
    const contents = await processFiles(Array.from(files))
    selectedFiles.value = [...selectedFiles.value, ...contents]
    toast.success(`已选择 ${contents.length} 个文件`)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '文件处理失败')
  } finally {
    // 清空 input，允许重复选择同一文件
    target.value = ''
  }
}

// 获取预览 URL（用于图片和视频）
function getPreviewUrl(file: ChatContent): string {
  if (file.type === 'text') return ''

  if (file.isUseBase64 && file.base64Data) {
    return `data:${file.mimeType || 'application/octet-stream'};base64,${file.base64Data}`
  }

  return file.url || ''
}

// 获取文件名
function getFileName(file: ChatContent): string {
  if (file.type === 'text') {
    return '文本内容'
  }

  // 优先使用 uploadFileName
  if ('uploadFileName' in file && file.uploadFileName) {
    return file.uploadFileName
  }

  // 降级方案：根据类型显示
  const typeNames: Record<string, string> = {
    audio: '音频文件',
    pdfFile: 'PDF文件'
  }
  return typeNames[file.type] || '未知文件'
}

// 移除附件
function removeAttachment(index: number): void {
  selectedFiles.value.splice(index, 1)
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent): void {
  // Shift + Enter: 换行（默认行为，不做处理）
  if (event.shiftKey && event.key === 'Enter') {
    return
  }

  // 单独按 Enter: 发送消息
  if (event.key === 'Enter') {
    event.preventDefault() // 阻止默认的换行行为
    handleSend()
  }
}

// 自动调整 textarea 高度
function adjustTextareaHeight(): void {
  if (!textareaRef.value) return

  // 重置高度以获取正确的 scrollHeight
  textareaRef.value.style.height = 'auto'

  // 设置新高度（限制在最小和最大高度之间）
  const newHeight = Math.min(Math.max(textareaRef.value.scrollHeight, 36), 120)
  textareaRef.value.style.height = `${newHeight}px`
}

// 发送消息
async function handleSend(): Promise<void> {
  if (!inputValue.value.trim()) {
    toast.error('消息内容不能为空')
    return
  }

  if (!props.sessionCode) {
    toast.error('会话未就绪')
    return
  }

  if (!wsManager) {
    toast.error('WebSocket 连接未建立')
    return
  }

  const textContent = inputValue.value.trim()
  const attachmentContents = selectedFiles.value

  // 立即添加用户消息到本地列表
  const userMessage: ChatMessage = {
    id: `temp-user-${Date.now()}`, // 临时 ID
    sessionId: props.sessionCode || '', // 使用 sessionCode 作为临时 sessionId
    role: 'USER',
    content: textContent,
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  localMessages.value.push(userMessage)

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 收集已启用的工具 schemas（异步）
  let enabledToolSetIds = mcpConfigManager.getEnabledToolSetIds()

  // 如果 ComfyUI 服务不可用，过滤掉 ComfyUI 工具集
  if (!props.isServiceAvailable) {
    enabledToolSetIds = enabledToolSetIds.filter(id => id !== 'comfyui-tools')
  }

  // 异步获取工具 schemas
  const toolSchemas = await mcpToolRegistry.getToolSchemas(enabledToolSetIds)

  // 通过 WebSocket 发送消息
  wsManager.sendMessage(
    textContent,
    props.workflowContent,
    toolSchemas.length > 0 ? toolSchemas : undefined,
    attachmentContents.length > 0 ? attachmentContents : undefined
  )

  // 清空输入
  inputValue.value = ''
  selectedFiles.value = []

  // 重置 textarea 高度
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  // 触发事件通知父组件（用于更新 UI 等）
  emit('send-message', textContent, attachmentContents.length > 0 ? attachmentContents : undefined)
}

// 监听 props.messages 变化，同步到本地消息列表
watch(() => props.messages, (newMessages) => {
  // 用后端返回的消息替换本地消息列表
  localMessages.value = [...newMessages]

  // 滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true, immediate: true })

// 监听 localMessages 变化，自动滚动到底部
watch(() => localMessages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})

// 滚动到底部
function scrollToBottom(): void {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

/**
 * 获取消息的显示内容
 */
function getMessageDisplayContent(message: ChatMessage): string {
  // 优先使用 content 字段
  if (message.content && message.content.trim()) {
    return message.content
  }

  // 如果 content 为空，尝试从 chatContent 解析
  if (message.chatContent && message.chatContent.trim()) {
    try {
      const parsed = JSON.parse(message.chatContent)
      return parsed.content || ''
    } catch (error) {
      console.error('[ChatDialog] 解析 chatContent 失败:', error)
      return ''
    }
  }

  return ''
}

/**
 * 判断是否显示连接线
 * 当下一条消息也是非用户消息时，显示连接线
 */
function shouldShowConnectLine(index: number): boolean {
  if (index >= localMessages.value.length - 1) {
    // 最后一条消息，检查是否有流式消息
    return isStreaming.value
  }

  const nextMessage = localMessages.value[index + 1]
  return nextMessage?.role !== 'USER'
}

// 拖动开始
function handleMouseDown(event: MouseEvent): void {
  // 只允许在头部区域拖动，且不能点击按钮
  if ((event.target as HTMLElement).closest('.f-control-btn')) {
    return
  }

  // 如果点击的是调整大小手柄，不触发拖动
  if ((event.target as HTMLElement).closest('.f-resize-handle')) {
    return
  }

  isDragging.value = true

  if (chatDialog.value) {
    const rect = chatDialog.value.getBoundingClientRect()
    dragOffset.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  }
}

// 拖动中
function handleMouseMove(event: MouseEvent): void {
  console.log('[ChatDialog] mousemove 触发, isDragging:', isDragging.value, 'isResizing:', isResizing.value)

  // 如果正在 resize,不处理(由 window 上的专用监听器处理)
  if (isResizing.value) {
    return
  }

  if (!isDragging.value || !chatDialog.value) return

  const x = event.clientX - dragOffset.value.x
  const y = event.clientY - dragOffset.value.y

  // 限制在视口范围内
  const maxX = window.innerWidth - chatDialog.value.offsetWidth
  const maxY = window.innerHeight - chatDialog.value.offsetHeight

  dialogPosition.value = {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  }
}

// 拖动结束
function handleMouseUp(): void {
  console.log('[ChatDialog] mouseup 触发, isDragging:', isDragging.value, 'isResizing:', isResizing.value)

  if (isDragging.value) {
    console.log('[ChatDialog] 拖动结束')
    isDragging.value = false
  }

  if (isResizing.value) {
    console.log('[ChatDialog] 调整大小结束')
    handleResizeEnd()
  }
}

// 调整大小开始
function handleResizeStart(event: MouseEvent, direction: string): void {
  event.stopPropagation()
  event.preventDefault() // 防止文本选择等默认行为

  console.log('[ChatDialog] 调整大小开始:', direction)

  isResizing.value = true
  resizeDirection.value = direction
  resizeStartPos.value = { x: event.clientX, y: event.clientY }
  resizeStartSize.value = { ...dialogSize.value }
  resizeStartPosition.value = { ...dialogPosition.value }

  // 创建专门的 resize 事件处理器
  const handleResizeMouseMove = (e: MouseEvent) => {
    handleResizeMove(e)
  }

  const handleResizeMouseUp = () => {
    console.log('[ChatDialog] resize mouseup 触发')
    cleanup()
  }

  // 清理函数:移除监听器并结束 resize
  const cleanup = () => {
    window.removeEventListener('mousemove', handleResizeMouseMove, true)
    window.removeEventListener('mouseup', handleResizeMouseUp, true)
    window.removeEventListener('blur', handleResizeMouseUp)
    isResizing.value = false
    resizeDirection.value = ''
    resizeCleanup = null
  }

  // 保存清理函数的引用
  resizeCleanup = cleanup

  // 在 window 上添加监听器,确保鼠标移出对话框时仍能捕获
  window.addEventListener('mousemove', handleResizeMouseMove, { capture: true })
  window.addEventListener('mouseup', handleResizeMouseUp, { capture: true, once: true })
  window.addEventListener('blur', handleResizeMouseUp, { once: true })
}

// 调整大小中
function handleResizeMove(event: MouseEvent): void {
  console.log('[ChatDialog] resizeMove 执行, isResizing:', isResizing.value)

  if (!isResizing.value || !chatDialog.value) return

  // 边界检测:如果鼠标移出对话框边缘 20px,自动停止 resize
  const EDGE_THRESHOLD = 20 // 允许鼠标在对话框外 20px 范围内继续 resize
  const dialogRect = chatDialog.value.getBoundingClientRect()
  const mouseX = event.clientX
  const mouseY = event.clientY

  // 计算鼠标相对于对话框的位置
  const distanceToLeft = mouseX - dialogRect.left
  const distanceToRight = dialogRect.right - mouseX
  const distanceToTop = mouseY - dialogRect.top
  const distanceToBottom = dialogRect.bottom - mouseY

  // 检查是否移出对话框边界超过阈值
  const isOutOfBounds =
    distanceToLeft < -EDGE_THRESHOLD ||
    distanceToRight < -EDGE_THRESHOLD ||
    distanceToTop < -EDGE_THRESHOLD ||
    distanceToBottom < -EDGE_THRESHOLD

  if (isOutOfBounds) {
    console.log('[ChatDialog] 鼠标移出对话框边界,自动停止 resize')
    // 调用清理函数,移除监听器并结束 resize
    if (resizeCleanup) {
      resizeCleanup()
    }
    return
  }

  const deltaX = event.clientX - resizeStartPos.value.x
  const deltaY = event.clientY - resizeStartPos.value.y
  const direction = resizeDirection.value

  let newWidth = resizeStartSize.value.width
  let newHeight = resizeStartSize.value.height
  let newX = resizeStartPosition.value.x
  let newY = resizeStartPosition.value.y

  // 根据方向计算新的尺寸(未限制)
  if (direction.includes('e')) {
    newWidth = resizeStartSize.value.width + deltaX
  }
  if (direction.includes('w')) {
    newWidth = resizeStartSize.value.width - deltaX
  }
  if (direction.includes('s')) {
    newHeight = resizeStartSize.value.height + deltaY
  }
  if (direction.includes('n')) {
    newHeight = resizeStartSize.value.height - deltaY
  }

  // 应用尺寸限制,并记录限制前后的差异
  const constrainedWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH))
  const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT))

  // 计算实际应用的尺寸变化
  const actualWidthDelta = constrainedWidth - resizeStartSize.value.width
  const actualHeightDelta = constrainedHeight - resizeStartSize.value.height

  // 更新尺寸
  dialogSize.value = { width: constrainedWidth, height: constrainedHeight }

  // 如果是从左边或上边调整,需要更新位置
  // 关键:使用实际应用的尺寸变化(考虑了限制)来计算位置
  if (direction.includes('w') || direction.includes('n')) {
    if (direction.includes('w')) {
      // 从左边调整:位置向左移动的距离 = 宽度增加的距离
      newX = resizeStartPosition.value.x - actualWidthDelta
    }
    if (direction.includes('n')) {
      // 从上边调整:位置向上移动的距离 = 高度增加的距离
      newY = resizeStartPosition.value.y - actualHeightDelta
    }

    // 限制在视口范围内
    newX = Math.max(0, Math.min(newX, window.innerWidth - constrainedWidth))
    newY = Math.max(0, Math.min(newY, window.innerHeight - constrainedHeight))

    dialogPosition.value = { x: newX, y: newY }
  }
}

// 调整大小结束
function handleResizeEnd(): void {
  isResizing.value = false
  resizeDirection.value = ''
}

// 监听 sessionCode 变化，切换 WebSocket 连接
watch(() => props.sessionCode, (newSessionCode, oldSessionCode) => {
  if (newSessionCode && newSessionCode !== oldSessionCode) {
    console.log(`[ChatDialog] 会话切换: ${oldSessionCode} -> ${newSessionCode}`)
    initWebSocket(newSessionCode)
  }
})

// 生命周期
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)

  // 如果有 sessionCode，建立 WebSocket 连接
  if (props.sessionCode) {
    initWebSocket(props.sessionCode)
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)

  // 断开 WebSocket 连接
  disconnectWebSocket()
})
</script>

<style scoped lang="scss">
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
  transition: box-shadow 0.2s ease;

  &.minimized {
    height: 48px;
  }

  &.dragging {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    cursor: move;
  }

  &.resizing {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
    user-select: none;
  }
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}

// 对话框头部
.f-chat-header {
  background: #242424;
  color: #cccccc;
  padding: 8px 10px;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
  cursor: move;
  user-select: none;
}

.f-chat-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.f-chat-controls {
  display: flex;
  gap: 4px;
}

.f-control-btn {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  color: #999999;
  cursor: pointer;
  border-radius: 2px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    color: #ffffff;
  }
}

// 消息列表
.f-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: rgb(24, 24, 24);

  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgb(24, 24, 24);
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3a3a;
    border-radius: 4px;

    &:hover {
      background: #4a4a4a;
    }
  }
}

// 用户消息 - 蓝色边框
.f-message-user {
  width: 100%;
}

.f-user-message-box {
  padding: 10px 12px;
  background: rgb(49, 49, 49);
  border-radius: 4px;
  color: #cccccc;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

// AI/系统消息 - 带小点和连接线
.f-message-assistant-wrapper {
  display: flex;
  gap: 12px;
  width: 100%;
}

// 消息指示器容器（小点+连接线）
.f-message-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 6px;
}

// 小点
.f-indicator-dot {
  width: 8px;
  height: 8px;
  background: #666666;
  border-radius: 50%;
  flex-shrink: 0;
  z-index: 1;
}

// 连接线
.f-indicator-line {
  width: 2px;
  flex: 1;
  background: #3a3a3a;
  margin-top: 4px;
  min-height: 20px;
}

// AI 消息内容
.f-message-assistant-content {
  flex: 1;
  color: #cccccc;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  padding-top: 2px;
}

// 流式输出样式
.f-message-assistant-content.f-streaming {
  .f-cursor {
    display: inline-block;
    margin-left: 2px;
    animation: blink 1s step-end infinite;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

// 附件预览区域
.f-attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  margin-top: auto;
}

.f-attachment-item {
  position: relative;
}

// 图片/视频预览容器
.f-attachment-preview {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #3a3a3a;
  background: #2a2a2a;
}

.f-preview-image,
.f-preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.f-attachment-remove-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 68, 68, 0.9);
    transform: scale(1.1);
  }
}

// 文件类型预览
.f-attachment-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 8px;
  min-width: 200px;
  max-width: 280px;
}

.f-file-icon {
  width: 32px;
  height: 32px;
  background: #3a3a3a;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #999999;

  .f-icon {
    width: 20px;
    height: 20px;
  }
}

.f-file-info {
  flex: 1;
  min-width: 0;
}

.f-file-name {
  display: block;
  font-size: 12px;
  color: #cccccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.f-attachment-remove-btn {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: #999999;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s;

  &:hover {
    color: #ff4444;
  }
}

// 输入框
.f-chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #3a3a3a;
  background: #242424;
  flex-shrink: 0;
  align-items: flex-end;

  textarea {
    flex: 1;
    padding: 8px 12px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 3px;
    color: #cccccc;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.5;
    outline: none;
    resize: none;
    min-height: 36px;
    max-height: 120px;
    overflow-y: auto;

    &:focus {
      border-color: #4a9eff;
    }

    &::placeholder {
      color: #777777;
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #2a2a2a;
    }

    &::-webkit-scrollbar-thumb {
      background: #3a3a3a;
      border-radius: 3px;

      &:hover {
        background: #4a4a4a;
      }
    }
  }
}

.f-attach-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  color: #999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    background: #3a3a3a;
    color: #ffffff;
    border-color: #4a9eff;
  }

  .f-icon {
    width: 18px;
    height: 18px;
  }
}

.f-send-btn {
  padding: 8px 16px;
  background: #4a9eff;
  color: #ffffff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #5aa9ff;
  }

  &:disabled {
    background: #3a3a3a;
    color: #777777;
    cursor: not-allowed;
  }
}

// 调整大小手柄容器
.f-resize-handles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

// 调整大小手柄基础样式
.f-resize-handle {
  position: absolute;
  pointer-events: auto;
  z-index: 10;
}

// 四个角的手柄 (8x8 像素)
.f-resize-nw {
  top: -4px;
  left: -4px;
  width: 8px;
  height: 8px;
  cursor: nw-resize;
}

.f-resize-ne {
  top: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  cursor: ne-resize;
}

.f-resize-sw {
  bottom: -4px;
  left: -4px;
  width: 8px;
  height: 8px;
  cursor: sw-resize;
}

.f-resize-se {
  bottom: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  cursor: se-resize;
}

// 四条边的手柄 (4 像素宽度)
.f-resize-n {
  top: -2px;
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: n-resize;
}

.f-resize-s {
  bottom: -2px;
  left: 8px;
  right: 8px;
  height: 4px;
  cursor: s-resize;
}

.f-resize-w {
  left: -2px;
  top: 8px;
  bottom: 8px;
  width: 4px;
  cursor: w-resize;
}

.f-resize-e {
  right: -2px;
  top: 8px;
  bottom: 8px;
  width: 4px;
  cursor: e-resize;
}
</style>
