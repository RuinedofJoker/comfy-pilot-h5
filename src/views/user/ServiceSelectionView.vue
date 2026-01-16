<template>
  <div class="g-service-selection-view">
    <TopNavBar />

    <div class="g-service-selection-view__container">
      <div class="g-service-selection-view__header">
        <h1 class="g-service-selection-view__title">选择 ComfyUI 服务</h1>
        <p class="g-service-selection-view__description">
          请选择一个可用的 ComfyUI 服务来开始您的工作流编辑
        </p>
      </div>

      <div v-if="loading" class="g-service-selection-view__loading">
        <BaseIcon name="loading" :size="48" />
        <p>加载服务列表中...</p>
      </div>

      <div v-else-if="services.length === 0" class="g-service-selection-view__empty">
        <BaseIcon name="inbox" :size="64" />
        <p>暂无可用服务</p>
      </div>

      <div v-else class="g-service-selection-view__grid">
        <ServiceCard
          v-for="service in services"
          :key="service.id"
          :service="service"
          @select="handleSelectService"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopNavBar from '@/components/user/TopNavBar.vue'
import ServiceCard from '@/components/user/ServiceCard.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { listServers } from '@/services/service'
import type { ComfyUIService } from '@/types/service'

const router = useRouter()

const services = ref<ComfyUIService[]>([])
const loading = ref(false)

onMounted(async () => {
  await loadServices()
})

async function loadServices(): Promise<void> {
  loading.value = true
  try {
    // 只查询已启用的服务
    services.value = await listServers({ isEnabled: true })
  } catch (error) {
    console.error('加载服务列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleSelectService(service: ComfyUIService): void {
  // 保存选择的服务到 localStorage 或 Store
  localStorage.setItem('selected_service_id', service.id)

  // 跳转到工作流列表页面
  router.push('/workflows')
}
</script>

<style scoped lang="scss">
.g-service-selection-view {
  min-height: 100vh;
  background: #1a1a1a;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  &__header {
    text-align: center;
    margin-bottom: 48px;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 12px 0;
  }

  &__description {
    font-size: 16px;
    color: #999999;
    margin: 0;
  }

  &__loading,
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 80px 20px;
    color: #999999;

    p {
      font-size: 16px;
      margin: 0;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 24px;
  }
}
</style>
