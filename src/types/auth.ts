/**
 * 认证相关类型定义
 */

/**
 * 登录请求参数
 */
export interface LoginParams {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserInfo
}

/**
 * 注册请求参数（发送给后端）
 */
export interface RegisterParams {
  username: string
  email: string
  password: string
}

/**
 * 注册表单数据（前端使用，包含确认密码）
 */
export interface RegisterFormData extends RegisterParams {
  confirmPassword: string
}

/**
 * 用户信息
 */
export interface UserInfo {
  id: string
  createTime: string
  updateTime: string | null
  email: string
  username: string
  avatarUrl: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'DELETED'
  lastLoginTime: string | null
}

/**
 * 忘记密码请求参数
 */
export interface ForgotPasswordParams {
  email: string
}

/**
 * 重置密码请求参数
 */
export interface ResetPasswordParams {
  token: string
  password: string
  confirmPassword: string
}

/**
 * Token 刷新响应
 */
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
}
