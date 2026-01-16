/**
 * iframe 通信工具
 */

/**
 * 消息类型
 */
export enum IframeMessageType {
  WORKFLOW_UPDATED = 'workflow_updated',
  WORKFLOW_SAVED = 'workflow_saved',
  WORKFLOW_LOADED = 'workflow_loaded',
  LOCK_WORKFLOW = 'lock_workflow',
  UNLOCK_WORKFLOW = 'unlock_workflow'
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
