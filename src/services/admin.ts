/**
 * 管理后台 API 服务
 */

import http from './http'
import type {
  ComfyUIService,
  CreateServiceParams,
  UpdateServiceParams,
  ServiceStats
} from '@/types/service'
import type {
  AgentConfig,
  CreateAgentParams,
  UpdateAgentParams
} from '@/types/agent'

/**
 * ========== 服务管理 ==========
 */

/**
 * 获取服务列表
 */
export function getServiceList(): Promise<ComfyUIService[]> {
  return http.get('/api/admin/services')
}

/**
 * 获取服务详情
 */
export function getServiceDetail(id: string): Promise<ComfyUIService> {
  return http.get(`/api/admin/services/${id}`)
}

/**
 * 创建服务
 */
export function createService(params: CreateServiceParams): Promise<ComfyUIService> {
  return http.post('/api/admin/services', params)
}

/**
 * 更新服务
 */
export function updateService(id: string, params: UpdateServiceParams): Promise<ComfyUIService> {
  return http.put(`/api/admin/services/${id}`, params)
}

/**
 * 删除服务
 */
export function deleteService(id: string): Promise<void> {
  return http.delete(`/api/admin/services/${id}`)
}

/**
 * 测试服务连接
 */
export function testServiceConnection(id: string): Promise<boolean> {
  return http.post(`/api/admin/services/${id}/test`)
}

/**
 * 获取服务统计
 */
export function getServiceStats(): Promise<ServiceStats> {
  return http.get('/api/admin/services/stats')
}

/**
 * ========== Agent 管理 ==========
 */

/**
 * 获取 Agent 列表
 */
export function getAgentList(): Promise<AgentConfig[]> {
  return http.get('/api/admin/agents')
}

/**
 * 获取 Agent 详情
 */
export function getAgentDetail(id: string): Promise<AgentConfig> {
  return http.get(`/api/admin/agents/${id}`)
}

/**
 * 创建 Agent
 */
export function createAgent(params: CreateAgentParams): Promise<AgentConfig> {
  return http.post('/api/admin/agents', params)
}

/**
 * 更新 Agent
 */
export function updateAgent(id: string, params: UpdateAgentParams): Promise<AgentConfig> {
  return http.put(`/api/admin/agents/${id}`, params)
}

/**
 * 删除 Agent
 */
export function deleteAgent(id: string): Promise<void> {
  return http.delete(`/api/admin/agents/${id}`)
}
