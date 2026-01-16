/**
 * 管理员后台相关类型定义
 */

/**
 * ComfyUI 服务健康状态
 */
export type HealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN'

/**
 * ComfyUI 服务来源类型
 */
export type SourceType = 'MANUAL' | 'CODE_BASED'

/**
 * ComfyUI 服务认证模式
 */
export type AuthMode = 'NONE' | 'API_KEY' | 'BASIC_AUTH'

/**
 * ComfyUI 服务信息（管理员视图）
 */
export interface AdminComfyuiServer {
  id: string
  createTime: string
  updateTime: string
  serverKey: string
  serverName: string
  description?: string | null
  baseUrl: string
  authMode: AuthMode | null
  apiKey?: string | null
  timeoutSeconds: number
  maxRetries: number
  sourceType: SourceType
  isEnabled: boolean
  lastHealthCheckTime?: string | null
  healthStatus: HealthStatus
}

/**
 * 创建 ComfyUI 服务请求
 */
export interface CreateServerRequest {
  serverKey?: string
  serverName: string
  description?: string
  baseUrl: string
  authMode?: AuthMode
  apiKey?: string
  timeoutSeconds?: number
  maxRetries?: number
}

/**
 * 更新 ComfyUI 服务请求
 */
export interface UpdateServerRequest {
  serverName?: string
  description?: string
  baseUrl?: string
  authMode?: string
  apiKey?: string
  timeoutSeconds?: number
  maxRetries?: number
  isEnabled?: boolean
}
