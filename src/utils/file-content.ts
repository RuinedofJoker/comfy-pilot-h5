/**
 * 文件内容工具类
 *
 * 提供文件内容读取、MIME 类型检测和 Base64 编码功能
 */

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

/**
 * 读取文件内容并转换为 Base64 编码
 * @param file 文件对象
 * @returns Base64 编码的文件内容
 */
export function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`文件过大: ${file.size} bytes，最大支持 ${MAX_FILE_SIZE} bytes`))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result as string
      // 移除 data:xxx;base64, 前缀
      const base64 = result.split(',')[1] || ''
      resolve(base64)
    }

    reader.onerror = () => {
      reject(new Error('读取文件失败'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * 获取文件大小（字节数）
 * @param file 文件对象
 * @returns 文件大小（字节数）
 */
export function getFileSize(file: File): number {
  return file.size
}

/**
 * 获取文件的 MIME 类型
 * @param file 文件对象
 * @returns MIME 类型字符串
 */
export function getMimeType(file: File): string {
  // 优先使用文件对象的 type 属性
  if (file.type) {
    return file.type
  }

  // 如果无法获取，根据文件扩展名推断
  const mimeType = getMimeTypeByExtension(file.name)
  return mimeType || 'application/octet-stream'
}

/**
 * 判断 MIME 类型是否为图片
 * @param mimeType MIME 类型字符串
 * @returns true-是图片，false-不是图片
 */
export function isImage(mimeType: string): boolean {
  if (!mimeType) return false
  return mimeType.toLowerCase().startsWith('image/')
}

/**
 * 判断 MIME 类型是否为视频
 * @param mimeType MIME 类型字符串
 * @returns true-是视频，false-不是视频
 */
export function isVideo(mimeType: string): boolean {
  if (!mimeType) return false
  return mimeType.toLowerCase().startsWith('video/')
}

/**
 * 判断 MIME 类型是否为音频
 * @param mimeType MIME 类型字符串
 * @returns true-是音频，false-不是音频
 */
export function isAudio(mimeType: string): boolean {
  if (!mimeType) return false
  return mimeType.toLowerCase().startsWith('audio/')
}

/**
 * 判断 MIME 类型是否为 PDF
 * @param mimeType MIME 类型字符串
 * @returns true-是PDF，false-不是PDF
 */
export function isPdf(mimeType: string): boolean {
  if (!mimeType) return false
  return mimeType.toLowerCase() === 'application/pdf'
}

/**
 * 判断 MIME 类型是否为文本
 * @param mimeType MIME 类型字符串
 * @returns true-是文本，false-不是文本
 */
export function isText(mimeType: string): boolean {
  if (!mimeType) return false
  const lower = mimeType.toLowerCase()
  return lower.startsWith('text/') || lower === 'application/json' || lower === 'application/xml'
}

/**
 * 根据文件扩展名推断 MIME 类型
 * @param fileName 文件名
 * @returns MIME 类型字符串，如果无法推断则返回 null
 */
function getMimeTypeByExtension(fileName: string): string | null {
  if (!fileName) return null

  // 获取文件扩展名
  const lastDotIndex = fileName.lastIndexOf('.')
  const lastSlashIndex = Math.max(fileName.lastIndexOf('/'), fileName.lastIndexOf('\\'))

  if (lastDotIndex <= lastSlashIndex || lastDotIndex === fileName.length - 1) {
    return null
  }

  const extension = fileName.substring(lastDotIndex + 1).toLowerCase()

  // 常见 MIME 类型映射
  const mimeTypeMap: Record<string, string> = {
    // 图片
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',

    // 视频
    mp4: 'video/mp4',
    avi: 'video/x-msvideo',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    webm: 'video/webm',
    mkv: 'video/x-matroska',

    // 音频
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    aac: 'audio/aac',

    // 文档
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',

    // Web 相关
    html: 'text/html',
    htm: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    xml: 'application/xml',

    // 压缩文件
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',

    // 其他
    bin: 'application/octet-stream'
  }

  return mimeTypeMap[extension] || null
}
