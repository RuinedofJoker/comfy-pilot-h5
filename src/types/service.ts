/**
 * ComfyUI 服务相关类型定义
 */

/**
 * 服务来源类型
 */
export type SourceType = 'MANUAL' | 'CODE_BASED'

export const SourceTypeValues = {
  MANUAL: 'MANUAL' as const,
  CODE_BASED: 'CODE_BASED' as const
}

/**
 * 健康状态
 */
export type HealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN'

export const HealthStatusValues = {
  HEALTHY: 'HEALTHY' as const,
  UNHEALTHY: 'UNHEALTHY' as const,
  UNKNOWN: 'UNKNOWN' as const
}

/**
 * 认证模式
 */
export type AuthMode = 'NONE' | 'API_KEY' | 'BASIC_AUTH'

export const AuthModeValues = {
  NONE: 'NONE' as const,
  API_KEY: 'API_KEY' as const,
  BASIC_AUTH: 'BASIC_AUTH' as const
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
  authMode: AuthMode | null
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
