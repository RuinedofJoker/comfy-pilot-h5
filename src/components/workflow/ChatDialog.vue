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
      <div
        v-for="message in messages"
        :key="message.id"
        class="f-message"
        :class="{ user: message.role === 'USER' }"
      >
        <div class="f-avatar">{{ message.role === 'USER' ? 'U' : 'AI' }}</div>
        <div class="f-message-content">{{ message.content }}</div>
      </div>

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
      <input
        v-model="inputValue"
        type="text"
        placeholder="输入你的需求..."
        @keypress.enter="handleSend"
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
import { AGENT_PROMPT_DEFAULT_MESSAGES, MessageBuilder } from '@/types/websocket'
import type { AgentToolCallRequestData } from '@/types/websocket'
import { uploadFile } from '@/services/file'
import * as FileContentUtil from '@/utils/file-content'
import { toast } from '@/utils/toast'
import { mcpToolRegistry, mcpConfigManager } from '@/mcp'

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
}>()

// Auth Store
const authStore = useAuthStore()

// 本地状态
const inputValue = ref('')
const chatMessages = ref<HTMLDivElement | null>(null)
const chatDialog = ref<HTMLDivElement | null>(null)
const chatHeader = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<ChatContent[]>([])

// WebSocket 管理器
let wsManager: AgentWebSocketManager | null = null

// 拖动相关状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogPosition = ref({ x: 0, y: 0 })

// 调整大小相关状态
const isResizing = ref(false)
const resizeDirection = ref<string>('')
const dialogSize = ref({ width: 380, height: 520 })
const resizeStartPos = ref({ x: 0, y: 0 })
const resizeStartSize = ref({ width: 0, height: 0 })
const resizeStartPosition = ref({ x: 0, y: 0 })

// 最小和最大尺寸限制
const MIN_WIDTH = 300
const MIN_HEIGHT = 400
const MAX_WIDTH = 800
const MAX_HEIGHT = 800

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
    const message = data.message || AGENT_PROMPT_DEFAULT_MESSAGES[data.promptType]
    console.log('[ChatDialog] Agent 提示:', message)
  })

  wsManager.on('stream', (content) => {
    console.log('[ChatDialog] Agent 流式输出:', content)
  })

  wsManager.on('complete', () => {
    console.log('[ChatDialog] Agent 完成')
  })

  wsManager.on('toolRequest', async (requestId, data) => {
    console.log('[ChatDialog] 工具调用请求:', { requestId, data })
    await handleToolCallRequest(requestId, data)
  })

  wsManager.on('error', (error) => {
    console.error('[ChatDialog] WebSocket 错误:', error)
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

  // 获取工具集配置
  const config = mcpConfigManager.getToolSetConfig(toolSet.id)
  const executionPolicy = config?.executionPolicy || 'ask-every-time'

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

  // 触发事件通知父组件（用于更新 UI 等）
  emit('send-message', textContent, attachmentContents.length > 0 ? attachmentContents : undefined)
}

// 监听消息变化，自动滚动到底部
watch(() => props.messages, async () => {
  await nextTick()
  scrollToBottom()
}, { deep: true })

// 滚动到底部
function scrollToBottom(): void {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

// 拖动开始
function handleMouseDown(event: MouseEvent): void {
  // 只允许在头部区域拖动，且不能点击按钮
  if ((event.target as HTMLElement).closest('.f-control-btn')) {
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
  // 优先处理调整大小
  if (isResizing.value) {
    handleResizeMove(event)
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
  isDragging.value = false
  handleResizeEnd()
}

// 调整大小开始
function handleResizeStart(event: MouseEvent, direction: string): void {
  event.stopPropagation()
  isResizing.value = true
  resizeDirection.value = direction
  resizeStartPos.value = { x: event.clientX, y: event.clientY }
  resizeStartSize.value = { ...dialogSize.value }
  resizeStartPosition.value = { ...dialogPosition.value }
}

// 调整大小中
function handleResizeMove(event: MouseEvent): void {
  if (!isResizing.value || !chatDialog.value) return

  const deltaX = event.clientX - resizeStartPos.value.x
  const deltaY = event.clientY - resizeStartPos.value.y
  const direction = resizeDirection.value

  let newWidth = resizeStartSize.value.width
  let newHeight = resizeStartSize.value.height
  let newX = resizeStartPosition.value.x
  let newY = resizeStartPosition.value.y

  // 根据方向调整尺寸和位置
  if (direction.includes('e')) {
    newWidth = resizeStartSize.value.width + deltaX
  }
  if (direction.includes('w')) {
    newWidth = resizeStartSize.value.width - deltaX
    newX = resizeStartPosition.value.x + deltaX
  }
  if (direction.includes('s')) {
    newHeight = resizeStartSize.value.height + deltaY
  }
  if (direction.includes('n')) {
    newHeight = resizeStartSize.value.height - deltaY
    newY = resizeStartPosition.value.y + deltaY
  }

  // 应用尺寸限制
  newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH))
  newHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT))

  // 更新尺寸
  dialogSize.value = { width: newWidth, height: newHeight }

  // 如果是从左边或上边调整,需要更新位置
  if (direction.includes('w') || direction.includes('n')) {
    // 计算实际的尺寸变化
    const actualWidthChange = newWidth - resizeStartSize.value.width
    const actualHeightChange = newHeight - resizeStartSize.value.height

    if (direction.includes('w')) {
      newX = resizeStartPosition.value.x - actualWidthChange
    }
    if (direction.includes('n')) {
      newY = resizeStartPosition.value.y - actualHeightChange
    }

    // 限制在视口范围内
    newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth))
    newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight))

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
}

.f-message {
  display: flex;
  gap: 8px;
  align-items: flex-start;

  &.user {
    flex-direction: row-reverse;
  }
}

.f-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #3a3a3a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.f-message.user .f-avatar {
  background: #4a9eff;
}

.f-message-content {
  flex: 1;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  color: #cccccc;
  word-wrap: break-word;
}

.f-message.user .f-message-content {
  background: #4a9eff;
  color: #ffffff;
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

  input[type="text"] {
    flex: 1;
    padding: 8px 12px;
    background: #2a2a2a;
    border: 1px solid #3a3a3a;
    border-radius: 3px;
    color: #cccccc;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: #4a9eff;
    }

    &::placeholder {
      color: #777777;
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
