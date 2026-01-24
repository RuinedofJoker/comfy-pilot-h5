import { ref, computed } from 'vue'
import { toast } from '@/utils/toast'
import type { ChatMessage } from '@/types/session'
import type { ChatContent } from '@/types/chat-content'

export function useChatDialog() {
  // 对话框状态
  const isChatVisible = ref(false)
  const isChatMinimized = ref(false)

  // 显示对话框
  function showChat(): void {
    isChatVisible.value = true
    isChatMinimized.value = false
  }

  // 隐藏对话框
  function hideChat(): void {
    isChatVisible.value = false
    isChatMinimized.value = false
  }

  // 切换最小化状态
  function toggleMinimize(): void {
    isChatMinimized.value = !isChatMinimized.value
  }

  // 发送消息
  async function handleSendMessage(
    sessionCode: string,
    content: string,
    messages: ChatMessage[],
    attachments?: ChatContent[]
  ): Promise<void> {
    if (!content.trim()) return

    // TODO: 实现消息发送逻辑
    // 1. 构建包含多模态数据的消息
    // 2. 通过 WebSocket 发送到后端
    console.log('发送消息:', { sessionCode, content, attachments })
  }

  return {
    // 状态
    isChatVisible,
    isChatMinimized,

    // 方法
    showChat,
    hideChat,
    toggleMinimize,
    handleSendMessage
  }
}
