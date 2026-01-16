/**
 * 用户信息管理 Composable
 */

import { ref } from 'vue'
import { showToast } from 'vant'
import { useUserStore } from '@/stores/user'
import type { UpdateUserParams } from '@/types/user'

export function useUserProfile() {
  const userStore = useUserStore()
  const isUpdating = ref(false)

  /**
   * 更新用户信息
   */
  async function updateProfile(params: UpdateUserParams): Promise<boolean> {
    isUpdating.value = true
    try {
      await userStore.updateUserInfo(params)
      showToast({
        type: 'success',
        message: '更新成功'
      })
      return true
    } catch (error) {
      showToast({
        type: 'fail',
        message: '更新失败，请重试'
      })
      return false
    } finally {
      isUpdating.value = false
    }
  }

  return {
    userInfo: userStore.userInfo,
    isUpdating,
    updateProfile
  }
}
