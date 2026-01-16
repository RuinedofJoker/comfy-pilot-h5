/**
 * 用户相关类型定义
 */

/**
 * 更新用户信息参数
 */
export interface UpdateUserParams {
  username?: string
  avatarUrl?: string
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
