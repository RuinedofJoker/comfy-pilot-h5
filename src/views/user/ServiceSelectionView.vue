<template>
  <div class="g-service-selection-view">
    <!-- 顶部导航栏 -->
    <TopNavBar @open-agent-config="showAgentConfigModal = true" />

    <!-- Agent 配置弹窗 -->
    <AgentConfigModal v-model:visible="showAgentConfigModal" />

    <!-- 主内容区 -->
    <div class="m-main-container">
      <!-- 页面标题 -->
      <div class="m-header-section">
        <h1>选择 ComfyUI 服务</h1>
        <p>选择一个可用的 ComfyUI 服务来开始创建工作流</p>
      </div>

      <!-- 服务列表容器 -->
      <div class="m-services-container">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="f-loading-state">
          <div class="f-spinner"></div>
          <p>加载服务列表中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="filteredServices.length === 0" class="f-empty-state">
          <svg class="f-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>暂无可用服务</p>
          <span>请联系管理员添加 ComfyUI 服务</span>
        </div>

        <!-- 服务卡片网格 -->
        <div v-else class="f-services-grid">
          <ServiceCard
            v-for="service in filteredServices"
            :key="service.id"
            :service="service"
            @select="selectService"
            @update="updateService"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TopNavBar from '@/components/user/TopNavBar.vue'
import ServiceCard from '@/components/user/ServiceCard.vue'
import AgentConfigModal from '@/components/user/AgentConfigModal.vue'
import { useServiceSelection } from '@/composables/useServiceSelection'

const {
  filteredServices,
  isLoading,
  selectService,
  updateService
} = useServiceSelection()

// Agent 配置弹窗状态
const showAgentConfigModal = ref(false)
</script>

<style scoped lang="scss">
.g-service-selection-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.m-main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  overflow-y: auto;
}

.m-header-section {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    margin-bottom: 10px;
    font-weight: 500;
    color: #ffffff;
  }

  p {
    font-size: 14px;
    color: #999999;
  }
}

.m-services-container {
  width: 100%;
  max-width: 1200px;
}

.f-services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

// 加载状态
.f-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999999;

  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.f-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #3a3a3a;
  border-top-color: #4a9eff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// 空状态
.f-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;

  .f-empty-icon {
    width: 80px;
    height: 80px;
    color: #666666;
    margin-bottom: 20px;
    stroke-width: 1.5;
  }

  p {
    font-size: 16px;
    color: #cccccc;
    margin-bottom: 8px;
  }

  span {
    font-size: 14px;
    color: #999999;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .m-main-container {
    padding: 24px 16px;
  }

  .m-header-section h1 {
    font-size: 24px;
  }

  .f-services-grid {
    grid-template-columns: 1fr;
  }
}
</style>
