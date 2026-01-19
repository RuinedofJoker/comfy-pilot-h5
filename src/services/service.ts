/**
 * ComfyUI 服务 API
 */

import http from './http'
import type {
  ComfyUIService,
  CreateServiceParams,
  UpdateServiceParams,
  ListServicesParams
} from '@/types/service'

/**
 * 查询服务列表
 */
export function listServers(params?: ListServicesParams): Promise<ComfyUIService[]> {
  return http.get('/api/v1/comfyui-servers', { params })
}

/**
 * 查询已启用的服务列表（前台用户使用）
 */
export function listEnabledServers(): Promise<ComfyUIService[]> {
  return http.get('/api/v1/comfyui-servers/enabled')
}

/**
 * 根据 ID 查询服务详情
 */
export function getServerById(id: string): Promise<ComfyUIService> {
  return http.get(`/api/v1/comfyui-servers/${id}`)
}

/**
 * 根据标识符查询服务
 */
export function getServerByKey(serverKey: string): Promise<ComfyUIService> {
  return http.get(`/api/v1/comfyui-servers/key/${serverKey}`)
}

/**
 * 创建服务
 */
export function createServer(data: CreateServiceParams): Promise<ComfyUIService> {
  return http.post('/api/v1/comfyui-servers', data)
}

/**
 * 更新服务
 */
export function updateServer(id: string, data: UpdateServiceParams): Promise<ComfyUIService> {
  return http.put(`/api/v1/comfyui-servers/${id}`, data)
}

/**
 * 删除服务
 */
export function deleteServer(id: string): Promise<void> {
  return http.delete(`/api/v1/comfyui-servers/${id}`)
}

/**
 * 测试服务连接（手动健康检查）
 */
export function testServerConnection(id: string): Promise<ComfyUIService> {
  return http.post(`/api/v1/comfyui-servers/${id}/health-check`)
}
