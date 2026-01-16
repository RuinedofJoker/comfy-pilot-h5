/**
 * Axios 实例配置
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '@/types/api'
import { getToken, removeToken } from '@/utils/storage'
import { toast } from '@/utils/toast'

/**
 * 创建 Axios 实例
 */
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
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
    // 添加 Token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
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
        removeToken()
        errorMessage = '登录已过期，请重新登录'
        toast.error(errorMessage)
        setTimeout(() => {
          window.location.href = '/login'
        }, 1000)
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
        errorMessage = '服务器错误，请稍后重试'
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
