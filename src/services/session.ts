/**
 * 会话管理相关 API 服务（与后端 API 对应）
 */
import http from './http'
import type {
  ChatSession,
  ChatMessage,
  CreateSessionRequest,
  UpdateSessionRequest,
  SendMessageRequest
} from '@/types/session'
import { agentRuntimeApi } from './agent'
import type { AgentExecutionRequest } from '@/types/agent'

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

/**
 * 发送消息到会话（通过 Agent 执行）
 * @param sessionCode 会话编码
 * @param content 消息内容
 * @param agentCode Agent 编码（可选，默认使用会话关联的 Agent）
 * @returns AI 助手的回复消息
 */
export async function sendMessage(
  sessionCode: string,
  content: string,
  agentCode?: string
): Promise<ChatMessage> {
  // 如果没有指定 agentCode，先获取会话信息以获取关联的 Agent
  let targetAgentCode = agentCode
  if (!targetAgentCode) {
    const session = await getSessionByCode(sessionCode)
    targetAgentCode = session.agentId
  }

  // 构建 Agent 执行请求
  const executionRequest: AgentExecutionRequest = {
    sessionId: sessionCode,
    input: content,
    isStreamable: false
  }

  // 执行 Agent
  const response = await agentRuntimeApi.executeAgent(targetAgentCode, executionRequest)

  // 将 Agent 响应转换为 ChatMessage 格式
  const assistantMessage: ChatMessage = {
    id: response.logId,
    createTime: new Date(response.executionStartMs).toISOString(),
    updateTime: new Date(response.executionStartMs + response.executionTimeMs).toISOString(),
    sessionId: sessionCode,
    role: 'ASSISTANT',
    content: response.output,
    metadata: {
      status: response.status,
      errorMessage: response.errorMessage,
      executionTimeMs: response.executionTimeMs
    }
  }

  return assistantMessage
}
