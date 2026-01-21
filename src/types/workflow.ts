/**
 * 工作流相关类型定义（与后端 API 对应）
 */

/**
 * 工作流信息（与后端 WorkflowDTO 对应）
 */
export interface Workflow {
  id: string
  createTime: string
  updateTime: string
  workflowName: string
  description: string | null
  comfyuiServerId: string
  comfyuiServerKey: string
  activeContent: string | null
  activeContentHash: string | null
  thumbnailUrl: string | null
  isLocked: boolean
  lockedBy: string | null
  lockedAt: string | null
}

/**
 * 创建工作流请求（与后端 CreateWorkflowRequest 对应）
 */
export interface CreateWorkflowRequest {
  workflowName: string
  description?: string
  comfyuiServerId: string
  comfyuiServerKey: string
}

/**
 * 更新工作流请求（与后端 UpdateWorkflowRequest 对应）
 */
export interface UpdateWorkflowRequest {
  workflowName?: string
  description?: string
  thumbnailUrl?: string
}

/**
 * 保存工作流内容请求（与后端 SaveWorkflowContentRequest 对应）
 */
export interface SaveWorkflowContentRequest {
  content: string
}

/**
 * 查询工作流列表参数
 */
export interface ListWorkflowsParams {
  comfyuiServerId?: string
  isLocked?: boolean
  createBy?: string
}

/**
 * 工作流版本信息（与后端 WorkflowVersionDTO 对应）
 */
export interface WorkflowVersion {
  id: string
  createTime: string
  updateTime: string
  workflowId: string
  versionNumber: number
  content: string
  contentHash: string
  changeSummary: string | null
  sessionId: string | null
}

/**
 * 创建工作流版本请求（与后端 CreateVersionRequest 对应）
 */
export interface CreateVersionRequest {
  content: string
  changeSummary?: string
  sessionId?: string
}

/**
 * 工作流 JSON 数据结构（ComfyUI 格式）
 */
export interface WorkflowJsonData {
  nodes: WorkflowNode[]
  links?: WorkflowLink[]
  groups?: WorkflowGroup[]
  config?: Record<string, unknown>
  extra?: Record<string, unknown>
  version?: number
}

/**
 * 工作流节点（ComfyUI 节点格式）
 */
export interface WorkflowNode {
  id: number
  type: string
  pos: [number, number]
  size: [number, number]
  flags?: Record<string, unknown>
  order?: number
  mode?: number
  inputs?: NodeInput[]
  outputs?: NodeOutput[]
  properties?: Record<string, unknown>
  widgets_values?: unknown[]
  title?: string
  color?: string
  bgcolor?: string
}

/**
 * 节点输入
 */
export interface NodeInput {
  name: string
  type: string
  link: number | null
  widget?: {
    name: string
  }
}

/**
 * 节点输出
 */
export interface NodeOutput {
  name: string
  type: string
  links: number[] | null
  slot_index?: number
}

/**
 * 工作流连接（ComfyUI 链接格式）
 */
export interface WorkflowLink {
  0: number // link_id
  1: number // origin_id
  2: number // origin_slot
  3: number // target_id
  4: number // target_slot
  5: string // type
}

/**
 * 工作流分组
 */
export interface WorkflowGroup {
  title: string
  bounding: [number, number, number, number]
  color?: string
  font_size?: number
}

/**
 * 工作流执行输出文件（图片、视频等）
 */
export interface WorkflowOutputFile {
  filename: string
  subfolder: string
  type: string
  url?: string
  fullUrl?: string
}

/**
 * 节点执行输出
 */
export interface WorkflowNodeOutput {
  images?: WorkflowOutputFile[]
  videos?: WorkflowOutputFile[]
  gifs?: WorkflowOutputFile[]
  audio?: WorkflowOutputFile[]
}

/**
 * 执行状态
 */
export interface WorkflowExecutionStatus {
  status_str: string
  completed: boolean
  messages?: Array<[string, Record<string, any>]>
}

/**
 * 工作流执行结果
 */
export interface WorkflowExecutionResult {
  success: boolean
  promptId: string
  outputs?: {
    outputs: Record<string, WorkflowNodeOutput>
  } | null
  status?: WorkflowExecutionStatus | null
  error?: string
  outputError?: string
}
