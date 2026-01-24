/**
 * 文件资源 API 服务
 */

import http from './http'
import type { FileResource } from '@/types/file'

/**
 * 上传单个文件
 * @param file 文件对象
 * @param businessType 业务类型（可选）
 * @param businessId 业务ID（可选）
 */
export function uploadFile(
  file: File,
  businessType?: string,
  businessId?: string
): Promise<FileResource> {
  const formData = new FormData()
  formData.append('file', file)

  const params: Record<string, string> = {}
  if (businessType) params.businessType = businessType
  if (businessId) params.businessId = businessId

  return http.post(
    '/api/v1/files/upload',
    formData,
    {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

/**
 * 批量上传文件
 * @param files 文件对象数组
 * @param businessType 业务类型（可选）
 * @param businessId 业务ID（可选）
 */
export function uploadFiles(
  files: File[],
  businessType?: string,
  businessId?: string
): Promise<FileResource[]> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const params: Record<string, string> = {}
  if (businessType) params.businessType = businessType
  if (businessId) params.businessId = businessId

  return http.post(
    '/api/v1/files/upload/batch',
    formData,
    {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

/**
 * 查询用户文件列表
 * 获取当前用户上传的所有文件列表
 */
export function listUserFiles(): Promise<FileResource[]> {
  return http.get('/api/v1/files/user')
}

/**
 * 下载文件
 * @param fileName 文件名（storedName）
 */
export function downloadFile(fileName: string): Promise<Blob> {
  return http.get(`/api/v1/files/download/${fileName}`, {
    responseType: 'blob'
  })
}

/**
 * 查询业务关联文件
 * @param businessType 业务类型
 * @param businessId 业务ID
 */
export function listBusinessFiles(
  businessType: string,
  businessId: string
): Promise<FileResource[]> {
  return http.get('/api/v1/files/business', {
    params: {
      businessType,
      businessId
    }
  })
}
