/**
 * 服务状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ComfyUIService } from '@/types/service'
import { getAvailableServices, getRecentServices } from '@/services/service'

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

  /**
   * 获取可用服务列表
   */
  async function fetchServices(): Promise<void> {
    isLoading.value = true
    try {
      services.value = await getAvailableServices()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取最近使用的服务
   */
  async function fetchRecentServices(): Promise<void> {
    try {
      const recent = await getRecentServices()
      recentServiceIds.value = recent.map(s => s.id)
    } catch (error) {
      console.error('获取最近使用的服务失败:', error)
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

    // 保存到 localStorage
    localStorage.setItem('selected_service_id', serviceId)
    localStorage.setItem('recent_service_ids', JSON.stringify(recentServiceIds.value))
  }

  /**
   * 从 localStorage 恢复选择的服务
   */
  function restoreSelectedService(): void {
    const savedServiceId = localStorage.getItem('selected_service_id')
    if (savedServiceId) {
      selectedServiceId.value = savedServiceId
    }

    const savedRecentIds = localStorage.getItem('recent_service_ids')
    if (savedRecentIds) {
      try {
        recentServiceIds.value = JSON.parse(savedRecentIds)
      } catch (error) {
        console.error('解析最近使用的服务失败:', error)
      }
    }
  }

  /**
   * 清除服务数据
   */
  function clearServiceData(): void {
    services.value = []
    selectedServiceId.value = ''
    recentServiceIds.value = []
    localStorage.removeItem('selected_service_id')
    localStorage.removeItem('recent_service_ids')
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
    // 方法
    fetchServices,
    fetchRecentServices,
    selectService,
    restoreSelectedService,
    clearServiceData
  }
})
