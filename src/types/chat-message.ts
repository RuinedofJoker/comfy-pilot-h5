/**
 * 聊天消息类型定义
 * 对应后端 org.joker.comfypilot.common.domain.message 包
 */

import type { ChatContent } from './chat-content'

/**
 * 消息类型
 */
export type PersistableMessageType = 'system' | 'user' | 'ai' | 'tool_execution_result'

/**
 * 工具调用请求
 */
export interface ToolRequest {
  /** 工具调用请求ID */
  id: string
  /** 工具名称 */
  name: string
  /** 工具参数（JSON格式字符串） */
  arguments: string
}

/**
 * 系统消息
 * 用于设置AI的角色、行为规则和上下文信息
 */
export interface ChatSystemMessage {
  type: 'system'
  /** 系统提示词内容 */
  content: string
}

/**
 * 用户消息
 * 支持多模态内容（文本、图片、音频、视频、PDF）
 */
export interface ChatUserMessage {
  type: 'user'
  /** 消息内容列表（支持多模态） */
  contents: ChatContent[]
}

/**
 * AI消息
 * 包含AI的回复内容和可能的工具调用请求
 */
export interface ChatAiMessage {
  type: 'ai'
  /** AI回复的文本内容 */
  content: string
  /** 工具调用请求列表 */
  toolRequests?: ToolRequest[]
}

/**
 * 工具执行结果消息
 * 用于将工具执行结果返回给AI
 */
export interface ChatToolExecutionResultMessage {
  type: 'tool_execution_result'
  /** 工具调用请求ID（与ChatAiMessage中的toolRequest.id对应） */
  id: string
  /** 工具名称 */
  toolName: string
  /** 工具执行结果（文本格式） */
  toolExecutionResult: string
}

/**
 * 可持久化的聊天消息联合类型
 */
export type PersistableChatMessage =
  | ChatSystemMessage
  | ChatUserMessage
  | ChatAiMessage
  | ChatToolExecutionResultMessage
