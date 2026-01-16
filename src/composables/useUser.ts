/**
 * 用户逻辑封装 Composable
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UpdateUserParams } from '@/types/user'

export function useUser() {
  const userStore = useUserStore()

  // 计算属性
  const userInfo = computed(() => userStore.userInfo)
  const isLoading = computed(() => userStore.isLoading)

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    await userStore.fetchUserInfo()
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: UpdateUserParams): Promise<void> {
    await userStore.updateUserInfo(data)
  }

  return {
    // 计算属性
    userInfo,
    isLoading,
    // 方法
    fetchUserInfo,
    updateUserInfo
  }
}
