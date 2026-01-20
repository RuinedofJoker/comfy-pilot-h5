/**
 * WebSocket 通信工具类
 */
import { getToken } from './storage'

export type WebSocketMessageHandler = (data: any) => void
export type WebSocketErrorHandler = (error: Event) => void
export type WebSocketCloseHandler = (event: CloseEvent) => void

export interface WebSocketOptions {
  /** 会话编码 */
  sessionCode: string
  /** 消息处理器 */
  onMessage?: WebSocketMessageHandler
  /** 错误处理器 */
  onError?: WebSocketErrorHandler
  /** 关闭处理器 */
  onClose?: WebSocketCloseHandler
  /** 连接成功处理器 */
  onOpen?: () => void
  /** 自动重连 */
  autoReconnect?: boolean
  /** 重连间隔(毫秒) */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectAttempts?: number
}

/**
 * WebSocket 客户端类
 */
export class WebSocketClient {
  private ws: WebSocket | null = null
  private options: Required<WebSocketOptions>
  private reconnectAttempts = 0
  private reconnectTimer: number | null = null
  private isManualClose = false

  constructor(options: WebSocketOptions) {
    this.options = {
      sessionCode: options.sessionCode,
      onMessage: options.onMessage || (() => {}),
      onError: options.onError || (() => {}),
      onClose: options.onClose || (() => {}),
      onOpen: options.onOpen || (() => {}),
      autoReconnect: options.autoReconnect ?? true,
      reconnectInterval: options.reconnectInterval || 3000,
      maxReconnectAttempts: options.maxReconnectAttempts || 5
    }
  }

  /**
   * 连接 WebSocket
   */
  connect(): void {
    try {
      const token = getToken()
      if (!token) {
        console.error('[WebSocket] 未找到认证令牌')
        return
      }

      // 构建 WebSocket URL
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
      const wsUrl = baseUrl.replace(/^http/, 'ws')
      const url = `${wsUrl}/ws/chat?sessionCode=${this.options.sessionCode}`

      console.log('[WebSocket] 正在连接:', url)

      this.ws = new WebSocket(url)

      // 连接打开
      this.ws.onopen = () => {
        console.log('[WebSocket] 连接成功')
        this.reconnectAttempts = 0

        // 发送认证令牌
        this.send({
          type: 'auth',
          token
        })

        this.options.onOpen()
      }

      // 接收消息
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('[WebSocket] 收到消息:', data)
          this.options.onMessage(data)
        } catch (error) {
          console.error('[WebSocket] 解析消息失败:', error)
        }
      }

      // 连接错误
      this.ws.onerror = (error) => {
        console.error('[WebSocket] 连接错误:', error)
        this.options.onError(error)
      }

      // 连接关闭
      this.ws.onclose = (event) => {
        console.log('[WebSocket] 连接关闭:', event.code, event.reason)
        this.options.onClose(event)

        // 自动重连
        if (!this.isManualClose && this.options.autoReconnect) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('[WebSocket] 创建连接失败:', error)
    }
  }

  /**
   * 发送消息
   */
  send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] 连接未就绪，无法发送消息')
      return
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data)
      this.ws.send(message)
      console.log('[WebSocket] 发送消息:', data)
    } catch (error) {
      console.error('[WebSocket] 发送消息失败:', error)
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    this.isManualClose = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    console.log('[WebSocket] 连接已关闭')
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('[WebSocket] 达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.options.maxReconnectAttempts})`)

    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, this.options.reconnectInterval)
  }

  /**
   * 获取连接状态
   */
  getReadyState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
