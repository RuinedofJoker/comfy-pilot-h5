/**
 * Agent WebSocket 管理器
 *
 * 功能：
 * - 建立/关闭 WebSocket 连接
 * - 心跳检测 (PING/PONG)
 * - 消息发送/接收
 * - 事件回调处理
 */

import type {
  WebSocketMessage,
  AgentPromptData,
  AgentToolCallRequestData
} from '@/types/websocket'

import {
  MessageBuilder,
  WebSocketMessageTypeValues
} from '@/types/websocket'

/**
 * WebSocket 事件回调类型
 */
interface WebSocketCallbacks {
  onPrompt?: (requestId: string, data: AgentPromptData) => void
  onStream?: (requestId: string, content: string) => void
  onComplete?: (requestId: string) => void
  onToolRequest?: (requestId: string, data: AgentToolCallRequestData) => Promise<void>
  onError?: (error: string) => void
}

/**
 * Agent WebSocket 管理器类
 */
export class AgentWebSocketManager {
  private ws: WebSocket | null = null
  private sessionCode: string
  private token: string
  private heartbeatTimer: number | null = null
  private callbacks: WebSocketCallbacks = {}

  constructor(sessionCode: string, token: string) {
    this.sessionCode = sessionCode
    this.token = token
  }

  /**
   * 建立 WebSocket 连接
   */
  connect(): void {
    // sessionCode 和 token 都通过查询参数传递
    const url = `ws://localhost:8080/ws/chat?sessionCode=${this.sessionCode}&token=${this.token}`

    console.log(`[WebSocket] 正在连接: ${this.sessionCode}`)

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      console.log(`[WebSocket] 连接成功: ${this.sessionCode}`)
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('[WebSocket] 消息解析失败:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('[WebSocket] 连接错误:', error)
      this.callbacks.onError?.('WebSocket 连接错误')
    }

    this.ws.onclose = (event) => {
      console.log(`[WebSocket] 连接关闭: ${this.sessionCode}, code: ${event.code}`)
      this.stopHeartbeat()
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(msg: WebSocketMessage): void {
    switch (msg.type) {
      case WebSocketMessageTypeValues.AGENT_PROMPT:
        console.log('[WebSocket] 收到 AGENT_PROMPT:', msg.data)
        this.callbacks.onPrompt?.(msg.requestId, msg.data as AgentPromptData)
        break

      case WebSocketMessageTypeValues.AGENT_STREAM:
        this.callbacks.onStream?.(msg.requestId, msg.content || '')
        break

      case WebSocketMessageTypeValues.AGENT_COMPLETE:
        console.log('[WebSocket] 收到 AGENT_COMPLETE')
        this.callbacks.onComplete?.(msg.requestId)
        break

      case WebSocketMessageTypeValues.AGENT_TOOL_CALL_REQUEST:
        console.log('[WebSocket] 收到 AGENT_TOOL_CALL_REQUEST:', msg.data)
        this.callbacks.onToolRequest?.(msg.requestId, msg.data as AgentToolCallRequestData)
        break

      case WebSocketMessageTypeValues.PONG:
        // console.log('[WebSocket] 收到 PONG 心跳响应')
        break

      default:
        console.log('[WebSocket] 收到未知消息类型:', msg.type)
    }
  }

  /**
   * 发送消息
   */
  private send(msg: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    } else {
      console.warn('[WebSocket] 连接未就绪，无法发送消息')
    }
  }

  /**
   * 发送用户消息或命令
   */
  sendMessage(
    content: string,
    workflowContent: string,
    toolSchemas?: any[],
    multimodalContents?: any[],
    mcpConfig?: string
  ): void {
    // 判断是否为命令（以 / 开头）
    const isCommand = content.trim().startsWith('/')

    const msg = isCommand
      ? MessageBuilder.userOrder(
          this.sessionCode,
          content,
          multimodalContents
        )
      : MessageBuilder.userMessage(
          this.sessionCode,
          content,
          toolSchemas,
          multimodalContents,
          mcpConfig
        )

    console.log(`[WebSocket] 发送${isCommand ? '命令' : '消息'}:`, content)
    this.send(msg)
  }

  /**
   * 发送工具调用响应
   */
  sendToolResponse(
    requestId: string,
    toolCallId: string,
    toolName: string,
    toolArgs: string,
    isClientTool: boolean,
    isMcpTool: boolean,
    isAllow: boolean,
    result?: string, 
    success?: boolean,
    error?: string
  ): void {
    const msg = isAllow
      ? MessageBuilder.toolCallAllow(
          this.sessionCode,
          requestId,
          toolCallId,
          toolName,
          toolArgs,
          isClientTool,
          isMcpTool,
          result,
          success,
          error
        )
      : MessageBuilder.toolCallDeny(
          this.sessionCode,
          requestId,
          toolCallId,
          toolName,
          toolArgs,
          isClientTool,
          isMcpTool
        )

    console.log('[WebSocket] 发送工具调用响应:', { toolName, isAllow })
    this.send(msg)
  }

  /**
   * 发送中断消息
   */
  interrupt(requestId: string): void {
    const msg = MessageBuilder.interrupt(this.sessionCode, requestId)
    console.log('[WebSocket] 发送中断消息')
    this.send(msg)
  }

  /**
   * 启动心跳检测 (每5秒)
   */
  private startHeartbeat(): void {
    this.stopHeartbeat() // 先清除旧的定时器

    /* this.heartbeatTimer = window.setInterval(() => {
      const msg = MessageBuilder.ping(this.sessionCode)
      this.send(msg)
    }, 5000) // 5秒 */
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  /**
   * 关闭 WebSocket 连接
   */
  disconnect(): void {
    console.log(`[WebSocket] 正在关闭连接: ${this.sessionCode}`)
    this.stopHeartbeat()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  /**
   * 注册事件回调
   */
  on(event: 'prompt', handler: (requestId: string, data: AgentPromptData) => void): void
  on(event: 'stream', handler: (requestId: string, content: string) => void): void
  on(event: 'complete', handler: (requestId: string) => void): void
  on(event: 'toolRequest', handler: (requestId: string, data: AgentToolCallRequestData) => Promise<void>): void
  on(event: 'error', handler: (error: string) => void): void
  on(event: string, handler: any): void {
    switch (event) {
      case 'prompt':
        this.callbacks.onPrompt = handler
        break
      case 'stream':
        this.callbacks.onStream = handler
        break
      case 'complete':
        this.callbacks.onComplete = handler
        break
      case 'toolRequest':
        this.callbacks.onToolRequest = handler
        break
      case 'error':
        this.callbacks.onError = handler
        break
    }
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
