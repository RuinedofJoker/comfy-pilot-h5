/**
 * 会话管理相关 API 服务（与后端 API 对应）
 */
import http from './http'
import type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  UpdateSessionRequest
} from '@/types/session'

/**
 * 创建会话
 * @returns 会话编码
 */
export function createSession(data: CreateSessionRequest): Promise<string> {
  return http.post('/api/v1/sessions', data)
}

/**
 * 查询用户活跃会话列表
 */
export function listActiveSessions(): Promise<ChatSession[]> {
  return http.get('/api/v1/sessions')
}

/**
 * 查询会话详情
 */
export function getSessionByCode(sessionCode: string): Promise<ChatSession> {
  return http.get(`/api/v1/sessions/${sessionCode}`)
}

/**
 * 查询消息历史
 */
export function getSessionMessages(sessionCode: string): Promise<ChatMessage[]> {
  return http.get(`/api/v1/sessions/${sessionCode}/messages`)
}

/**
 * 归档会话
 */
export function archiveSession(sessionCode: string): Promise<void> {
  return http.post(`/api/v1/sessions/${sessionCode}/archive`)
}
