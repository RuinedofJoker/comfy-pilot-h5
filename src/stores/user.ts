/**
 * 用户状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/auth'
import type { UpdateUserParams } from '@/types/user'
import { getCurrentUser, updateUser } from '@/services/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const isLoggedIn = computed(() => userInfo.value !== null)
  const userId = computed(() => userInfo.value?.id)
  const username = computed(() => userInfo.value?.username)
  const email = computed(() => userInfo.value?.email)
  const avatarUrl = computed(() => userInfo.value?.avatarUrl)

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    isLoading.value = true
    try {
      userInfo.value = await getCurrentUser()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(params: UpdateUserParams): Promise<void> {
    const updatedUser = await updateUser(params)
    userInfo.value = updatedUser
  }

  /**
   * 设置用户信息（登录后使用）
   */
  function setUserInfo(user: UserInfo): void {
    userInfo.value = user
  }

  /**
   * 清除用户数据
   */
  function clearUserData(): void {
    userInfo.value = null
  }

  return {
    // 状态
    userInfo,
    isLoading,
    // 计算属性
    isLoggedIn,
    userId,
    username,
    email,
    avatarUrl,
    // 方法
    fetchUserInfo,
    updateUserInfo,
    setUserInfo,
    clearUserData
  }
})
