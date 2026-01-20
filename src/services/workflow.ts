/**
 * 工作流 API 服务（与后端 API 对应）
 */

import http from './http'
import type {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  SaveWorkflowContentRequest,
  ListWorkflowsParams,
  WorkflowVersion,
  CreateVersionRequest
} from '@/types/workflow'

/**
 * 查询工作流列表
 */
export function listWorkflows(params?: ListWorkflowsParams): Promise<Workflow[]> {
  return http.get('/api/v1/workflows', { params })
}

/**
 * 查询工作流详情
 */
export function getWorkflowById(id: string): Promise<Workflow> {
  return http.get(`/api/v1/workflows/${id}`)
}

/**
 * 创建工作流
 */
export function createWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
  return http.post('/api/v1/workflows', data)
}

/**
 * 更新工作流信息
 */
export function updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<Workflow> {
  return http.put(`/api/v1/workflows/${id}`, data)
}

/**
 * 删除工作流
 */
export function deleteWorkflow(id: string): Promise<void> {
  return http.delete(`/api/v1/workflows/${id}`)
}

/**
 * 获取工作流内容
 */
export function getWorkflowContent(id: string): Promise<string> {
  return http.get(`/api/v1/workflows/${id}/content`)
}

/**
 * 保存工作流内容
 */
export function saveWorkflowContent(id: string, data: SaveWorkflowContentRequest): Promise<Workflow> {
  return http.post(`/api/v1/workflows/${id}/content`, data)
}

/**
 * 查询工作流版本列表
 */
export function listWorkflowVersions(workflowId: string): Promise<WorkflowVersion[]> {
  return http.get(`/api/v1/workflows/${workflowId}/versions`)
}

/**
 * 创建工作流版本
 */
export function createWorkflowVersion(workflowId: string, data: CreateVersionRequest): Promise<WorkflowVersion> {
  return http.post(`/api/v1/workflows/${workflowId}/versions`, data)
}

/**
 * 查询工作流版本详情
 */
export function getWorkflowVersionById(workflowId: string, versionId: string): Promise<WorkflowVersion> {
  return http.get(`/api/v1/workflows/${workflowId}/versions/${versionId}`)
}
