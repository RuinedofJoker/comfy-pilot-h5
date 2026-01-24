/**
 * MCP 工具系统类型定义
 */

/**
 * 工具执行策略
 */
export type ToolExecutionPolicy = 'ask-every-time' | 'auto-execute'

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
 * MCP 配置 (存储在 localStorage)
 */
export interface McpConfig {
  /** 配置版本 */
  version: string
  /** 工具集配置列表 */
  toolSets: McpToolSetConfig[]
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
  /** 是否为内置工具集 */
  isBuiltIn: boolean

  /**
   * 获取工具列表
   */
  getTools(): McpToolSchema[]

  /**
   * 执行工具 (仅前端工具需要实现)
   * @param name 工具名称
   * @param args 工具参数
   * @returns 执行结果
   */
  executeToolByName?(name: string, args: any): Promise<any>
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
