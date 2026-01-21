import { ref } from 'vue'
import { toast } from '@/utils/toast'
import { listActiveSessions, getSessionByCode, getSessionMessages, createSession } from '@/services/session'
import type { ChatSession, ChatMessage } from '@/types/session'

export function useSessionManagement(serviceId: string) {
  // 会话相关状态
  const sessions = ref<ChatSession[]>([])
  const currentSessionCode = ref<string | null>(null)
  const currentSession = ref<ChatSession | null>(null)
  const messages = ref<ChatMessage[]>([])

  // 加载会话列表
  async function loadSessions(): Promise<void> {
    try {
      sessions.value = await listActiveSessions(serviceId)
    } catch (error) {
      console.error('加载会话列表失败:', error)
      toast.error('加载会话列表失败')
    }
  }

  // 选择会话
  async function selectSession(sessionCode: string): Promise<void> {
    if (currentSessionCode.value === sessionCode) return

    currentSessionCode.value = sessionCode

    try {
      currentSession.value = await getSessionByCode(sessionCode)
      messages.value = await getSessionMessages(sessionCode)
    } catch (error) {
      console.error('加载会话失败:', error)
      toast.error('加载会话失败')
    }
  }

  // 创建新会话
  async function handleCreateSession(): Promise<void> {
    try {
      const sessionCode = await createSession({ title: '新会话' })
      await loadSessions()
      await selectSession(sessionCode)
      toast.success('会话创建成功')
    } catch (error) {
      console.error('创建会话失败:', error)
      toast.error('创建会话失败')
    }
  }

  return {
    sessions,
    currentSessionCode,
    currentSession,
    messages,
    loadSessions,
    selectSession,
    handleCreateSession
  }
}
