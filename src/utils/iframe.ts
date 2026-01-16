/**
 * iframe 通信工具
 */

/**
 * 消息类型
 */
export type IframeMessageType =
  | 'workflow_updated'
  | 'workflow_saved'
  | 'workflow_loaded'
  | 'lock_workflow'
  | 'unlock_workflow'

export const IframeMessageTypeValues = {
  WORKFLOW_UPDATED: 'workflow_updated' as const,
  WORKFLOW_SAVED: 'workflow_saved' as const,
  WORKFLOW_LOADED: 'workflow_loaded' as const,
  LOCK_WORKFLOW: 'lock_workflow' as const,
  UNLOCK_WORKFLOW: 'unlock_workflow' as const
}

/**
 * iframe 消息结构
 */
export interface IframeMessage<T = unknown> {
  type: IframeMessageType
  data: T
  timestamp: number
}

/**
 * 发送消息到 iframe
 */
export function postMessageToIframe(
  iframe: HTMLIFrameElement,
  type: IframeMessageType,
  data: unknown
): void {
  if (!iframe.contentWindow) {
    console.error('iframe contentWindow is not available')
    return
  }

  const message: IframeMessage = {
    type,
    data,
    timestamp: Date.now()
  }

  iframe.contentWindow.postMessage(message, '*')
}

/**
 * 监听来自 iframe 的消息
 */
export function listenToIframeMessage<T = unknown>(
  callback: (message: IframeMessage<T>) => void
): () => void {
  const handler = (event: MessageEvent) => {
    // 验证消息格式
    if (event.data && typeof event.data === 'object' && 'type' in event.data) {
      callback(event.data as IframeMessage<T>)
    }
  }

  window.addEventListener('message', handler)

  // 返回清理函数
  return () => {
    window.removeEventListener('message', handler)
  }
}
