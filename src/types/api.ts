/**
 * API 响应类型定义
 */

/**
 * 通用 API 响应结构
 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp?: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 分页响应数据
 */
export interface PaginationData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * API 错误响应
 */
export interface ApiError {
  code: number
  message: string
  details?: string
  timestamp: number
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string
  filename: string
  size: number
  mimeType: string
}
