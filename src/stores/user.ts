/**
 * 用户状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/types/user'
import type { Workflow } from '@/types/workflow'
import { getUserInfo as getUserInfoApi, updateUserInfo as updateUserInfoApi } from '@/services/user'
import { getWorkflowList as getWorkflowListApi } from '@/services/workflow'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref<UserInfo | null>(null)
  const workflows = ref<Workflow[]>([])
  const isLoading = ref(false)

  /**
   * 获取用户信息
   */
  async function fetchUserInfo(): Promise<void> {
    isLoading.value = true
    try {
      userInfo.value = await getUserInfoApi()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 更新用户信息
   */
  async function updateUserInfo(data: Partial<UserInfo>): Promise<void> {
    await updateUserInfoApi(data)
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...data }
    }
  }

  /**
   * 获取工作流列表
   */
  async function fetchWorkflows(): Promise<void> {
    isLoading.value = true
    try {
      workflows.value = await getWorkflowListApi()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 添加工作流
   */
  function addWorkflow(workflow: Workflow): void {
    workflows.value.unshift(workflow)
  }

  /**
   * 更新工作流
   */
  function updateWorkflow(id: string, data: Partial<Workflow>): void {
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workflows.value[index] = { ...workflows.value[index], ...data }
    }
  }

  /**
   * 删除工作流
   */
  function removeWorkflow(id: string): void {
    workflows.value = workflows.value.filter(w => w.id !== id)
  }

  /**
   * 清除用户数据
   */
  function clearUserData(): void {
    userInfo.value = null
    workflows.value = []
  }

  return {
    // 状态
    userInfo,
    workflows,
    isLoading,
    // 方法
    fetchUserInfo,
    updateUserInfo,
    fetchWorkflows,
    addWorkflow,
    updateWorkflow,
    removeWorkflow,
    clearUserData
  }
})
