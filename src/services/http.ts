/**
 * Axios 实例配置
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '@/types/api'
import { getToken, removeToken } from '@/utils/storage'
import { toast } from '@/utils/toast'

// 是否正在跳转到登录页的标志
let isRedirectingToLogin = false

/**
 * 获取 API Base URL
 * - 嵌入式模式：直接使用当前域名（后端和前端在同一服务器）
 * - 非嵌入式模式：使用环境变量或默认值
 */
function getApiBaseURL(): string {
  // 嵌入式模式：使用当前域名（优先级最高）
  if (typeof __EMBED_MODE__ !== 'undefined' && __EMBED_MODE__) {
    console.log('[HTTP] 嵌入式模式：使用当前域名', window.location.origin)
    return window.location.origin
  }

  // 非嵌入式模式：使用环境变量或默认值
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  console.log('[HTTP] 开发/生产模式：使用配置的 baseURL', baseURL)
  return baseURL
}

/**
 * 创建 Axios 实例
 */
const http: AxiosInstance = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 请求拦截器
 */
http.interceptors.request.use(
  (config) => {
    // 调试日志：记录请求信息
    console.log('[HTTP Request]', {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString()
    })

    // 添加 Token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('[HTTP Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * 响应拦截器
 */
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data

    // 成功响应
    if (code === 200 || code === 0) {
      return data as any
    }

    // 业务错误 - 显示错误提示
    const errorMessage = message || '请求失败'
    toast.error(errorMessage)
    return Promise.reject(new Error(errorMessage))
  },
  (error) => {
    let errorMessage = '请求失败'

    // 调试日志：记录错误信息
    console.error('[HTTP Response Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      timestamp: new Date().toISOString()
    })

    // 处理 HTTP 错误
    if (error.response) {
      const { status, data, config } = error.response

      // 401 错误处理
      if (status === 401) {
        const apiError = data as ApiError
        errorMessage = apiError.message || '认证失败'

        // 判断是否为登录接口
        const isLoginRequest = config.url?.includes('/auth/login')
        const isRegisterRequest = config.url?.includes('/auth/register')
        const isPublicAuthRequest = isLoginRequest || isRegisterRequest

        // 如果是公开认证接口（登录/注册），只显示错误信息，不跳转
        if (isPublicAuthRequest) {
          toast.error(errorMessage)
          return Promise.reject(new Error(errorMessage))
        }

        // 其他接口的 401 错误，说明 Token 过期
        // 使用标志位防止重复跳转
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true
          removeToken()
          errorMessage = '登录已过期，请重新登录'
          toast.error(errorMessage)
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
        }
        return Promise.reject(new Error(errorMessage))
      }

      // 权限不足
      if (status === 403) {
        errorMessage = '权限不足'
        toast.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }

      // 服务器错误
      if (status >= 500) {
        const apiError = data as ApiError
        errorMessage = apiError.message || '服务器错误，请稍后重试'
        toast.error(errorMessage)
        return Promise.reject(new Error(errorMessage))
      }

      // 其他错误 - 从后端响应中提取错误信息
      const apiError = data as ApiError
      errorMessage = apiError.message || '请求失败'
      toast.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    // 网络错误
    if (error.message === 'Network Error') {
      errorMessage = '网络连接失败，请检查网络'
      toast.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    // 超时错误
    if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后重试'
      toast.error(errorMessage)
      return Promise.reject(new Error(errorMessage))
    }

    // 其他未知错误
    toast.error(errorMessage)
    return Promise.reject(error)
  }
)

export default http
