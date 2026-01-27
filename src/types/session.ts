/**
 * 会话相关类型定义（与后端 API 对应）
 */

import type { PersistableChatMessage } from './chat-message'

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
  comfyuiServerId: string
  agentCode: string
  agentConfig?: string
  title?: string
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
  chatContent?: string
  /** chatContent 反序列化后的结果 */
  chatData?: PersistableChatMessage
  metadata?: Record<string, any>
}

/**
 * 创建会话请求
 */
export interface CreateSessionRequest {
  comfyuiServerId: string
  title?: string
}

/**
 * 更新会话请求
 */
export interface UpdateSessionRequest {
  title?: string
}
