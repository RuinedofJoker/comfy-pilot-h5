/**
 * 认证 API 服务
 */

import http from './http'
import type {
  LoginParams,
  LoginResponse,
  RegisterParams,
  ForgotPasswordParams,
  ResetPasswordParams,
  RefreshTokenResponse
} from '@/types/auth'

/**
 * 用户登录
 */
export function login(params: LoginParams): Promise<LoginResponse> {
  return http.post('/api/v1/auth/login', params)
}

/**
 * 用户注册
 */
export function register(params: RegisterParams): Promise<void> {
  return http.post('/api/v1/auth/register', params)
}

/**
 * 忘记密码
 */
export function forgotPassword(params: ForgotPasswordParams): Promise<void> {
  return http.post('/api/v1/auth/forgot-password', params)
}

/**
 * 重置密码
 */
export function resetPassword(params: ResetPasswordParams): Promise<void> {
  return http.post('/api/v1/auth/reset-password', params)
}

/**
 * 刷新 Token
 */
export function refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return http.post('/api/v1/auth/refresh', { refreshToken })
}

/**
 * 退出登录
 */
export function logout(): Promise<void> {
  return http.post('/api/v1/auth/logout')
}
