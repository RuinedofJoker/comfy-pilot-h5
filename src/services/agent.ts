/**
 * Agent API 服务
 */

import http from './http'
import type {
  AgentConfig,
  AgentMessage,
  AgentChatRequest,
  AgentChatResponse
} from '@/types/agent'
import type { Session, CreateSessionParams, UpdateSessionParams } from '@/types/session'

/**
 * ========== Agent 对话 ==========
 */

/**
 * 发送消息给 Agent
 */
export function sendMessageToAgent(params: AgentChatRequest): Promise<AgentChatResponse> {
  return http.post('/api/agent/chat', params)
}

/**
 * 获取会话消息历史
 */
export function getSessionMessages(sessionId: string): Promise<AgentMessage[]> {
  return http.get(`/api/agent/sessions/${sessionId}/messages`)
}

/**
 * ========== 会话管理 ==========
 */

/**
 * 获取会话列表
 */
export function getSessionList(): Promise<Session[]> {
  return http.get('/api/agent/sessions')
}

/**
 * 获取会话详情
 */
export function getSessionDetail(id: string): Promise<Session> {
  return http.get(`/api/agent/sessions/${id}`)
}

/**
 * 创建会话
 */
export function createSession(params: CreateSessionParams): Promise<Session> {
  return http.post('/api/agent/sessions', params)
}

/**
 * 更新会话
 */
export function updateSession(id: string, params: UpdateSessionParams): Promise<Session> {
  return http.put(`/api/agent/sessions/${id}`, params)
}

/**
 * 删除会话
 */
export function deleteSession(id: string): Promise<void> {
  return http.delete(`/api/agent/sessions/${id}`)
}

/**
 * ========== Agent 配置 ==========
 */

/**
 * 获取可用 Agent 列表
 */
export function getAvailableAgents(): Promise<AgentConfig[]> {
  return http.get('/api/agent/configs')
}
