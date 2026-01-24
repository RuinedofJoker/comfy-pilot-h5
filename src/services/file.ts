/**
 * 文件资源 API 服务
 */

import http from './http'
import type { Result } from '@/types/api'
import type { FileResource } from '@/types/file'

/**
 * 上传单个文件
 * @param file 文件对象
 * @param businessType 业务类型（可选）
 * @param businessId 业务ID（可选）
 */
export async function uploadFile(
  file: File,
  businessType?: string,
  businessId?: string
): Promise<FileResource> {
  const formData = new FormData()
  formData.append('file', file)

  const params: Record<string, string> = {}
  if (businessType) params.businessType = businessType
  if (businessId) params.businessId = businessId

  const response = await http.post<Result<FileResource>>(
    '/api/v1/files/upload',
    formData,
    {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  return response.data.data
}

/**
 * 批量上传文件
 * @param files 文件对象数组
 * @param businessType 业务类型（可选）
 * @param businessId 业务ID（可选）
 */
export async function uploadFiles(
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

  const response = await http.post<Result<FileResource[]>>(
    '/api/v1/files/upload/batch',
    formData,
    {
      params,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  return response.data.data
}

/**
 * 查询用户文件列表
 * 获取当前用户上传的所有文件列表
 */
export async function listUserFiles(): Promise<FileResource[]> {
  const response = await http.get<Result<FileResource[]>>('/api/v1/files/user')
  return response.data.data
}

/**
 * 下载文件
 * @param fileName 文件名（storedName）
 */
export async function downloadFile(fileName: string): Promise<Blob> {
  const response = await http.get(`/api/v1/files/download/${fileName}`, {
    responseType: 'blob'
  })
  return response.data
}

/**
 * 查询业务关联文件
 * @param businessType 业务类型
 * @param businessId 业务ID
 */
export async function listBusinessFiles(
  businessType: string,
  businessId: string
): Promise<FileResource[]> {
  const response = await http.get<Result<FileResource[]>>('/api/v1/files/business', {
    params: {
      businessType,
      businessId
    }
  })
  return response.data.data
}
