/**
 * 流式消息解析器
 *
 * 用于解析 Agent 流式输出中的 <cp_agent_communication> 标签
 * 处理半包粘包问题
 */

const OPEN_TAG = '<cp_agent_communication>'
const CLOSE_TAG = '</cp_agent_communication>'

/**
 * 流式消息解析器类
 */
export class StreamParser {
  private buffer: string = ''
  private isInCommunication: boolean = false
  private communicationContent: string = ''

  /**
   * 追加新的流式内容
   * @param chunk 新接收到的内容片段
   * @returns 如果有可展示的内容则返回，否则返回 null
   */
  append(chunk: string): string | null {
    this.buffer += chunk

    // 如果还没有进入 communication 状态，检查是否有开始标签
    if (!this.isInCommunication) {
      const openTagIndex = this.buffer.indexOf(OPEN_TAG)
      if (openTagIndex !== -1) {
        // 找到开始标签，进入 communication 状态
        this.isInCommunication = true
        // 移除开始标签之前的内容和标签本身
        this.buffer = this.buffer.substring(openTagIndex + OPEN_TAG.length)
        this.communicationContent = ''
      } else {
        // 还没有找到开始标签，保留可能的部分标签
        // 保留最后 OPEN_TAG.length - 1 个字符，防止标签被分割
        if (this.buffer.length > OPEN_TAG.length - 1) {
          this.buffer = this.buffer.substring(this.buffer.length - (OPEN_TAG.length - 1))
        }
        return null
      }
    }

    // 已经在 communication 状态，检查是否有结束标签
    if (this.isInCommunication) {
      const closeTagIndex = this.buffer.indexOf(CLOSE_TAG)
      if (closeTagIndex !== -1) {
        // 找到结束标签，提取内容
        const content = this.buffer.substring(0, closeTagIndex)
        this.communicationContent += content

        // 重置状态
        this.isInCommunication = false
        this.buffer = this.buffer.substring(closeTagIndex + CLOSE_TAG.length)

        // 返回完整的 communication 内容
        const result = this.communicationContent
        this.communicationContent = ''
        return result
      } else {
        // 还没有找到结束标签
        // 保留可能的部分结束标签
        if (this.buffer.length > CLOSE_TAG.length - 1) {
          const safeContent = this.buffer.substring(0, this.buffer.length - (CLOSE_TAG.length - 1))
          this.communicationContent += safeContent
          this.buffer = this.buffer.substring(safeContent.length)
        }
        return null
      }
    }

    return null
  }

  /**
   * 获取当前是否在 communication 状态
   */
  isInCommunicationState(): boolean {
    return this.isInCommunication
  }

  /**
   * 获取当前已累积的 communication 内容（用于实时显示）
   */
  getCurrentContent(): string {
    return this.communicationContent
  }

  /**
   * 重置解析器状态
   */
  reset(): void {
    this.buffer = ''
    this.isInCommunication = false
    this.communicationContent = ''
  }
}

/**
 * 从历史消息中提取 communication 内容
 * @param content 消息的 content 字段
 * @param chatContent 消息的 chatContent 字段（JSON 字符串）
 * @returns 提取的文本内容
 */
export function extractMessageContent(content: string, chatContent?: string): string {
  // 如果 content 不为空，直接返回
  if (content && content.trim()) {
    return content
  }

  // 如果 chatContent 为空，返回空字符串
  if (!chatContent || !chatContent.trim()) {
    return ''
  }

  try {
    // 解析 chatContent JSON
    const parsed = JSON.parse(chatContent)
    const fullContent = parsed.content || ''

    // 提取 <cp_agent_communication> 标签内的内容
    const startIndex = fullContent.indexOf(OPEN_TAG)
    if (startIndex === -1) {
      // 没有找到标签，返回原始内容
      return fullContent
    }

    const contentStart = startIndex + OPEN_TAG.length
    const endIndex = fullContent.indexOf(CLOSE_TAG, contentStart)

    if (endIndex === -1) {
      // 没有找到结束标签，返回从开始标签之后的所有内容
      return fullContent.substring(contentStart).trim()
    }

    // 提取标签之间的内容
    return fullContent.substring(contentStart, endIndex).trim()
  } catch (error) {
    console.error('[StreamParser] 解析 chatContent 失败:', error)
    return ''
  }
}
