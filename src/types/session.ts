/**
 * 会话相关类型定义
 */

import type { AgentStatus } from './agent'

/**
 * 会话状态
 */
export type SessionStatus = 'active' | 'idle' | 'archived'

export const SessionStatusValues = {
  ACTIVE: 'active' as const,
  IDLE: 'idle' as const,
  ARCHIVED: 'archived' as const
}

/**
 * 会话信息
 */
export interface Session {
  id: string
  title: string
  workflowId: string
  workflowName: string
  agentType: AgentStatus
  status: SessionStatus
  summary?: string
  rules?: string
  messageCount: number
  lastMessageAt: string
  createdAt: string
  updatedAt: string
}

/**
 * 创建会话参数
 */
export interface CreateSessionParams {
  title: string
  workflowId: string
  agentType: AgentStatus
  rules?: string
}

/**
 * 更新会话参数
 */
export interface UpdateSessionParams {
  title?: string
  agentType?: AgentStatus
  rules?: string
  status?: SessionStatus
}
