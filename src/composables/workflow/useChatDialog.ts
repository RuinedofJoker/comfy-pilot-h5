import { ref, computed } from 'vue'
import { toast } from '@/utils/toast'
import { sendMessage } from '@/services/session'
import type { ChatMessage } from '@/types/session'

export function useChatDialog() {
  // 对话框状态
  const isChatVisible = ref(false)
  const isChatMinimized = ref(false)
  const chatPosition = ref({ x: 0, y: 0 })
  const isDraggingChat = ref(false)

  // 拖拽相关状态
  const dragStartPos = ref({ x: 0, y: 0 })
  const dragStartChatPos = ref({ x: 0, y: 0 })

  // 显示对话框
  function showChat(): void {
    isChatVisible.value = true
    isChatMinimized.value = false
  }

  // 隐藏对话框
  function hideChat(): void {
    isChatVisible.value = false
  }

  // 切换最小化状态
  function toggleMinimize(): void {
    isChatMinimized.value = !isChatMinimized.value
  }

  // 开始拖拽对话框
  function handleChatMouseDown(event: MouseEvent): void {
    isDraggingChat.value = true
    dragStartPos.value = { x: event.clientX, y: event.clientY }
    dragStartChatPos.value = { ...chatPosition.value }

    document.addEventListener('mousemove', handleChatMouseMove)
    document.addEventListener('mouseup', handleChatMouseUp)
  }

  // 拖拽移动
  function handleChatMouseMove(event: MouseEvent): void {
    if (!isDraggingChat.value) return

    const deltaX = event.clientX - dragStartPos.value.x
    const deltaY = event.clientY - dragStartPos.value.y

    chatPosition.value = {
      x: dragStartChatPos.value.x + deltaX,
      y: dragStartChatPos.value.y + deltaY
    }
  }

  // 结束拖拽
  function handleChatMouseUp(): void {
    isDraggingChat.value = false
    document.removeEventListener('mousemove', handleChatMouseMove)
    document.removeEventListener('mouseup', handleChatMouseUp)
  }

  // 发送消息
  async function handleSendMessage(
    sessionCode: string,
    content: string,
    messages: ChatMessage[]
  ): Promise<void> {
    if (!content.trim()) return

    try {
      // 添加用户消息到本地列表
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        sessionId: sessionCode,
        role: 'USER',
        content: content.trim(),
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      messages.push(userMessage)

      // 发送消息到服务器
      const response = await sendMessage(sessionCode, content.trim())

      // 添加 AI 回复到本地列表
      if (response) {
        messages.push(response)
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      toast.error('发送消息失败')
      // 移除临时用户消息
      const tempIndex = messages.findIndex(m => m.id.startsWith('temp-'))
      if (tempIndex !== -1) {
        messages.splice(tempIndex, 1)
      }
    }
  }

  return {
    // 状态
    isChatVisible,
    isChatMinimized,
    chatPosition,
    isDraggingChat,

    // 方法
    showChat,
    hideChat,
    toggleMinimize,
    handleChatMouseDown,
    handleSendMessage
  }
}
