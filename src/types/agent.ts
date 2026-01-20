/**
 * Agent 相关类型定义
 */

import type { ModelCallingType } from './model'

/**
 * Agent 状态类型
 */
export type AgentStatus =
  | 'ENABLED'    // 已启用
  | 'DISABLED'   // 已禁用

/**
 * Agent 状态常量
 */
export const AgentStatus = {
  ENABLED: 'ENABLED' as const,
  DISABLED: 'DISABLED' as const
} as const

/**
 * Agent 配置类型
 */
export type AgentConfigType =
  | 'STRING'     // 字符串类型
  | 'INT'        // 整数类型
  | 'FLOAT'      // 浮点数类型
  | 'BOOLEAN'    // 布尔类型
  | 'MODEL'      // 模型类型

/**
 * Agent 配置类型常量
 */
export const AgentConfigType = {
  STRING: 'STRING' as const,
  INT: 'INT' as const,
  FLOAT: 'FLOAT' as const,
  BOOLEAN: 'BOOLEAN' as const,
  MODEL: 'MODEL' as const
} as const

/**
 * Agent 配置定义
 */
export interface AgentConfigDefinition {
  /** 配置名/键 */
  name: string
  /** 配置描述 */
  description?: string
  /** 是否必填 */
  require?: boolean
  /** 用户是否能覆盖 */
  userOverride?: boolean
  /** 配置值类型 */
  type: AgentConfigType
  /** 字符串格式(正则表达式) */
  format?: string
  /** 整数类型取值范围起始值 */
  intStartScope?: number
  /** 整数类型取值范围结束值 */
  intEndScope?: number
  /** 浮点数类型取值范围起始值 */
  floatStartScope?: number
  /** 浮点数类型取值范围结束值 */
  floatEndScope?: number
  /** 模型调用方式 */
  modelCallingType?: ModelCallingType
}

/**
 * Agent 配置信息
 */
export interface AgentConfig {
  /** Agent ID */
  id: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** Agent 编码 */
  agentCode: string
  /** Agent 名称 */
  agentName: string
  /** Agent 描述 */
  description?: string
  /** Agent 版本号 */
  version: string
  /** Agent Scope 配置 */
  agentScopeConfig?: string
  /** Agent 运行时配置 */
  config?: string
  /** Agent 运行时配置定义 */
  agentConfigDefinitions?: AgentConfigDefinition[]
  /** Agent 状态 */
  status: AgentStatus
}

/**
 * Agent 运行时配置信息
 */
export interface AgentRuntimeConfig {
  /** Agent ID */
  id: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** Agent 编码 */
  agentCode: string
  /** Agent 名称 */
  agentName: string
  /** Agent 描述 */
  description?: string
  /** Agent 版本号 */
  version: string
  /** Agent 运行时配置定义 */
  agentConfigDefinitions?: AgentConfigDefinition[]
}

/**
 * Agent 执行请求
 */
export interface AgentExecutionRequest {
  /** 会话ID */
  sessionId?: string
  /** 用户输入内容 */
  input: string
  /** 用户ID */
  userId?: string
  /** 是否流式执行 */
  isStreamable?: boolean
  /** Agent配置(JSON格式) */
  agentConfig?: string
}

/**
 * Agent 执行响应
 */
export interface AgentExecutionResponse {
  /** 执行日志ID */
  logId: string
  /** Agent输出内容 */
  output: string
  /** 执行状态 */
  status: string
  /** 错误信息 */
  errorMessage?: string
  /** 执行耗时(毫秒) */
  executionTimeMs: number
  /** 执行开始时间戳(毫秒) */
  executionStartMs: number
}
