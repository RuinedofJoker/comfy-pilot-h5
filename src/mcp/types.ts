/**
 * MCP 工具系统类型定义
 */

/**
 * 工具执行策略
 */
export type ToolExecutionPolicy = 'ask-every-time' | 'auto-execute'

/**
 * 工具集类型
 */
export type McpToolSetType = 'built-in' | 'external-mcp'

/**
 * MCP 传输协议类型
 */
export type McpTransportType = 'http' | 'sse'

/**
 * MCP 认证类型
 */
export type McpAuthType = 'none' | 'bearer' | 'api-key'

/**
 * MCP 工具 Schema (符合 MCP 协议)
 */
export interface McpToolSchema {
  /** 工具名称 */
  name: string
  /** 工具描述 */
  description?: string
  /** 输入参数 Schema */
  inputSchema: {
    type: 'object'
    properties?: Record<string, any>
    required?: string[]
  }
}

/**
 * 工具集配置 (存储在 localStorage)
 */
export interface McpToolSetConfig {
  /** 工具集 ID */
  id: string
  /** 是否启用 */
  enabled: boolean
  /** 执行策略 */
  executionPolicy: ToolExecutionPolicy
}

/**
 * MCP 服务器认证配置
 */
export interface McpServerAuth {
  /** 认证类型 */
  type: McpAuthType
  /** Bearer Token 或 API Key */
  token?: string
}

/**
 * 外部 MCP 服务器配置
 */
export interface McpServerConfig {
  /** 服务器唯一 ID */
  id: string
  /** 服务器名称 */
  name: string
  /** 服务器描述 */
  description?: string
  /** 服务器 URL */
  url: string
  /** 传输协议 */
  transport: McpTransportType
  /** 认证配置 */
  auth?: McpServerAuth
  /** 是否启用 */
  enabled: boolean
  /** 执行策略 */
  executionPolicy: ToolExecutionPolicy
}

/**
 * MCP 配置 (存储在 localStorage)
 */
export interface McpConfig {
  /** 配置版本 */
  version: string
  /** 工具集配置列表 */
  toolSets: McpToolSetConfig[]
  /** 外部 MCP 服务器配置列表 */
  externalServers: McpServerConfig[]
}

/**
 * 工具集接口
 */
export interface McpToolSet {
  /** 工具集唯一 ID */
  id: string
  /** 工具集名称 */
  name: string
  /** 工具集描述 */
  description: string
  /** 工具集类型 */
  type: McpToolSetType
  /** 是否为内置工具集 */
  isBuiltIn: boolean

  /**
   * 获取工具列表
   */
  getTools(): McpToolSchema[] | Promise<McpToolSchema[]>

  /**
   * 执行工具 (仅前端工具需要实现)
   * @param name 工具名称
   * @param args 工具参数
   * @returns 执行结果
   */
  executeToolByName?(toolCallId: string, name: string, args: any): Promise<any>

  /**
   * 连接到外部服务器 (仅外部 MCP 工具集需要实现)
   */
  connect?(): Promise<void>

  /**
   * 断开连接 (仅外部 MCP 工具集需要实现)
   */
  disconnect?(): Promise<void>

  /**
   * 检查连接状态 (仅外部 MCP 工具集需要实现)
   */
  isConnected?(): boolean
}

/**
 * 工具调用请求 (从后端接收)
 */
export interface ToolCallRequest {
  /** 请求 ID */
  requestId: string
  /** 工具名称 */
  toolName: string
  /** 工具参数 (JSON 字符串) */
  toolArgs: string
  /** 是否为客户端工具 */
  isClientTool: boolean
}

/**
 * 工具调用响应 (发送给后端)
 */
export interface ToolCallResponse {
  /** 请求 ID */
  requestId: string
  /** 工具名称 */
  toolName: string
  /** 是否为客户端工具 */
  isClientTool: boolean
  /** 工具参数 (JSON 字符串) */
  toolArgs: string
  /** 用户是否允许执行 */
  isAllow: boolean

  // 仅当 isClientTool=true 且 isAllow=true 时才有值
  /** 执行结果 (JSON 字符串) */
  result?: string
  /** 是否执行成功 */
  success?: boolean
  /** 错误信息 */
  error?: string
}

/**
 * 工具执行结果
 */
export interface ToolExecutionResult {
  /** 是否成功 */
  success: boolean
  /** 结果数据 */
  result?: any
  /** 错误信息 */
  error?: string
}
