/**
 * 管理员后台状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminComfyuiServer, CreateServerRequest, UpdateServerRequest } from '@/types/admin'
import { comfyuiServerApi } from '@/services/comfyui-server'

export const useAdminStore = defineStore('admin', () => {
  // ==================== 状态定义 ====================

  /**
   * ComfyUI 服务列表
   */
  const servers = ref<AdminComfyuiServer[]>([])

  /**
   * 加载状态
   */
  const isLoading = ref(false)

  // ==================== 计算属性 ====================

  /**
   * 启用的服务列表
   */
  const enabledServers = computed(() =>
    servers.value.filter(s => s.isEnabled)
  )

  /**
   * 健康的服务列表
   */
  const healthyServers = computed(() =>
    servers.value.filter(s => s.healthStatus === 'HEALTHY')
  )

  /**
   * 手动创建的服务列表
   */
  const manualServers = computed(() =>
    servers.value.filter(s => s.sourceType === 'MANUAL')
  )

  /**
   * 代码注册的服务列表
   */
  const codeBasedServers = computed(() =>
    servers.value.filter(s => s.sourceType === 'CODE_BASED')
  )

  // ==================== Actions ====================

  /**
   * 获取服务列表
   */
  async function fetchServers(params?: { sourceType?: string; isEnabled?: boolean }): Promise<void> {
    isLoading.value = true
    try {
      const response = await comfyuiServerApi.listServers(params)
      servers.value = response.data || []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 根据 ID 获取服务详情
   */
  async function fetchServerById(id: string): Promise<AdminComfyuiServer | null> {
    try {
      const response = await comfyuiServerApi.getServerById(id)
      return response.data || null
    } catch (error) {
      return null
    }
  }

  /**
   * 创建服务
   */
  async function createServer(data: CreateServerRequest): Promise<AdminComfyuiServer> {
    const response = await comfyuiServerApi.createServer(data)
    const newServer = response.data

    // 添加到列表
    servers.value.unshift(newServer)

    return newServer
  }

  /**
   * 更新服务
   */
  async function updateServer(id: string, data: UpdateServerRequest): Promise<AdminComfyuiServer> {
    const response = await comfyuiServerApi.updateServer(id, data)
    const updatedServer = response.data

    // 更新列表中的服务
    const index = servers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      servers.value[index] = updatedServer
    }

    return updatedServer
  }

  /**
   * 删除服务
   */
  async function deleteServer(id: string): Promise<void> {
    await comfyuiServerApi.deleteServer(id)

    // 从列表中移除
    servers.value = servers.value.filter(s => s.id !== id)
  }

  return {
    // 状态
    servers,
    isLoading,

    // 计算属性
    enabledServers,
    healthyServers,
    manualServers,
    codeBasedServers,

    // Actions
    fetchServers,
    fetchServerById,
    createServer,
    updateServer,
    deleteServer
  }
})
