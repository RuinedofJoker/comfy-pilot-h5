/**
 * Agent 相关类型定义
 */

/**
 * Agent 类型
 */
export enum AgentType {
  WORKFLOW_EDITOR = 'workflow_editor',
  WORKFLOW_ANALYZER = 'workflow_analyzer',
  GENERAL_ASSISTANT = 'general_assistant'
}

/**
 * Agent 配置信息
 */
export interface AgentConfig {
  id: string
  name: string
  type: AgentType
  description?: string
  modelProvider: string
  modelName: string
  temperature: number
  maxTokens: number
  systemPrompt?: string
  enabled: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 创建 Agent 参数
 */
export interface CreateAgentParams {
  name: string
  type: AgentType
  description?: string
  modelProvider: string
  modelName: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

/**
 * 更新 Agent 参数
 */
export interface UpdateAgentParams {
  name?: string
  description?: string
  modelProvider?: string
  modelName?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  enabled?: boolean
}

/**
 * Agent 消息
 */
export interface AgentMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

/**
 * Agent 对话请求
 */
export interface AgentChatRequest {
  sessionId: string
  message: string
  workflowId?: string
}

/**
 * Agent 对话响应
 */
export interface AgentChatResponse {
  messageId: string
  content: string
  workflowModified: boolean
  timestamp: string
}
