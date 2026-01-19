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
 * 注意：后端使用小写+下划线格式
 */
export type AuthMode = 'null' | 'basic_auth'

export const AuthModeValues = {
  NULL: 'null' as const,
  BASIC_AUTH: 'basic_auth' as const
}

/**
 * 连接类型
 */
export type ConnectionType = 'LOCAL' | 'SSH'

export const ConnectionTypeValues = {
  LOCAL: 'LOCAL' as const,
  SSH: 'SSH' as const
}

/**
 * SSH 认证类型
 */
export type SshAuthType = 'PASSWORD' | 'KEY'

export const SshAuthTypeValues = {
  PASSWORD: 'PASSWORD' as const,
  KEY: 'KEY' as const
}

/**
 * SSH 配置（与后端 SshConnectionConfigDTO 对应）
 */
export interface SshConfig {
  host: string
  port: number
  username: string
  authType: SshAuthType
  password?: string
  privateKeyPath?: string
}

/**
 * 目录配置（与后端 ComfyuiDirectoryConfigDTO 对应）
 */
export interface DirectoryConfig {
  comfyuiInstallPath?: string
  baseDirectory?: string
  outputDirectory?: string
  tempDirectory?: string
  inputDirectory?: string
  userDirectory?: string
  frontEndRoot?: string
  extraModelPathsConfig?: string
}

/**
 * 高级功能配置（与后端 ComfyuiServerAdvancedFeaturesDTO 对应）
 */
export interface AdvancedFeatures {
  connectionType: ConnectionType
  sshConfig?: SshConfig
  osType?: string
  workingDirectory: string
  environmentInitScript?: string
  pythonCommand?: string
  directoryConfig: DirectoryConfig
  lastConnectionTestTime?: string
  connectionStatus?: string
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
  isEnabled: boolean
  lastHealthCheckTime: string | null
  healthStatus: HealthStatus
  advancedFeaturesEnabled?: boolean
  advancedFeatures?: AdvancedFeatures
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
  advancedFeaturesEnabled?: boolean
  advancedFeatures?: AdvancedFeatures
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
  advancedFeaturesEnabled?: boolean
  advancedFeatures?: AdvancedFeatures
}

/**
 * 查询服务列表参数
 */
export interface ListServicesParams {
  sourceType?: SourceType
  isEnabled?: boolean
}
