/**
 * 用户 API 服务
 */

import http from './http'
import type { UserProfile, UpdateUserParams, ChangePasswordParams } from '@/types/user'

/**
 * 获取用户信息
 */
export function getUserProfile(): Promise<UserProfile> {
  return http.get('/api/user/profile')
}

/**
 * 更新用户信息
 */
export function updateUserProfile(params: UpdateUserParams): Promise<UserProfile> {
  return http.put('/api/user/profile', params)
}

/**
 * 修改密码
 */
export function changePassword(params: ChangePasswordParams): Promise<void> {
  return http.post('/api/user/change-password', params)
}

/**
 * 上传头像
 */
export function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/api/user/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
