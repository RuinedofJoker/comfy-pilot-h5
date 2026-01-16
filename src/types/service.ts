/**
 * ComfyUI 服务相关类型定义
 */

/**
 * 服务来源类型
 */
export enum SourceType {
  MANUAL = 'MANUAL',
  CODE_BASED = 'CODE_BASED'
}

/**
 * 健康状态
 */
export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN'
}

/**
 * ComfyUI 服务信息（与后端 ComfyuiServerDTO 对应）
 */
export interface ComfyUIService {
  id: string
  createTime: string
  updateTime: string
  serverKey: string
  serverName: string
  description: string | null
  baseUrl: string
  authMode: string | null
  apiKey: string | null
  timeoutSeconds: number
  maxRetries: number
  sourceType: SourceType
  isEnabled: boolean
  lastHealthCheckTime: string | null
  healthStatus: HealthStatus
}

/**
 * 创建服务参数（与后端 CreateServerRequest 对应）
 */
export interface CreateServiceParams {
  serverKey?: string
  serverName: string
  description?: string
  baseUrl: string
  authMode?: string
  apiKey?: string
  timeoutSeconds?: number
  maxRetries?: number
}

/**
 * 更新服务参数（与后端 UpdateServerRequest 对应）
 */
export interface UpdateServiceParams {
  serverName?: string
  description?: string
  baseUrl?: string
  authMode?: string
  apiKey?: string
  timeoutSeconds?: number
  maxRetries?: number
  isEnabled?: boolean
}

/**
 * 查询服务列表参数
 */
export interface ListServicesParams {
  sourceType?: SourceType
  isEnabled?: boolean
}
