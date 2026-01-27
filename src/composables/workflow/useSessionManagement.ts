import { ref } from 'vue'
import { toast } from '@/utils/toast'
import {
  listActiveSessions,
  getSessionByCode,
  getSessionMessages,
  createSession,
  updateSession,
  deleteSession
} from '@/services/session'
import type { ChatSession, ChatMessage, CreateSessionRequest, UpdateSessionRequest } from '@/types/session'

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

  // 取消选择会话
  function unselectSession(): void {
    currentSessionCode.value = null
    currentSession.value = null
    messages.value = []
  }

  // 创建新会话
  async function handleCreateSession(data: CreateSessionRequest): Promise<void> {
    try {
      const sessionCode = await createSession(data)
      await loadSessions()
      await selectSession(sessionCode)
      toast.success('会话创建成功')
    } catch (error) {
      console.error('创建会话失败:', error)
      toast.error('创建会话失败')
      throw error
    }
  }

  // 更新会话
  async function handleUpdateSession(sessionCode: string, data: UpdateSessionRequest): Promise<void> {
    try {
      await updateSession(sessionCode, data)
      await loadSessions()

      // 如果更新的是当前会话,重新加载当前会话详情
      if (currentSessionCode.value === sessionCode) {
        currentSession.value = await getSessionByCode(sessionCode)
      }

      toast.success('会话更新成功')
    } catch (error) {
      console.error('更新会话失败:', error)
      toast.error('更新会话失败')
      throw error
    }
  }

  // 删除会话
  async function handleDeleteSession(sessionCode: string): Promise<void> {
    try {
      await deleteSession(sessionCode)
      await loadSessions()

      // 如果删除的是当前会话，清空当前会话状态
      if (currentSessionCode.value === sessionCode) {
        unselectSession()
      }

      toast.success('会话删除成功')
    } catch (error) {
      console.error('删除会话失败:', error)
      toast.error('删除会话失败')
      throw error
    }
  }

  return {
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
  }
}
