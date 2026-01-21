<template>
  <div
    v-if="visible"
    ref="chatDialog"
    class="f-chat-dialog"
    :class="{ minimized: isMinimized, dragging: isDragging }"
    :style="{
      left: dialogPosition.x ? `${dialogPosition.x}px` : undefined,
      top: dialogPosition.y ? `${dialogPosition.y}px` : undefined,
      right: dialogPosition.x ? 'auto' : undefined,
      bottom: dialogPosition.y ? 'auto' : undefined
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
    </div>

    <div v-show="!isMinimized" class="f-chat-input">
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
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { ChatMessage } from '@/types/session'

// Props
interface Props {
  visible: boolean
  isMinimized: boolean
  sessionTitle: string | null
  messages: ChatMessage[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'toggle-minimize': []
  'close': []
  'send-message': [content: string]
}>()

// 本地状态
const inputValue = ref('')
const chatMessages = ref<HTMLDivElement | null>(null)
const chatDialog = ref<HTMLDivElement | null>(null)
const chatHeader = ref<HTMLDivElement | null>(null)

// 拖动相关状态
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const dialogPosition = ref({ x: 0, y: 0 })

// 发送消息
function handleSend(): void {
  if (!inputValue.value.trim()) return

  emit('send-message', inputValue.value)
  inputValue.value = ''
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
}

// 生命周期
onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
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

// 输入框
.f-chat-input {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid #3a3a3a;
  background: #242424;
  flex-shrink: 0;

  input {
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
</style>
