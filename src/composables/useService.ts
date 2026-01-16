/**
 * 服务逻辑封装 Composable
 */

import { computed } from 'vue'
import { useServiceStore } from '@/stores/service'
import type { ComfyUIService } from '@/types/service'

export function useService() {
  const serviceStore = useServiceStore()

  // 计算属性
  const services = computed(() => serviceStore.services)
  const selectedService = computed(() => serviceStore.selectedService)
  const recentServices = computed(() => serviceStore.recentServices)
  const isLoading = computed(() => serviceStore.isLoading)

  /**
   * 获取可用服务列表
   */
  async function fetchServices(): Promise<void> {
    await serviceStore.fetchServices()
  }

  /**
   * 获取最近使用的服务
   */
  async function fetchRecentServices(): Promise<void> {
    await serviceStore.fetchRecentServices()
  }

  /**
   * 选择服务
   */
  function selectService(service: ComfyUIService): void {
    serviceStore.selectService(service.id)
  }

  /**
   * 恢复选择的服务
   */
  function restoreSelectedService(): void {
    serviceStore.restoreSelectedService()
  }

  return {
    // 计算属性
    services,
    selectedService,
    recentServices,
    isLoading,
    // 方法
    fetchServices,
    fetchRecentServices,
    selectService,
    restoreSelectedService
  }
}
