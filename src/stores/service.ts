/**
 * 服务状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComfyUIService, ListServicesParams } from '@/types/service'
import { listServers, listEnabledServers } from '@/services/service'
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils/storage'

export const useServiceStore = defineStore('service', () => {
  // 状态
  const services = ref<ComfyUIService[]>([])
  const selectedServiceId = ref<string>('')
  const recentServiceIds = ref<string[]>([])
  const isLoading = ref(false)

  // 计算属性
  const selectedService = computed(() => {
    return services.value.find(s => s.id === selectedServiceId.value) || null
  })

  const recentServices = computed(() => {
    return recentServiceIds.value
      .map(id => services.value.find(s => s.id === id))
      .filter(Boolean) as ComfyUIService[]
  })

  // 计算属性：启用的服务
  const enabledServices = computed(() =>
    services.value.filter(s => s.isEnabled)
  )

  // 计算属性：健康的服务
  const healthyServices = computed(() =>
    services.value.filter(s => s.healthStatus === 'HEALTHY' && s.isEnabled)
  )

  /**
   * 获取服务列表
   */
  async function fetchServices(params?: ListServicesParams): Promise<void> {
    isLoading.value = true
    try {
      services.value = await listServers(params)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取已启用的服务列表（前台用户使用）
   */
  async function fetchEnabledServices(): Promise<void> {
    isLoading.value = true
    try {
      services.value = await listEnabledServers()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取最近使用的服务
   */
  function fetchRecentServices(): void {
    const savedRecentIds = getStorageItem<string[]>('recent_service_ids')
    if (savedRecentIds) {
      recentServiceIds.value = savedRecentIds
    }
  }

  /**
   * 选择服务
   */
  function selectService(serviceId: string): void {
    selectedServiceId.value = serviceId

    // 添加到最近使用列表
    if (!recentServiceIds.value.includes(serviceId)) {
      recentServiceIds.value.unshift(serviceId)
      // 只保留最近 5 个
      if (recentServiceIds.value.length > 5) {
        recentServiceIds.value = recentServiceIds.value.slice(0, 5)
      }
    }

    // 保存到 storage
    setStorageItem('selected_service_id', serviceId)
    setStorageItem('recent_service_ids', recentServiceIds.value)
  }

  /**
   * 从 storage 恢复选择的服务
   */
  function restoreSelectedService(): void {
    const savedServiceId = getStorageItem<string>('selected_service_id')
    if (savedServiceId) {
      selectedServiceId.value = savedServiceId
    }

    const savedRecentIds = getStorageItem<string[]>('recent_service_ids')
    if (savedRecentIds) {
      recentServiceIds.value = savedRecentIds
    }
  }

  /**
   * 清除服务数据
   */
  function clearServiceData(): void {
    services.value = []
    selectedServiceId.value = ''
    recentServiceIds.value = []
    removeStorageItem('selected_service_id')
    removeStorageItem('recent_service_ids')
  }

  return {
    // 状态
    services,
    selectedServiceId,
    recentServiceIds,
    isLoading,
    // 计算属性
    selectedService,
    recentServices,
    enabledServices,
    healthyServices,
    // 方法
    fetchServices,
    fetchEnabledServices,
    fetchRecentServices,
    selectService,
    restoreSelectedService,
    clearServiceData
  }
})
