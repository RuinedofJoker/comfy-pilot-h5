/**
 * 文件资源类型定义（与后端 API 对应）
 */

/**
 * 文件来源类型
 */
export type FileSourceType = 'SERVER_LOCAL'

export const FileSourceTypeValues = {
  SERVER_LOCAL: 'SERVER_LOCAL' as const
}

/**
 * 文件资源信息（与后端 FileResourceDTO 对应）
 */
export interface FileResource {
  id: string
  createTime: string
  updateTime: string
  /** 原始文件名 */
  fileName: string
  /** 存储文件名 */
  storedName: string
  /** 文件大小（字节，字符串格式） */
  fileSize: string
  /** 文件类型（MIME类型） */
  fileType: string
  /** 文件扩展名 */
  fileExtension: string
  /** 文件来源类型 */
  sourceType: FileSourceType
  /** Web相对路径 */
  webRelativePath: string
  /** Web完整路径 */
  webPath: string
  /** 业务类型 */
  businessType: string | null
  /** 业务ID */
  businessId: string | null
  /** 下载次数 */
  downloadCount: number
}
