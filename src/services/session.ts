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
 * @param comfyuiServerId 可选的 ComfyUI 服务 ID，用于过滤特定服务的会话
 */
export function listActiveSessions(comfyuiServerId?: string): Promise<ChatSession[]> {
  return http.get('/api/v1/sessions/active', {
    params: comfyuiServerId ? { comfyuiServerId } : undefined
  })
}

/**
 * 查询会话详情
 */
export function getSessionByCode(sessionCode: string): Promise<ChatSession> {
  return http.get(`/api/v1/sessions/${sessionCode}`)
}

/**
 * 更新会话
 */
export function updateSession(sessionCode: string, data: UpdateSessionRequest): Promise<string> {
  return http.put(`/api/v1/sessions/${sessionCode}`, data)
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
