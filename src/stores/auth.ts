/**
 * 认证状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, LoginParams, LoginResponse } from '@/types/auth'
import { login as loginApi, logout as logoutApi } from '@/services/auth'
import {
  getToken,
  setToken,
  removeToken,
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo
} from '@/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>(getToken() || '')
  const refreshToken = ref<string>(getRefreshToken() || '')
  const userInfo = ref<UserInfo | null>(getUserInfo())
  const isLoading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)
  // TODO: 后续需要根据后端返回的角色信息判断是否为管理员
  const isAdmin = computed(() => false)

  /**
   * 登录
   */
  async function login(params: LoginParams): Promise<void> {
    isLoading.value = true
    try {
      const response: LoginResponse = await loginApi(params)

      // 保存 Token
      token.value = response.accessToken
      refreshToken.value = response.refreshToken
      setToken(response.accessToken)
      setRefreshToken(response.refreshToken)

      // 保存用户信息
      userInfo.value = response.user
      setUserInfo(response.user)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    try {
      await logoutApi()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      // 清除本地状态
      clearAuth()
    }
  }

  /**
   * 清除认证信息
   */
  function clearAuth(): void {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    removeToken()
    removeRefreshToken()
    removeUserInfo()
  }

  /**
   * 更新用户信息
   */
  function updateUserInfo(info: Partial<UserInfo>): void {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info }
      setUserInfo(userInfo.value)
    }
  }

  /**
   * 刷新 Token
   */
  function updateToken(newToken: string, newRefreshToken?: string): void {
    token.value = newToken
    setToken(newToken)

    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      setRefreshToken(newRefreshToken)
    }
  }

  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    isLoading,
    // 计算属性
    isAuthenticated,
    isAdmin,
    // 方法
    login,
    logout,
    clearAuth,
    updateUserInfo,
    updateToken
  }
})
