/**
 * ComfyPilot Agent WebSocket 接口类型定义
 *
 * 本文件包含前端对接 Agent WebSocket 所需的所有 TypeScript 类型定义
 * 生成时间: 2026-01-24
 */

// ==================== 枚举定义 ====================

/**
 * WebSocket 消息类型
 */
export type WebSocketMessageType =
  // 客户端 -> 服务端
  | 'USER_MESSAGE'              // 用户消息
  | 'USER_ORDER'                // 用户命令
  | 'AGENT_TOOL_CALL_RESPONSE'  // 工具调用响应
  | 'INTERRUPT'                 // 中断执行
  | 'PING'                      // 心跳
  // 服务端 -> 客户端
  | 'AGENT_PROMPT'              // Agent状态提示
  | 'AGENT_STREAM'              // Agent流式输出
  | 'AGENT_COMPLETE'            // Agent完成
  | 'AGENT_TOOL_CALL_REQUEST'   // 工具调用请求
  | 'PONG'                      // 心跳响应

export const WebSocketMessageTypeValues = {
  // 客户端 -> 服务端
  USER_MESSAGE: 'USER_MESSAGE' as const,
  USER_ORDER: 'USER_ORDER' as const,
  AGENT_TOOL_CALL_RESPONSE: 'AGENT_TOOL_CALL_RESPONSE' as const,
  INTERRUPT: 'INTERRUPT' as const,
  PING: 'PING' as const,
  // 服务端 -> 客户端
  AGENT_PROMPT: 'AGENT_PROMPT' as const,
  AGENT_STREAM: 'AGENT_STREAM' as const,
  AGENT_COMPLETE: 'AGENT_COMPLETE' as const,
  AGENT_TOOL_CALL_REQUEST: 'AGENT_TOOL_CALL_REQUEST' as const,
  PONG: 'PONG' as const
}

/**
 * Agent 提示类型
 */
export type AgentPromptType =
  | 'STARTED'           // 执行开始
  | 'THINKING'          // 思考中
  | 'TOOL_CALLING'      // 工具调用中
  | 'TOOL_COMPLETE'     // 工具完成
  | 'SUMMARY'           // 生成摘要中
  | 'SUMMARY_COMPLETE'  // 摘要完成
  | 'INTERRUPTED'       // 执行中断
  | 'COMPLETE'          // 执行完成
  | 'ERROR'             // 执行错误

export const AgentPromptTypeValues = {
  STARTED: 'STARTED' as const,
  THINKING: 'THINKING' as const,
  TOOL_CALLING: 'TOOL_CALLING' as const,
  TOOL_COMPLETE: 'TOOL_COMPLETE' as const,
  SUMMARY: 'SUMMARY' as const,
  SUMMARY_COMPLETE: 'SUMMARY_COMPLETE' as const,
  INTERRUPTED: 'INTERRUPTED' as const,
  COMPLETE: 'COMPLETE' as const,
  ERROR: 'ERROR' as const
}

// ==================== 基础消息数据接口 ====================

/**
 * WebSocket 消息数据基础接口
 * 所有消息数据类型都应该实现此接口
 *
 * 使用 Jackson 的多态反序列化机制，根据外层 WebSocketMessage 的 type 字段
 * 自动反序列化为对应的具体类型
 */
export interface WebSocketMessageData {
  /**
   * 消息数据类型标识
   * 对应 WebSocketMessageType，用于后端 Jackson 反序列化
   * 注意：这个 type 字段会自动从外层 WebSocketMessage.type 复制过来
   */
  readonly type?: WebSocketMessageType;
}

/**
 * 客户端 -> 服务端消息数据接口
 */
export interface ClientToServerMessageData extends WebSocketMessageData {}

/**
 * 服务端 -> 客户端消息数据接口
 */
export interface ServerToClientMessageData extends WebSocketMessageData {}

/**
 * 空消息数据（用于不需要携带额外数据的消息类型）
 * 适用于：INTERRUPT, PING, PONG, AGENT_STREAM
 */
export interface VoidMessageData extends WebSocketMessageData {}

// ==================== 基础消息结构 ====================

/**
 * WebSocket 消息基础结构
 */
export interface WebSocketMessage<T extends WebSocketMessageData = WebSocketMessageData> {
  /** 消息类型 */
  type: WebSocketMessageType | string;
  /** 会话编码 */
  sessionCode: string;
  /** 请求ID（时间戳） */
  requestId: string;
  /** 消息内容（用于 USER_MESSAGE/USER_ORDER/AGENT_STREAM） */
  content?: string;
  /** 附加数据（根据消息类型不同而不同） */
  data?: T;
  /** 时间戳 */
  timestamp: number;
}

// ==================== MCP 工具定义 ====================

/**
 * MCP 工具 Schema（简化版）
 */
export interface McpToolSchema {
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description?: string;
  /** 输入参数 Schema */
  inputSchema: {
    type: 'object';
    properties?: Record<string, any>;
    required?: string[];
  };
}

// ==================== 客户端 -> 服务端消息数据 ====================

/**
 * 用户消息请求数据
 * 客户端 -> 服务端
 * 对应后端 Jackson 反序列化类型：USER_MESSAGE 或 USER_ORDER
 */
export interface UserMessageRequestData extends ClientToServerMessageData {
  /** 客户端MCP工具schema列表 */
  toolSchemas?: McpToolSchema[];
  /** 客户端MCP配置(mcp.json文件内容) */
  mcpConfig?: string;
  /** 多模态数据 */
  multimodalContents?: import('./chat-content').ChatContent[];
}

/**
 * Agent 工具调用响应数据
 * 客户端 -> 服务端
 * 对应后端 Jackson 反序列化类型：AGENT_TOOL_CALL_RESPONSE
 */
export interface AgentToolCallResponseData extends ClientToServerMessageData {
  /** 工具调用id */
  toolCallId: string;
  /** 工具名称 */
  toolName: string;
  /** 是否是客户端工具 */
  isClientTool: boolean;
  /** 是否是MCP工具 */
  isMcpTool: boolean;
  /** 工具参数（JSON字符串） */
  toolArgs: string;
  /** 工具执行结果（JSON字符串或文本） */
  result?: string;
  /** 用户是否允许执行工具 */
  isAllow: boolean;
  /** 是否执行成功 */
  success?: boolean;
  /** 错误信息（如果执行失败） */
  error?: string;
}

// ==================== 服务端 -> 客户端消息数据 ====================

/**
 * Agent 提示消息数据
 * 服务端 -> 客户端
 * 对应后端 Jackson 反序列化类型：AGENT_PROMPT
 */
export interface AgentPromptData extends ServerToClientMessageData {
  /** 提示类型 */
  promptType: AgentPromptType;
  /** 提示内容（可选，如果为空则使用默认提示） */
  message?: string;
}

/**
 * Agent 工具调用请求数据
 * 服务端 -> 客户端
 * 对应后端 Jackson 反序列化类型：AGENT_TOOL_CALL_REQUEST
 */
export interface AgentToolCallRequestData extends ServerToClientMessageData {
  /** 工具调用id */
  toolCallId: string;
  /** 工具名称 */
  toolName: string;
  /** 工具参数（JSON字符串） */
  toolArgs: string;
  /** 是否是客户端工具（如果不是只需要返回是否允许执行） */
  isClientTool: boolean;
  /** 是否是MCP工具 */
  isMcpTool: boolean;
}

/**
 * Agent 完成响应数据
 * 服务端 -> 客户端
 * 对应后端 Jackson 反序列化类型：AGENT_COMPLETE
 */
export interface AgentCompleteResponseData extends ServerToClientMessageData {
  /** 最大token数 */
  maxTokens?: number;
  /** 最大消息数 */
  maxMessages?: number;
  /** 输入token数 */
  inputTokens?: number;
  /** 输出token数 */
  outputTokens?: number;
  /** 总token数 */
  totalTokens?: number;
  /** 累计消息数 */
  messageCount?: number;
}

// ==================== 类型化消息定义 ====================

/** 用户消息 */
export type UserMessage = WebSocketMessage<UserMessageRequestData>;

/** 用户命令 */
export type UserOrderMessage = WebSocketMessage<UserMessageRequestData>;

/** 工具调用响应 */
export type ToolCallResponseMessage = WebSocketMessage<AgentToolCallResponseData>;

/** 中断消息 */
export type InterruptMessage = WebSocketMessage<VoidMessageData>;

/** 心跳消息 */
export type PingMessage = WebSocketMessage<VoidMessageData>;

/** Agent提示消息 */
export type AgentPromptMessage = WebSocketMessage<AgentPromptData>;

/** Agent流式输出消息 */
export type AgentStreamMessage = WebSocketMessage<VoidMessageData>;

/** Agent完成消息 */
export type AgentCompleteMessage = WebSocketMessage<AgentCompleteResponseData>;

/** 工具调用请求消息 */
export type ToolCallRequestMessage = WebSocketMessage<AgentToolCallRequestData>;

/** 心跳响应消息 */
export type PongMessage = WebSocketMessage<VoidMessageData>;

// ==================== 消息构建器 ====================

/**
 * 消息构建器工具类
 */
export class MessageBuilder {
  /**
   * 构建用户消息
   */
  static userMessage(
    sessionCode: string,
    content: string,
    toolSchemas?: McpToolSchema[],
    multimodalContents?: import('./chat-content').ChatContent[],
    mcpConfig?: string
  ): UserMessage {
    return {
      type: WebSocketMessageTypeValues.USER_MESSAGE,
      sessionCode,
      requestId: Date.now().toString(),
      content,
      data: {
        type: WebSocketMessageTypeValues.USER_MESSAGE,
        toolSchemas,
        multimodalContents,
        mcpConfig
      },
      timestamp: Date.now()
    };
  }

  /**
   * 构建用户命令
   */
  static userOrder(
    sessionCode: string,
    command: string,
    multimodalContents?: import('./chat-content').ChatContent[]
  ): UserOrderMessage {
    return {
      type: WebSocketMessageTypeValues.USER_ORDER,
      sessionCode,
      requestId: Date.now().toString(),
      content: command,
      data: {
        type: WebSocketMessageTypeValues.USER_ORDER,
        multimodalContents
      },
      timestamp: Date.now()
    };
  }

  /**
   * 构建工具调用响应（允许执行）
   */
  static toolCallAllow(
    sessionCode: string,
    requestId: string,
    toolCallId: string,
    toolName: string,
    toolArgs: string,
    isClientTool: boolean,
    isMcpTool: boolean,
    result?: string,
    success?: boolean,
    error?: string
  ): ToolCallResponseMessage {
    return {
      type: WebSocketMessageTypeValues.AGENT_TOOL_CALL_RESPONSE,
      sessionCode,
      requestId,
      data: {
        type: WebSocketMessageTypeValues.AGENT_TOOL_CALL_RESPONSE,
        toolCallId,
        toolName,
        isClientTool,
        isMcpTool,
        toolArgs,
        isAllow: true,
        result,
        success,
        error
      },
      timestamp: Date.now()
    };
  }

  /**
   * 构建工具调用响应（拒绝执行）
   */
  static toolCallDeny(
    sessionCode: string,
    requestId: string,
    toolCallId: string,
    toolName: string,
    toolArgs: string,
    isClientTool: boolean,
    isMcpTool: boolean
  ): ToolCallResponseMessage {
    return {
      type: WebSocketMessageTypeValues.AGENT_TOOL_CALL_RESPONSE,
      sessionCode,
      requestId,
      data: {
        type: WebSocketMessageTypeValues.AGENT_TOOL_CALL_RESPONSE,
        toolCallId,
        toolName,
        isClientTool,
        isMcpTool,
        toolArgs,
        isAllow: false
      },
      timestamp: Date.now()
    };
  }

  /**
   * 构建中断消息
   */
  static interrupt(sessionCode: string, requestId: string): InterruptMessage {
    return {
      type: WebSocketMessageTypeValues.INTERRUPT,
      sessionCode,
      requestId,
      data: {
        type: WebSocketMessageTypeValues.INTERRUPT
      },
      timestamp: Date.now()
    };
  }

  /**
   * 构建心跳消息
   */
  static ping(sessionCode: string): PingMessage {
    return {
      type: WebSocketMessageTypeValues.PING,
      sessionCode,
      requestId: Date.now().toString(),
      data: {
        type: WebSocketMessageTypeValues.PING
      },
      timestamp: Date.now()
    };
  }
}

// ==================== Agent 提示类型默认消息映射 ====================

/**
 * Agent 提示类型默认消息
 */
export const AGENT_PROMPT_DEFAULT_MESSAGES: Record<AgentPromptType, string> = {
  STARTED: 'Agent已开始执行',
  THINKING: 'Agent正在分析问题...',
  TOOL_CALLING: 'Agent正在调用工具...',
  TOOL_COMPLETE: '工具调用已完成，继续分析...',
  SUMMARY: 'Agent正在生成摘要...',
  SUMMARY_COMPLETE: '摘要已生成完成',
  INTERRUPTED: '执行已被中断',
  COMPLETE: '执行完成',
  ERROR: '执行过程中发生错误'
};
