/**
 * 用户 API 服务
 */

import http from './http'
import type { UserInfo } from '@/types/auth'
import type { UpdateUserParams } from '@/types/user'

/**
 * 获取当前用户信息
 */
export function getCurrentUser(): Promise<UserInfo> {
  return http.get('/api/v1/users/me')
}

/**
 * 更新用户信息
 */
export function updateUser(params: UpdateUserParams): Promise<UserInfo> {
  return http.put('/api/v1/users/me', params)
}
