/**
 * 用户逻辑封装 Composable
 */

import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/types/user'

export function useUser() {
  const userStore = useUserStore()

  // 计算属性
  const userInfo = computed(() => userStore.userInfo)
  const workflows = computed(() => userStore.workflows)
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
  async function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
    await userStore.updateUserInfo(data)
  }

  /**
   * 获取工作流列表
   */
  async function fetchWorkflows(): Promise<void> {
    await userStore.fetchWorkflows()
  }

  return {
    // 计算属性
    userInfo,
    workflows,
    isLoading,
    // 方法
    fetchUserInfo,
    updateUserInfo,
    fetchWorkflows
  }
}
