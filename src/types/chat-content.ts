/**
 * 聊天内容类型定义
 * 对应后端 org.joker.comfypilot.common.domain.content 包
 */

/**
 * 内容类型
 */
export type ChatContentType = 'text' | 'image' | 'audio' | 'video' | 'pdfFile'

/**
 * 文本内容
 */
export interface TextChatContent {
  type: 'text'
  text: string
}

/**
 * 多媒体内容基类
 */
export interface MediaChatContent {
  /** 是否使用Base64编码 */
  isUseBase64: boolean
  /** 资源URL（当isUseBase64=false时使用） */
  url?: string
  /** Base64编码数据（当isUseBase64=true时使用） */
  base64Data?: string
  /** MIME类型（如image/png, audio/mp3） */
  mimeType?: string
}

/**
 * 图片内容
 */
export interface ImageChatContent extends MediaChatContent {
  type: 'image'
}

/**
 * 音频内容
 */
export interface AudioChatContent extends MediaChatContent {
  type: 'audio'
}

/**
 * 视频内容
 */
export interface VideoChatContent extends MediaChatContent {
  type: 'video'
}

/**
 * PDF文件内容
 */
export interface PdfChatContent extends MediaChatContent {
  type: 'pdfFile'
}

/**
 * 聊天内容联合类型
 */
export type ChatContent =
  | TextChatContent
  | ImageChatContent
  | AudioChatContent
  | VideoChatContent
  | PdfChatContent
