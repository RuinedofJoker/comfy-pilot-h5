/**
 * 用户相关类型定义
 */

import type { UserRole } from './auth'

/**
 * 用户详细信息
 */
export interface UserProfile {
  id: string
  email: string
  username: string
  avatar?: string
  role: UserRole
  bio?: string
  createdAt: string
  updatedAt: string
}

/**
 * 更新用户信息参数
 */
export interface UpdateUserParams {
  username?: string
  avatar?: string
  bio?: string
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
