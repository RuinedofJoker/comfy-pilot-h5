/**
 * 服务选择逻辑 Composable
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useServiceStore } from '@/stores/service'
import type { ComfyUIService } from '@/types/service'

export function useServiceSelection() {
  const router = useRouter()
  const serviceStore = useServiceStore()
  const searchKeyword = ref('')

  // 计算属性：过滤后的服务列表
  const filteredServices = computed(() => {
    if (!searchKeyword.value) {
      return serviceStore.enabledServices
    }
    const keyword = searchKeyword.value.toLowerCase()
    return serviceStore.enabledServices.filter(
      s =>
        s.serverName.toLowerCase().includes(keyword) ||
        s.description?.toLowerCase().includes(keyword)
    )
  })

  /**
   * 选择服务并跳转到工作流列表
   */
  function selectService(service: ComfyUIService): void {
    serviceStore.selectService(service.id)
    showToast({
      type: 'success',
      message: `已选择 ${service.serverName}`
    })
    router.push('/comfy/workflows')
  }

  /**
   * 更新服务信息（测试连接后）
   */
  function updateService(service: ComfyUIService): void {
    serviceStore.updateServiceInList(service)
  }

  /**
   * 初始化加载服务列表
   */
  async function loadServices(): Promise<void> {
    try {
      await serviceStore.fetchEnabledServices()
    } catch (error) {
      showToast({
        type: 'fail',
        message: '加载服务列表失败'
      })
    }
  }

  onMounted(() => {
    loadServices()
    serviceStore.restoreSelectedService()
  })

  return {
    searchKeyword,
    filteredServices,
    isLoading: computed(() => serviceStore.isLoading),
    selectService,
    updateService,
    loadServices
  }
}
