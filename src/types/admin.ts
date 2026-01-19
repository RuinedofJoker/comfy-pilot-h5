/**
 * 管理员后台相关类型定义
 */

/**
 * ComfyUI 服务健康状态
 */
export type HealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'UNKNOWN'

/**
 * ComfyUI 服务认证模式
 */
export type AuthMode = 'NULL' | 'BASIC_AUTH'

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
