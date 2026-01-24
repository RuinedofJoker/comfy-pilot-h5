/**
 * Agent 管理相关 API 服务
 */
import request from './http'
import type {
  AgentConfig,
  AgentRuntimeConfig
} from '@/types/agent'

/**
 * Agent 管理 API
 */
export const agentApi = {
  /**
   * 获取所有 Agent
   */
  getAllAgents: (): Promise<AgentConfig[]> => {
    return request.get('/api/v1/agents')
  },

  /**
   * 根据 ID 获取 Agent
   */
  getAgentById: (id: string): Promise<AgentConfig> => {
    return request.get(`/api/v1/agents/${id}`)
  },

  /**
   * 根据编码获取 Agent
   */
  getAgentByCode: (agentCode: string): Promise<AgentConfig> => {
    return request.get(`/api/v1/agents/code/${agentCode}`)
  },

  /**
   * 启用 Agent
   */
  enableAgent: (id: string): Promise<void> => {
    return request.post(`/api/v1/agents/${id}/enable`)
  },

  /**
   * 禁用 Agent
   */
  disableAgent: (id: string): Promise<void> => {
    return request.post(`/api/v1/agents/${id}/disable`)
  }
}

/**
 * Agent 运行时 API
 */
export const agentRuntimeApi = {
  /**
   * 获取已启用的 Agent（运行时）
   */
  getEnabledAgents: (): Promise<AgentRuntimeConfig[]> => {
    return request.get('/api/v1/agents/runtime/enabled')
  },

  /**
   * 根据编码获取 Agent（运行时）
   */
  getAgentByCode: (agentCode: string): Promise<AgentRuntimeConfig> => {
    return request.get(`/api/v1/agents/runtime/code/${agentCode}`)
  }
}
