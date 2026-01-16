/**
 * 工作流 API 服务
 */

import http from './http'
import type {
  Workflow,
  CreateWorkflowParams,
  UpdateWorkflowParams
} from '@/types/workflow'
import type { PaginationParams, PaginationData } from '@/types/api'

/**
 * 获取工作流列表（分页）
 */
export function getWorkflowList(params: PaginationParams): Promise<PaginationData<Workflow>> {
  return http.get('/api/workflows', { params })
}

/**
 * 获取我的工作流列表
 */
export function getMyWorkflows(): Promise<Workflow[]> {
  return http.get('/api/workflows/my')
}

/**
 * 获取工作流详情
 */
export function getWorkflowDetail(id: string): Promise<Workflow> {
  return http.get(`/api/workflows/${id}`)
}

/**
 * 创建工作流
 */
export function createWorkflow(params: CreateWorkflowParams): Promise<Workflow> {
  return http.post('/api/workflows', params)
}

/**
 * 更新工作流
 */
export function updateWorkflow(id: string, params: UpdateWorkflowParams): Promise<Workflow> {
  return http.put(`/api/workflows/${id}`, params)
}

/**
 * 删除工作流
 */
export function deleteWorkflow(id: string): Promise<void> {
  return http.delete(`/api/workflows/${id}`)
}

/**
 * 保存工作流
 */
export function saveWorkflow(id: string, jsonData: unknown): Promise<void> {
  return http.post(`/api/workflows/${id}/save`, { jsonData })
}

/**
 * 导出工作流
 */
export function exportWorkflow(id: string): Promise<Blob> {
  return http.get(`/api/workflows/${id}/export`, {
    responseType: 'blob'
  })
}

/**
 * 导入工作流
 */
export function importWorkflow(file: File): Promise<Workflow> {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/workflows/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
