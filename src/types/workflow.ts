/**
 * 工作流相关类型定义
 */

/**
 * 工作流状态
 */
export enum WorkflowStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * 工作流信息
 */
export interface Workflow {
  id: string
  name: string
  description?: string
  serviceId: string
  serviceName: string
  status: WorkflowStatus
  jsonData: WorkflowJsonData
  sessionCount: number
  versionCount: number
  lastUsed: string
  createdAt: string
  updatedAt: string
}

/**
 * 工作流 JSON 数据结构
 */
export interface WorkflowJsonData {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  metadata: WorkflowMetadata
}

/**
 * 工作流节点
 */
export interface WorkflowNode {
  id: number
  type: string
  pos: [number, number]
  size: [number, number]
  flags: Record<string, unknown>
  order: number
  mode: number
  inputs?: NodeInput[]
  outputs?: NodeOutput[]
  properties: Record<string, unknown>
  widgets_values: unknown[]
}

/**
 * 节点输入
 */
export interface NodeInput {
  name: string
  type: string
  link: number | null
}

/**
 * 节点输出
 */
export interface NodeOutput {
  name: string
  type: string
  links: number[]
}

/**
 * 工作流连接
 */
export interface WorkflowConnection {
  id: number
  origin_id: number
  origin_slot: number
  target_id: number
  target_slot: number
}

/**
 * 工作流元数据
 */
export interface WorkflowMetadata {
  name: string
  version: string
  description?: string
  author?: string
  tags?: string[]
}

/**
 * 创建工作流参数
 */
export interface CreateWorkflowParams {
  name: string
  description?: string
  serviceId: string
  jsonData?: WorkflowJsonData
}

/**
 * 更新工作流参数
 */
export interface UpdateWorkflowParams {
  name?: string
  description?: string
  status?: WorkflowStatus
  jsonData?: WorkflowJsonData
}
