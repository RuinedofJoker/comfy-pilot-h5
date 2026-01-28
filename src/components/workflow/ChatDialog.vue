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
    @mousedown="handleMouseDown"
  >
    <div ref="chatHeader" class="f-chat-header">
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

    <div v-show="!isMinimized" class="f-chat-messages">
      <div class="f-messages-content" ref="chatMessages">
        <!-- 本地消息列表 - 简洁展示，类似终端输出 -->
        <template v-for="(message, index) in filteredMessages" :key="message.id">
        <!-- 用户消息 (USER 和 USER_ORDER) -->
        <div v-if="message.role === 'USER' || message.role === 'USER_ORDER'" class="f-message-user">
          <div class="f-user-message-box">
            {{ getMessageDisplayContent(message) }}
          </div>
        </div>

        <!-- AI/系统/Agent计划/Agent消息 - 带小点和连接线 -->
        <div v-else class="f-message-assistant-wrapper">
          <div class="f-message-indicator">
            <div
              class="f-indicator-dot"
              :class="{
                'f-indicator-dot--green': message.role === 'AGENT_PLAN',
                'f-indicator-dot--red': message.role === 'AGENT_ERROR'
              }"
            ></div>
            <div
              v-if="shouldShowConnectLine(index)"
              class="f-indicator-line"
            ></div>
          </div>

          <!-- 待办事项消息 -->
          <TodoListMessage
            v-if="message.role === 'AGENT_PLAN'"
            :todos-json="message.content"
          />

          <!-- Agent 错误消息 -->
          <div v-else-if="message.role === 'AGENT_ERROR'" class="f-agent-error-block">
            {{ message.content }}
          </div>

          <!-- Agent 消息块 -->
          <div
            v-else-if="message.role === 'AGENT_MESSAGE'"
            class="f-agent-message-block"
            :class="{ 'is-collapsed': collapsibleMessages[message.id] && !isMessageExpanded(message.id) }"
            :data-message-id="message.id"
          >
            <div class="f-agent-message-content">
              {{ message.content }}
            </div>
            <button
              v-if="collapsibleMessages[message.id] && !isMessageExpanded(message.id)"
              class="f-expand-btn"
              @click="toggleMessageExpand(message.id)"
            >
              Show more
            </button>
            <button
              v-else-if="collapsibleMessages[message.id] && isMessageExpanded(message.id)"
              class="f-expand-btn f-expand-btn--expanded"
              @click="toggleMessageExpand(message.id)"
            >
              Show less
            </button>
          </div>

          <!-- Agent 终端输出 -->
          <div v-else-if="message.role === 'AGENT_TERMINAL'" class="f-agent-terminal-block">
            <pre class="f-terminal-content" v-html="renderTerminalContent(message)"></pre>
          </div>

          <!-- 普通 AI 消息 -->
          <div v-else class="f-message-assistant-content f-markdown-content markdown-body" v-html="renderMessageContent(message)"></div>
        </div>
      </template>

      <!-- 当前流式输出的消息 -->
      <div v-if="isStreaming && currentStreamingMessage" class="f-message-assistant-wrapper">
        <div class="f-message-indicator">
          <div class="f-indicator-dot"></div>
        </div>
        <div class="f-message-assistant-content f-markdown-content markdown-body" :class="{ 'f-streaming': !isStreamComplete }" v-html="renderStreamingContent()"></div>
      </div>

      <!-- 工具调用确认 -->
      <ToolCallConfirmation
        :visible="isShowingToolConfirmation"
        :tool-name="pendingToolCall?.toolName || ''"
        :tool-args="pendingToolCall?.toolArgs"
        @approve="handleToolApprove"
        @reject="handleToolReject"
      />
      </div>

      <!-- 动态提示区域（固定高度，独立于消息列表） -->
      <div class="f-prompt-area">
        <AgentPromptIndicator
          :visible="isShowingPrompt"
          :text="currentPromptMessage"
        />
      </div>

      <!-- 输入框 -->
      <div class="f-chat-input">
        <div class="f-input-container" style="position: relative;">
          <!-- 命令提示 -->
          <CommandSuggestion
            ref="commandSuggestionRef"
            :visible="isShowingCommandSuggestion"
            :input-value="inputValue"
            @select="handleCommandSelect"
          />

          <!-- 第一行：输入框和附件区域 -->
          <div class="f-input-row">
            <!-- 输入框区域 -->
            <div class="f-textarea-wrapper">
              <textarea
                ref="textareaRef"
                v-model="inputValue"
                placeholder="输入你的需求... (Shift+Enter 换行)"
                rows="1"
                :disabled="isAgentExecuting"
                @keydown="handleKeyDown"
                @input="adjustTextareaHeight"
              />
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

          <!-- 第二行：左边 Agent 选择器 + token 使用率 + 右边按钮组 -->
          <div class="f-controls-row">
            <div class="f-controls-left">
              <!-- Agent 选择器 -->
              <AgentSelector />
              <!-- Token 使用率显示 -->
              <TokenUsageIndicator
                :percentage="usagePercentage"
              />
            </div>
            <div class="f-controls-right">
              <button
                class="f-attach-btn"
                :disabled="isAgentExecuting"
                @click="handleAttachClick"
                title="添加附件"
              >
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
                </svg>
              </button>
              <input
                ref="fileInput"
                type="file"
                multiple
                style="display: none"
                @change="handleFileSelect"
              />
              <button
                class="f-send-btn"
                :class="{ 'is-sending': isAgentExecuting }"
                :disabled="!inputValue.trim() && !isAgentExecuting"
                @click="isAgentExecuting ? handleStop() : handleSend()"
                :title="isAgentExecuting ? '停止' : '发送'"
              >
                <svg v-if="!isAgentExecuting" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ChatMessage } from '@/types/session'
import type { ChatContent } from '@/types/chat-content'
import { AgentWebSocketManager } from '@/utils/websocket'
import { useAuthStore } from '@/stores/auth'
import { useUserAgentConfigStore } from '@/stores/userAgentConfig'
import { AGENT_PROMPT_DEFAULT_MESSAGES } from '@/types/websocket'
import type { AgentToolCallRequestData, AgentPromptType } from '@/types/websocket'
import { uploadFile } from '@/services/file'
import * as FileContentUtil from '@/utils/file-content'
import { toast } from '@/utils/toast'
import { mcpToolRegistry, mcpConfigManager } from '@/mcp'
import { renderMarkdown } from '@/utils/markdown'
import AgentPromptIndicator from './AgentPromptIndicator.vue'
import ToolCallConfirmation from './ToolCallConfirmation.vue'
import CommandSuggestion from './CommandSuggestion.vue'
import TokenUsageIndicator from './TokenUsageIndicator.vue'
import AgentSelector from './AgentSelector.vue'
import TodoListMessage from './TodoListMessage.vue'

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

// UserAgentConfig Store
const userAgentConfigStore = useUserAgentConfigStore()

// 本地状态
const inputValue = ref('')
const chatMessages = ref<HTMLDivElement | null>(null)
const chatDialog = ref<HTMLDivElement | null>(null)
const chatHeader = ref<HTMLDivElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const selectedFiles = ref<ChatContent[]>([])
const commandSuggestionRef = ref<InstanceType<typeof CommandSuggestion> | null>(null)

// 命令提示状态 - 只有当输入以 / 开头且不在执行中时才可能显示
// 注意：实际是否显示还取决于 CommandSuggestion 组件内部的 filteredCommands 是否为空
const isShowingCommandSuggestion = computed(() => {
  return inputValue.value.startsWith('/') && !isAgentExecuting.value
})

// 本地消息列表（包含历史消息 + 新消息）
const localMessages = ref<ChatMessage[]>([])

// AGENT_MESSAGE 折叠状态管理（key: message.id, value: 是否展开）
const expandedMessages = ref<Record<string, boolean>>({})

// AGENT_MESSAGE 是否需要折叠功能（key: message.id, value: 是否需要折叠）
const collapsibleMessages = ref<Record<string, boolean>>({})

// 过滤掉内容为空的消息（AI 调用工具时可能产生空消息）
const filteredMessages = computed(() => {
  return localMessages.value.filter(message => {
    // AGENT_PLAN 消息（待办事项）不过滤
    if (message.role === 'AGENT_PLAN') {
      return true
    }

    // AGENT_MESSAGE 消息不过滤
    if (message.role === 'AGENT_MESSAGE') {
      return true
    }

    // 其他消息需要有内容
    const content = getMessageDisplayContent(message)
    return content && content.trim().length > 0
  })
})

// WebSocket 管理器
let wsManager: AgentWebSocketManager | null = null

// Agent 状态
const currentPromptType = ref<AgentPromptType | null>(null)
const currentPromptMessage = ref<string>('')
const isShowingPrompt = ref(false)

// 工具调用确认状态
const isShowingToolConfirmation = ref(false)
const pendingToolCall = ref<{
  toolName: string
  toolArgs: any
  resolve: (value: boolean) => void
} | null>(null)

// 当前流式输出的消息
const currentStreamingMessage = ref<string>('')
const isStreaming = ref(false)
const isStreamComplete = ref(false) // 标记流式输出是否已完成
const currentRequestId = ref<string>('') // 当前请求ID
const isAgentExecuting = ref(false) // Agent 是否正在执行（用于控制发送按钮状态）
const isAgentStarted = ref(false) // Agent 是否已开始执行（收到 STARTED 事件）
const shouldForceScrollOnNextUpdate = ref(false) // 标记下次消息更新时是否强制滚动

// Token 使用统计
const tokenStats = ref<{
  maxTokens?: number
  maxMessages?: number
  totalTokens?: number
  messageCount?: number
}>({})

// 计算使用率百分比
const usagePercentage = computed(() => {
  // 优先使用 token 占比
  if (tokenStats.value.totalTokens && tokenStats.value.maxTokens) {
    return Math.round((tokenStats.value.totalTokens / tokenStats.value.maxTokens) * 100)
  }
  // 降级使用消息数占比
  if (tokenStats.value.messageCount && tokenStats.value.maxMessages) {
    return Math.round((tokenStats.value.messageCount / tokenStats.value.maxMessages) * 100)
  }
  return 0
})

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
  wsManager.on('prompt', (requestId, data) => {
    handlePromptEvent(requestId, data.promptType, data.message)
  })

  wsManager.on('stream', (requestId, content) => {
    handleStreamEvent(requestId, content)
  })

  wsManager.on('complete', (requestId, data) => {
    handleCompleteEvent(requestId, data)
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
function handlePromptEvent(requestId: string, promptType: AgentPromptType, message?: string): void {
  // 验证 requestId 是否匹配
  if (requestId !== currentRequestId.value) {
    console.log('[ChatDialog] 忽略不匹配的 Prompt 事件:', { requestId, currentRequestId: currentRequestId.value })
    return
  }

  console.log('[ChatDialog] Agent 提示:', promptType, message)

  // STARTED 类型表示 Agent 开始执行
  if (promptType === 'STARTED') {
    isAgentStarted.value = true
    return
  }

  // TODO_WRITE 类型表示待办事项更新，添加待办事项消息
  if (promptType === 'TODO_WRITE' && message) {
    console.log('[ChatDialog] 处理 TODO_WRITE 事件，创建待办事项消息')
    const wasAtBottom = isScrollAtBottom()

    // 创建待办事项消息
    const todoMessage: ChatMessage = {
      id: `todo-${Date.now()}`,
      sessionId: props.sessionCode || '',
      role: 'AGENT_PLAN',
      content: message, // 直接存储 todo JSON 字符串
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    console.log('[ChatDialog] 待办事项消息已创建:', todoMessage)

    // 添加到本地消息列表
    localMessages.value.push(todoMessage)

    console.log('[ChatDialog] 本地消息列表长度:', localMessages.value.length)
    console.log('[ChatDialog] 过滤后消息列表长度:', filteredMessages.value.length)

    // 如果用户在底部，滚动到新的底部
    nextTick(() => {
      if (wasAtBottom) {
        scrollToBottom()
      }
    })

    return
  }

  // AGENT_MESSAGE_BLOCK 类型表示 Agent 消息块，添加 AGENT_MESSAGE 消息
  if (promptType === 'AGENT_MESSAGE_BLOCK' && message) {
    console.log('[ChatDialog] 处理 AGENT_MESSAGE_BLOCK 事件，创建 Agent 消息')
    const wasAtBottom = isScrollAtBottom()

    // 创建 Agent 消息
    const agentMessage: ChatMessage = {
      id: `agent-message-${Date.now()}`,
      sessionId: props.sessionCode || '',
      role: 'AGENT_MESSAGE',
      content: message,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    console.log('[ChatDialog] Agent 消息已创建:', agentMessage)

    // 添加到本地消息列表
    localMessages.value.push(agentMessage)

    // 如果用户在底部，滚动到新的底部
    nextTick(() => {
      if (wasAtBottom) {
        scrollToBottom()
      }
    })

    return
  }

  // TERMINAL_OUTPUT_START 类型表示终端输出开始，创建终端消息
  if (promptType === 'TERMINAL_OUTPUT_START') {
    console.log('[ChatDialog] 处理 TERMINAL_OUTPUT_START 事件，创建终端消息')
    const wasAtBottom = isScrollAtBottom()

    // 创建终端消息
    const terminalMessage: ChatMessage = {
      id: `terminal-${Date.now()}`,
      sessionId: props.sessionCode || '',
      role: 'AGENT_TERMINAL',
      content: message || '',
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    console.log('[ChatDialog] 终端消息已创建:', terminalMessage)

    // 添加到本地消息列表
    localMessages.value.push(terminalMessage)

    // 如果用户在底部，滚动到新的底部
    nextTick(() => {
      if (wasAtBottom) {
        scrollToBottom()
      }
    })

    return
  }

  // TERMINAL_OUTPUT_END 类型表示终端输出结束
  if (promptType === 'TERMINAL_OUTPUT_END') {
    console.log('[ChatDialog] 处理 TERMINAL_OUTPUT_END 事件，终端输出结束')
    // 终端输出结束，不需要特殊处理，流式输出会自然停止
    return
  }

  // CLEAR 类型表示清空消息列表
  if (promptType === 'CLEAR') {
    console.log('[ChatDialog] 处理 CLEAR 事件，清空消息列表')
    localMessages.value = []
    return
  }

  // INTERRUPTED、COMPLETE 类型表示执行结束，重置状态
  if (promptType === 'INTERRUPTED' || promptType === 'COMPLETE') {
    isAgentExecuting.value = false
    isAgentStarted.value = false
    isShowingPrompt.value = false
    currentRequestId.value = '' // 清空请求ID
    return
  }

  // ERROR 类型：创建错误消息并显示
  if (promptType === 'ERROR') {
    const errorMsg = message || AGENT_PROMPT_DEFAULT_MESSAGES[promptType]
    console.log('[ChatDialog] 处理 ERROR 事件，创建错误消息')
    const wasAtBottom = isScrollAtBottom()

    // 创建错误消息
    const errorMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      sessionId: props.sessionCode || '',
      role: 'AGENT_ERROR',
      content: errorMsg,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }

    // 添加到本地消息列表
    localMessages.value.push(errorMessage)

    // 如果用户在底部，滚动到新的底部
    nextTick(() => {
      if (wasAtBottom) {
        scrollToBottom()
      }
    })

    // 如果还未收到 STARTED，说明是启动前的错误，需要中断执行
    if (!isAgentStarted.value) {
      isAgentExecuting.value = false
      isShowingPrompt.value = false
      currentRequestId.value = '' // 清空请求ID
    }
    // 如果已收到 STARTED，只是消息提醒，不结束执行
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
function handleStreamEvent(requestId: string, content: string): void {
  // 验证 requestId 是否匹配
  if (requestId !== currentRequestId.value) {
    console.log('[ChatDialog] 忽略不匹配的 Stream 事件:', { requestId, currentRequestId: currentRequestId.value })
    return
  }

  // 关闭动态提示（如果有的话）
  if (isShowingPrompt.value) {
    isShowingPrompt.value = false
  }

  // 检查最后一条消息是否是 AGENT_TERMINAL 类型
  const lastMessage = localMessages.value[localMessages.value.length - 1]
  if (lastMessage && lastMessage.role === 'AGENT_TERMINAL') {
    // 提取颜色标识（前两个字符：'0 ' 或 '1 '）
    const colorFlag = content.substring(0, 2)
    const actualContent = content.substring(2)

    // 判断颜色类型：'0 ' = 正常绿色，'1 ' = 红色
    const isError = colorFlag === '1 '

    // 更新 AGENT_TERMINAL 消息内容
    const newContent = lastMessage.content + actualContent
    lastMessage.content = processTerminalContent(newContent)
    lastMessage.updateTime = new Date().toISOString()

    // 存储终端片段数据到 metadata
    if (!lastMessage.metadata) {
      lastMessage.metadata = { terminalSegments: [] }
    }
    if (!lastMessage.metadata.terminalSegments) {
      lastMessage.metadata.terminalSegments = []
    }

    // 添加新的终端片段
    lastMessage.metadata.terminalSegments.push({
      content: actualContent,
      isError: isError
    })

    // 触发响应式更新
    localMessages.value = [...localMessages.value]
  } else {
    // 普通 ASSISTANT 消息的流式输出
    currentStreamingMessage.value += content
  }

  isStreaming.value = true
  isStreamComplete.value = false // 正在流式输出中

  // 流式消息更新时，仅当用户在底部时才滚动
  nextTick(() => {
    scrollToBottomIfNeeded()
  })
}

/**
 * 处理完成事件
 */
async function handleCompleteEvent(requestId: string, data?: import('@/types/websocket').AgentCompleteResponseData): Promise<void> {
  // 验证 requestId 是否匹配
  if (requestId !== currentRequestId.value) {
    console.log('[ChatDialog] 忽略不匹配的 Complete 事件:', { requestId, currentRequestId: currentRequestId.value })
    return
  }

  console.log('[ChatDialog] Agent 完成', data)
  isShowingPrompt.value = false

  // 更新 token 统计数据
  if (data) {
    tokenStats.value = {
      maxTokens: data.maxTokens,
      maxMessages: data.maxMessages,
      totalTokens: data.totalTokens,
      messageCount: data.messageCount
    }
  }

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
  // 注意：currentRequestId 不在这里清空，保留以便用户可以中断
  // 注意：isAgentExecuting 不在这里重置，等待后端发送 AGENT_PROMPT(COMPLETE/ERROR/INTERRUPTED)

  // 延迟刷新消息列表，与后端同步
  setTimeout(() => {
    emit('refresh-messages')
  }, 500)
}

/**
 * 处理工具调用请求
 */
async function handleToolCallRequest(requestId: string, data: AgentToolCallRequestData): Promise<void> {
  // 验证 requestId 是否匹配
  if (requestId !== currentRequestId.value) {
    console.log('[ChatDialog] 忽略不匹配的 ToolCallRequest 事件:', { requestId, currentRequestId: currentRequestId.value })
    return
  }

  const { toolCallId, toolName, toolArgs, isClientTool, isMcpTool } = data

  try {
    // 解析工具参数
    const args = JSON.parse(toolArgs)

    if (isClientTool) {
      // 前端工具：需要执行并返回结果
      await handleClientToolCall(requestId, toolCallId, toolName, args, toolArgs, isMcpTool)
    } else {
      // 后端工具：仅做权限验证
      await handleServerToolCall(requestId, toolCallId, toolName, args, toolArgs, isMcpTool)
    }
  } catch (error) {
    console.error('[ChatDialog] 工具调用处理失败:', error)
    toast.error('工具调用处理失败')
    if (!wsManager || !props.sessionCode) return
    wsManager.sendToolResponse(
      requestId,
      toolCallId,
      toolName,
      toolArgs,
      isClientTool,
      isMcpTool,
      true,
      String((error as Error).stack),
      false,
      error instanceof Error ? error.message : '工具执行失败'
    )
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
  toolArgs: string,
  isMcpTool: boolean
): Promise<void> {
  if (!wsManager || !props.sessionCode) return

  // 根据执行策略决定是否需要用户确认
  // 只有 MCP 工具需要用户确认，其他工具直接放行
  let isAllow = true
  if (isMcpTool) {
    isAllow = await showToolConfirmDialog(toolName, args)
  }

  if (!isAllow) {
    // 用户拒绝执行
    wsManager.sendToolResponse(requestId, toolCallId, toolName, toolArgs, true, false, isMcpTool)
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
        isMcpTool,
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
        isMcpTool,
        true,
        "",
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
      isMcpTool,
      true,
      String((error as Error).stack),
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
  toolArgs: string,
  isMcpTool: boolean
): Promise<void> {
  if (!wsManager || !props.sessionCode) return

  // 只有 MCP 工具需要用户确认，其他工具直接放行
  let isAllow = true
  if (isMcpTool) {
    isAllow = await showToolConfirmDialog(toolName, args)
  }

  // 发送响应（仅包含 isAllow，不包含执行结果）
  wsManager.sendToolResponse(requestId, toolCallId, toolName, toolArgs, false, isMcpTool, isAllow)
}

/**
 * 显示工具确认对话框
 */
async function showToolConfirmDialog(toolName: string, args: any): Promise<boolean> {
  // 使用 Promise 来等待用户的确认或拒绝
  return new Promise((resolve) => {
    pendingToolCall.value = {
      toolName,
      toolArgs: args,
      resolve
    }
    isShowingToolConfirmation.value = true
  })
}

/**
 * 处理工具调用批准
 */
function handleToolApprove(): void {
  if (pendingToolCall.value) {
    pendingToolCall.value.resolve(true)
    isShowingToolConfirmation.value = false
    pendingToolCall.value = null
  }
}

/**
 * 处理工具调用拒绝
 */
function handleToolReject(): void {
  if (pendingToolCall.value) {
    pendingToolCall.value.resolve(false)
    isShowingToolConfirmation.value = false
    pendingToolCall.value = null
  }
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

// 处理命令选中
function handleCommandSelect(command: { name: string; description: string }): void {
  inputValue.value = command.name
  // 聚焦到输入框末尾
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.focus()
      textareaRef.value.setSelectionRange(inputValue.value.length, inputValue.value.length)
    }
  })
}

// 处理键盘事件
function handleKeyDown(event: KeyboardEvent): void {
  // 如果命令提示正在显示且有可用命令，处理上下箭头和回车
  if (isShowingCommandSuggestion.value && commandSuggestionRef.value?.hasCommands()) {
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      commandSuggestionRef.value.handleArrowKey('up')
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      commandSuggestionRef.value.handleArrowKey('down')
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      commandSuggestionRef.value.handleEnter()
      return
    }
  }

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

// 中断当前请求
function handleStop(): void {
  if (!wsManager || !currentRequestId.value) return

  console.log('[ChatDialog] 中断请求:', currentRequestId.value)
  wsManager.interrupt(currentRequestId.value)

  // 如果有流式消息内容，保存到消息列表
  if (currentStreamingMessage.value.trim()) {
    const now = new Date().toISOString()
    const interruptedMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: props.sessionCode || '',
      role: 'ASSISTANT',
      content: currentStreamingMessage.value,
      chatContent: JSON.stringify({ content: currentStreamingMessage.value }),
      createTime: now,
      updateTime: now
    }
    localMessages.value.push(interruptedMessage)

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }

  // 清空流式状态
  isStreaming.value = false
  currentStreamingMessage.value = ''
  isShowingPrompt.value = false

  // 注意：isAgentExecuting 不在这里重置，等待后端发送 AGENT_PROMPT(INTERRUPTED) 才会恢复按钮状态
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

  // 获取 MCP 配置（JSON 字符串）
  const mcpConfig = mcpConfigManager.exportConfig()

  // 获取当前选中的 Agent Code
  const agentCode = userAgentConfigStore.currentAgent?.agentCode

  // 生成并保存请求ID
  const requestId = Date.now().toString()
  currentRequestId.value = requestId

  // 设置 Agent 执行状态（发送按钮变为中断样式）
  isAgentExecuting.value = true
  isAgentStarted.value = false // 重置 STARTED 状态，等待新的 STARTED 事件

  // 通过 WebSocket 发送消息，传入 requestId 确保一致性
  wsManager.sendMessage(
    textContent,
    toolSchemas.length > 0 ? toolSchemas : undefined,
    attachmentContents.length > 0 ? attachmentContents : undefined,
    mcpConfig,
    agentCode,
    requestId
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

  // 根据标记决定是强制滚动还是智能滚动
  nextTick(() => {
    if (shouldForceScrollOnNextUpdate.value) {
      scrollToBottom()
      shouldForceScrollOnNextUpdate.value = false // 重置标记
    } else {
      scrollToBottomIfNeeded()
    }

    // 检测 AGENT_MESSAGE 高度
    checkAgentMessageHeights()
  })
}, { deep: true, immediate: true })

/**
 * 检测 AGENT_MESSAGE 高度，判断是否需要折叠功能
 */
function checkAgentMessageHeights(): void {
  // 使用 setTimeout 确保 DOM 完全渲染
  setTimeout(() => {
    if (!chatMessages.value) return

    const agentMessageBlocks = chatMessages.value.querySelectorAll('.f-agent-message-block')

    agentMessageBlocks.forEach((block) => {
      const messageId = (block as HTMLElement).dataset.messageId
      if (!messageId) return

      const contentEl = block.querySelector('.f-agent-message-content') as HTMLElement
      if (!contentEl) return

      const height = contentEl.scrollHeight

      // 只有高度超过 150px 的消息才需要折叠功能
      if (height > 150) {
        collapsibleMessages.value[messageId] = true
      } else {
        collapsibleMessages.value[messageId] = false
      }
    })
  }, 100)
}

/**
 * 处理终端输出内容（处理 \r 回车符）
 * \r 会覆盖当前行的内容，类似终端的行为
 */
function processTerminalContent(content: string): string {
  // 按行分割内容
  const lines = content.split('\n')
  const processedLines: string[] = []

  for (const line of lines) {
    // 如果行中包含 \r，处理回车符覆盖逻辑
    if (line.includes('\r')) {
      const parts = line.split('\r')
      // \r 会覆盖之前的内容，所以只保留最后一部分
      processedLines.push(parts[parts.length - 1])
    } else {
      processedLines.push(line)
    }
  }

  return processedLines.join('\n')
}

/**
 * 渲染带颜色的终端内容
 */
function renderTerminalContent(message: ChatMessage): string {
  // 如果没有终端片段数据，直接返回普通内容
  if (!message.metadata?.terminalSegments || message.metadata.terminalSegments.length === 0) {
    return message.content
  }

  // 重新组合终端片段，应用颜色
  let result = ''
  for (const segment of message.metadata.terminalSegments) {
    if (segment.isError) {
      result += `<span class="f-terminal-error">${escapeHtml(segment.content)}</span>`
    } else {
      result += escapeHtml(segment.content)
    }
  }

  return result
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 监听 localMessages 变化，自动滚动到底部
watch(() => localMessages.value.length, async () => {
  await nextTick()
  scrollToBottomIfNeeded()
})

// 监听 localMessages 变化，检测 AGENT_MESSAGE 高度
watch(() => localMessages.value, async () => {
  await nextTick()
  checkAgentMessageHeights()
}, { deep: true })

// 检查滚动条是否在底部（允许一定误差）
function isScrollAtBottom(): boolean {
  if (!chatMessages.value) return true

  const threshold = 50 // 50px 的误差范围
  const scrollTop = chatMessages.value.scrollTop
  const scrollHeight = chatMessages.value.scrollHeight
  const clientHeight = chatMessages.value.clientHeight

  return scrollHeight - scrollTop - clientHeight < threshold
}

// 滚动到底部（仅当用户已在底部时）
function scrollToBottomIfNeeded(): void {
  if (!chatMessages.value) return

  // 只有当用户已经在底部时才自动滚动
  if (isScrollAtBottom()) {
    requestAnimationFrame(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
  }
}

// 强制滚动到底部（用于用户主动发送消息等场景）
function scrollToBottom(): void {
  if (chatMessages.value) {
    // 使用 requestAnimationFrame 确保在 DOM 渲染完成后执行
    requestAnimationFrame(() => {
      if (chatMessages.value) {
        chatMessages.value.scrollTop = chatMessages.value.scrollHeight
      }
    })
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
 * 切换消息的展开/折叠状态
 */
function toggleMessageExpand(messageId: string): void {
  expandedMessages.value[messageId] = !expandedMessages.value[messageId]
}

/**
 * 检查消息是否展开
 */
function isMessageExpanded(messageId: string): boolean {
  return expandedMessages.value[messageId] || false
}

/**
 * 渲染消息内容为 HTML（Markdown）
 */
function renderMessageContent(message: ChatMessage): string {
  const content = getMessageDisplayContent(message)
  if (!content) return ''
  return renderMarkdown(content)
}

/**
 * 渲染流式消息内容为 HTML（Markdown）
 * 流式输出时，在内容末尾添加光标
 */
function renderStreamingContent(): string {
  if (!currentStreamingMessage.value) return ''
  const markdownHtml = renderMarkdown(currentStreamingMessage.value)

  // 如果流式输出未完成，在末尾添加光标
  if (!isStreamComplete.value) {
    return markdownHtml + '<span class="f-cursor">▋</span>'
  }

  return markdownHtml
}

/**
 * 判断是否显示连接线
 * 当下一条消息也是非用户消息时，显示连接线
 */
function shouldShowConnectLine(index: number): boolean {
  if (index >= filteredMessages.value.length - 1) {
    // 最后一条消息，检查是否有流式消息
    return isStreaming.value
  }

  const nextMessage = filteredMessages.value[index + 1]
  // 下一条消息是用户消息（USER 或 USER_ORDER）时，不显示连接线
  return nextMessage?.role !== 'USER' && nextMessage?.role !== 'USER_ORDER'
}

// 拖动相关状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogPosition = ref({ x: 0, y: 0 })

// 调整大小相关状态
const isResizing = ref(false)
const resizeDirection = ref<string>('')
const dialogSize = ref({ width: window.innerWidth * 0.4, height: window.innerHeight * 0.8 })
// const resizeStartPos = ref({ x: 0, y: 0 })
// const resizeStartSize = ref({ width: 0, height: 0 })
// const resizeStartPosition = ref({ x: 0, y: 0 })

// // 最小和最大尺寸限制
// const MIN_WIDTH = 360
// const MIN_HEIGHT = 480
// const MAX_WIDTH = 1200
// const MAX_HEIGHT = 1400

// 边缘识别区域大小
const EDGE_THRESHOLD = 10

/**
 * 检测鼠标是否在对话框边缘区域(用于调整大小)
 * @returns 边缘方向 ('n', 's', 'w', 'e', 'nw', 'ne', 'sw', 'se') 或 null
 */
function getEdgeDirection(event: MouseEvent): string | null {
  if (!chatDialog.value) return null

  const rect = chatDialog.value.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  // 检查是否在对话框范围内(正负 EDGE_THRESHOLD)
  const inHorizontalRange = x >= rect.left - EDGE_THRESHOLD && x <= rect.right + EDGE_THRESHOLD
  const inVerticalRange = y >= rect.top - EDGE_THRESHOLD && y <= rect.bottom + EDGE_THRESHOLD

  if (!inHorizontalRange || !inVerticalRange) return null

  // 判断具体方向
  const isNear = {
    top: y >= rect.top - EDGE_THRESHOLD && y <= rect.top + EDGE_THRESHOLD,
    bottom: y >= rect.bottom - EDGE_THRESHOLD && y <= rect.bottom + EDGE_THRESHOLD,
    left: x >= rect.left - EDGE_THRESHOLD && x <= rect.left + EDGE_THRESHOLD,
    right: x >= rect.right - EDGE_THRESHOLD && x <= rect.right + EDGE_THRESHOLD
  }

  // 优先判断角
  if (isNear.top && isNear.left) return 'nw'
  if (isNear.top && isNear.right) return 'ne'
  if (isNear.bottom && isNear.left) return 'sw'
  if (isNear.bottom && isNear.right) return 'se'

  // 判断边
  if (isNear.top) return 'n'
  if (isNear.bottom) return 's'
  if (isNear.left) return 'w'
  if (isNear.right) return 'e'

  return null
}

/**
 * 检测鼠标是否在 header 的可拖动区域
 */
function isInDraggableArea(event: MouseEvent): boolean {
  if (!chatHeader.value || !chatDialog.value) return false
  if (getEdgeDirection(event) != null) return false

  const headerRect = chatHeader.value.getBoundingClientRect()
  const x = event.clientX
  const y = event.clientY

  // 必须在 header 区域内
  if (x < headerRect.left || x > headerRect.right || y < headerRect.top || y > headerRect.bottom) {
    return false
  }

  return true
}

/**
 * 处理鼠标按下事件 - 统一入口
 */
function handleMouseDown(event: MouseEvent): void {
  // 排除控制按钮
  if ((event.target as HTMLElement).closest('.f-control-btn')) {
    return
  }

  // 检查是否在边缘区域(调整大小)
  /* const edgeDir = getEdgeDirection(event)
  if (edgeDir != null) {
    startResize(event, edgeDir)
    return
  } */

  // 检查是否在可拖动区域
  if (isInDraggableArea(event)) {
    startDrag(event)
    return
  }
}

/**
 * 开始拖动
 */
function startDrag(event: MouseEvent): void {
  if (!chatDialog.value) return

  if (isResizing.value) return

  isDragging.value = true

  const rect = chatDialog.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

/**
 * 处理鼠标移动事件 - 统一入口
 */
function handleMouseMove(event: MouseEvent): void {

  // 调整大小逻辑
  /* if (isResizing.value) {
    handleResizeMove(event)
    return
  } */

  // 拖动逻辑
  if (isDragging.value) {
    handleDragMove(event)
    return
  }

  // 更新鼠标样式(根据是否在边缘区域)
  updateCursor(event)
}

/**
 * 拖动中
 */
function handleDragMove(event: MouseEvent): void {
  if (!chatDialog.value) return

  // 检查是否离开了可拖动区域
  if (!isInDraggableArea(event)) {
    stopDrag()
    return
  }

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

/**
 * 停止拖动
 */
function stopDrag(): void {
  isDragging.value = false
}

/**
 * 更新鼠标样式
 */
function updateCursor(event: MouseEvent): void {
  if (!chatDialog.value) return

  /* const edgeDir = getEdgeDirection(event)
  if (edgeDir) {
    const cursorMap: Record<string, string> = {
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize',
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize'
    }
    chatDialog.value.style.cursor = cursorMap[edgeDir] || 'default'
  } else  */if (isInDraggableArea(event)) {
    chatDialog.value.style.cursor = 'move'
  } else {
    chatDialog.value.style.cursor = 'default'
  }
}

/**
 * 处理鼠标松开事件 - 统一入口
 */
function handleMouseUp(): void {
  if (isDragging.value) {
    stopDrag()
  }

  if (isResizing.value) {
    stopResize()
  }
}

/* 暂时注释掉未使用的调整大小函数
/**
 * 开始调整大小
 *
function startResize(event: MouseEvent, direction: string): void {
  if (!chatDialog.value) return

  isResizing.value = true
  resizeDirection.value = direction
  resizeStartPos.value = { x: event.clientX, y: event.clientY }
  resizeStartSize.value = { ...dialogSize.value }
  resizeStartPosition.value = { ...dialogPosition.value }
}

/**
 * 调整大小中
 *
function handleResizeMove(event: MouseEvent): void {
  if (!isResizing.value || !chatDialog.value) return

  // 检查是否离开了边缘区域
  const edgeDir = getEdgeDirection(event)
  if (edgeDir == null) {
    stopResize()
    return
  }

  const deltaX = event.clientX - resizeStartPos.value.x
  const deltaY = event.clientY - resizeStartPos.value.y
  const direction = resizeDirection.value

  let newWidth = resizeStartSize.value.width
  let newHeight = resizeStartSize.value.height
  let newX = resizeStartPosition.value.x
  let newY = resizeStartPosition.value.y

  // 根据方向计算新的尺寸
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

  // 应用尺寸限制
  const constrainedWidth = Math.max(MIN_WIDTH, Math.min(newWidth, MAX_WIDTH))
  const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, MAX_HEIGHT))

  // 计算实际应用的尺寸变化
  const actualWidthDelta = constrainedWidth - resizeStartSize.value.width
  const actualHeightDelta = constrainedHeight - resizeStartSize.value.height

  // 更新尺寸
  dialogSize.value = { width: constrainedWidth, height: constrainedHeight }

  // 如果是从左边或上边调整,需要更新位置
  if (direction.includes('w') || direction.includes('n')) {
    if (direction.includes('w')) {
      newX = resizeStartPosition.value.x - actualWidthDelta
    }
    if (direction.includes('n')) {
      newY = resizeStartPosition.value.y - actualHeightDelta
    }

    // 限制在视口范围内
    newX = Math.max(0, Math.min(newX, window.innerWidth - constrainedWidth))
    newY = Math.max(0, Math.min(newY, window.innerHeight - constrainedHeight))

    dialogPosition.value = { x: newX, y: newY }
  }
}

/**
 * 停止调整大小
 */
function stopResize(): void {
  isResizing.value = false
  resizeDirection.value = ''
}

// 监听 sessionCode 变化，切换 WebSocket 连接
watch(() => props.sessionCode, (newSessionCode, oldSessionCode) => {
  if (newSessionCode && newSessionCode !== oldSessionCode) {
    console.log(`[ChatDialog] 会话切换: ${oldSessionCode} -> ${newSessionCode}`)
    initWebSocket(newSessionCode)

    // 会话切换时，设置标记让下次消息更新时强制滚动到底部
    shouldForceScrollOnNextUpdate.value = true
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

  // 组件挂载后，滚动到底部
  nextTick(() => {
    scrollToBottom()
  })
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
  width: 40vw;
  height: 80vh;
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  background: rgb(24, 24, 24);
}

// 消息内容区域（可滚动）
.f-messages-content {
  flex: 1 1 0;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;

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
  display: flex;
  width: 100%;
}

.f-user-message-box {
  display: inline-block;
  max-width: 80%;
  padding: 6px 12px;
  margin: 6px 0;
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
  margin-left: 5px;
  padding-right: 20px;
}

// 消息指示器容器（小点+连接线）
.f-message-indicator {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px; // 调整以对齐文字中间
}

// 小点
.f-indicator-dot {
  width: 6px;
  height: 6px;
  background: #666666;
  border-radius: 50%;
  flex-shrink: 0;

  &--green {
    background: #4ade80;
  }

  &--red {
    background: #ef4444;
  }
  z-index: 1;
}

// 连接线
.f-indicator-line {
  width: 1px;
  flex: 1;
  background: #3a3a3a;
  margin-top: 0; // 移除间隙，让线紧贴点
  margin-bottom: -20px; // 向下延伸覆盖消息间距(12px) + 下一条消息的 padding-top(8px)
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
}

// Agent 消息块样式
.f-agent-message-block {
  flex: 1;
  position: relative;
  padding: 12px 16px;
  background: rgb(49, 49, 49);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #e5e5e5;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;

  // 折叠状态
  &.is-collapsed {
    max-height: 150px;
    overflow: hidden;

    .f-agent-message-content {
      max-height: 150px;
      overflow: hidden;
      position: relative;

      // 渐变遮罩效果
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: linear-gradient(to bottom, transparent, rgb(49, 49, 49));
        pointer-events: none;
      }
    }

    // 鼠标悬停时显示 Show more 按钮
    .f-expand-btn {
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    &:hover .f-expand-btn {
      opacity: 1;
    }
  }
}

// Agent 消息内容容器
.f-agent-message-content {
  position: relative;
}

// 展开/折叠按钮
.f-expand-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 4px 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  color: #cccccc;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;

  &:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }

  // 展开状态的按钮始终显示
  &--expanded {
    opacity: 1 !important;
  }
}

// Agent 错误消息块样式
.f-agent-error-block {
  flex: 1;
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  color: #fca5a5;
  font-size: 13px;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
}

// Agent 终端输出块样式
.f-agent-terminal-block {
  flex: 1;
  padding: 12px 16px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  overflow-x: auto;
}

.f-terminal-content {
  margin: 0;
  color: #00ff00;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre;
  word-wrap: normal;
  overflow-wrap: normal;

  // 终端错误文本（红色）
  .f-terminal-error {
    color: #ff4444;
  }
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

// 附件预览区域（在输入框内部）
.f-input-row .f-attachments-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 0 8px 8px 8px;
  width: 100%;
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

// 动态提示区域（固定高度，独立于消息列表）
.f-prompt-area {
  min-height: 48px;
  padding: 8px 12px;
  background: rgb(24, 24, 24);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// 输入框外层容器
.f-chat-input {
  display: flex;
  justify-content: center;
  padding: 8px 0 20px;
  background: rgb(24, 24, 24);
  flex-shrink: 0;
}

// 输入框内层容器（圆角矩形）
.f-input-container {
  width: 90%;
  background: rgb(49, 49, 49);
  border-radius: 8px;
  overflow: visible; // 改为 visible，允许命令提示框显示在容器外
}

// 第一行：输入框和附件区域
.f-input-row {
  display: flex;
  flex-direction: column;
  width: 100%;
}

// 输入框包装器
.f-textarea-wrapper {
  display: flex;
  padding: 6px 8px;
  min-height: 38px;
  align-items: center;

  textarea {
    flex: 1;
    padding: 6px 8px;
    background: transparent;
    border: none;
    color: #cccccc;
    font-size: 13px;
    font-family: inherit;
    line-height: 1.4;
    outline: none;
    resize: none;
    min-height: 26px;
    max-height: 120px;
    overflow-y: auto;

    &::placeholder {
      color: #777777;
    }

    &:disabled {
      color: #666666;
      cursor: not-allowed;

      &::placeholder {
        color: #555555;
      }
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
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

// 第二行：控制按钮
.f-controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  min-height: 38px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.f-controls-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.f-controls-right {
  display: flex;
  gap: 8px;
  align-items: center;
}

.f-attach-btn {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 50%;
  color: #999999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .f-icon {
    width: 16px;
    height: 16px;
  }
}

.f-send-btn {
  width: 28px;
  height: 28px;
  background: #d97706;
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover:not(:disabled) {
    background: #ea580c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.is-sending {
    background: #dc2626;

    &:hover {
      background: #ef4444;
    }
  }
}
</style>
