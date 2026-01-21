/**
 * 会话相关类型定义（与后端 API 对应）
 */

/**
 * 会话状态
 */
export type SessionStatus = 'ACTIVE' | 'ARCHIVED'

export const SessionStatusValues = {
  ACTIVE: 'ACTIVE' as const,
  ARCHIVED: 'ARCHIVED' as const
}

/**
 * 消息角色
 */
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM'

export const MessageRoleValues = {
  USER: 'USER' as const,
  ASSISTANT: 'ASSISTANT' as const,
  SYSTEM: 'SYSTEM' as const
}

/**
 * 会话信息（与后端 ChatSessionDTO 对应）
 */
export interface ChatSession {
  id: string
  createTime: string
  updateTime: string
  sessionCode: string
  userId: string
  agentId: string
  title: string | null
  status: SessionStatus
}

/**
 * 聊天消息（与后端 ChatMessageDTO 对应）
 */
export interface ChatMessage {
  id: string
  createTime: string
  updateTime: string
  sessionId: string
  role: MessageRole
  content: string
  metadata?: Record<string, any>
}

/**
 * 创建会话请求
 */
export interface CreateSessionRequest {
  title?: string
}

/**
 * 更新会话请求
 */
export interface UpdateSessionRequest {
  title?: string
  status?: SessionStatus
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  sessionCode: string
  content: string
  agentCode?: string
}
