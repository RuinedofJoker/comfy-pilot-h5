<template>
  <div class="g-workflow-list-view">
    <!-- 顶部导航栏 -->
    <TopNavBar
      title="我的工作流"
      :show-back="true"
      :show-menu="true"
      @menu-click="showUserMenu = true"
    />

    <!-- 用户菜单 -->
    <UserMenu v-model:show="showUserMenu" />

    <!-- 主内容区 -->
    <div class="g-workflow-list-view__content">
      <!-- 搜索和排序栏 -->
      <div class="m-toolbar">
        <van-search
          v-model="searchKeyword"
          placeholder="搜索工作流名称或描述"
          shape="round"
          background="#2a2a2a"
        />
        <div class="f-sort-section">
          <van-dropdown-menu active-color="#4a9eff">
            <van-dropdown-item v-model="sortBy" :options="sortOptions" />
          </van-dropdown-menu>
        </div>
      </div>

      <!-- 工作流列表 -->
      <div class="m-workflow-list">
        <!-- 加载状态 -->
        <van-loading
          v-if="isLoading"
          class="f-loading"
          type="spinner"
          color="#4a9eff"
          size="40"
        >
          加载中...
        </van-loading>

        <!-- 空状态 -->
        <van-empty
          v-else-if="!isLoading && filteredWorkflows.length === 0"
          image="search"
          :description="searchKeyword ? '未找到相关工作流' : '暂无工作流'"
        >
          <van-button
            v-if="!searchKeyword"
            type="primary"
            round
            @click="handleCreateWorkflow"
          >
            创建第一个工作流
          </van-button>
        </van-empty>

        <!-- 工作流卡片列表 -->
        <div v-else class="f-workflow-grid">
          <WorkflowCard
            v-for="workflow in filteredWorkflows"
            :key="workflow.id"
            :workflow="workflow"
            @open="handleOpenWorkflow"
            @edit="handleEditWorkflow"
            @delete="handleDeleteWorkflow"
          />
        </div>
      </div>
    </div>

    <!-- 悬浮创建按钮 -->
    <van-floating-bubble
      v-if="hasWorkflows"
      icon="plus"
      magnetic="x"
      @click="handleCreateWorkflow"
    />

    <!-- 创建工作流弹窗 -->
    <van-dialog
      v-model:show="showCreateDialog"
      title="创建工作流"
      show-cancel-button
      :before-close="handleBeforeClose"
    >
      <div class="f-create-form">
        <van-field
          v-model="createForm.workflowName"
          label="工作流名称"
          placeholder="请输入工作流名称"
          required
          :rules="[{ required: true, message: '请输入工作流名称' }]"
        />
        <van-field
          v-model="createForm.description"
          label="描述"
          type="textarea"
          placeholder="请输入工作流描述（可选）"
          rows="3"
          autosize
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { showToast } from 'vant'
import TopNavBar from '@/components/user/TopNavBar.vue'
import UserMenu from '@/components/user/UserMenu.vue'
import WorkflowCard from '@/components/user/WorkflowCard.vue'
import { useWorkflowList } from '@/composables/useWorkflowList'
import { useServiceStore } from '@/stores/service'
import type { Workflow } from '@/types/workflow'

const showUserMenu = ref(false)
const showCreateDialog = ref(false)
const serviceStore = useServiceStore()

const createForm = reactive({
  workflowName: '',
  description: ''
})

const sortOptions = [
  { text: '更新时间', value: 'updateTime' },
  { text: '创建时间', value: 'createTime' }
]

const {
  searchKeyword,
  sortBy,
  filteredWorkflows,
  isLoading,
  hasWorkflows,
  createWorkflow,
  deleteWorkflow,
  openWorkflow
} = useWorkflowList()

function handleCreateWorkflow(): void {
  showCreateDialog.value = true
}

function handleOpenWorkflow(workflow: Workflow): void {
  openWorkflow(workflow.id)
}

function handleEditWorkflow(workflow: Workflow): void {
  openWorkflow(workflow.id)
}

function handleDeleteWorkflow(workflow: Workflow): void {
  deleteWorkflow(workflow.id, workflow.workflowName)
}

async function handleBeforeClose(action: string): Promise<boolean> {
  if (action === 'confirm') {
    if (!createForm.workflowName.trim()) {
      return false
    }

    // 检查是否选择了服务
    if (!serviceStore.selectedService) {
      showToast({
        type: 'fail',
        message: '请先选择 ComfyUI 服务'
      })
      return false
    }

    await createWorkflow({
      workflowName: createForm.workflowName,
      description: createForm.description || undefined,
      comfyuiServerId: serviceStore.selectedService.id,
      comfyuiServerKey: serviceStore.selectedService.serverKey
    })
    createForm.workflowName = ''
    createForm.description = ''
  }
  return true
}
</script>

<style scoped lang="scss">
.g-workflow-list-view {
  min-height: 100vh;
  background: #1a1a1a;
  display: flex;
  flex-direction: column;

  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.m-toolbar {
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;

  :deep(.van-search) {
    padding: 16px 16px 0;
  }

  :deep(.van-search__content) {
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
  }

  :deep(.van-field__control) {
    color: #ffffff;

    &::placeholder {
      color: #666666;
    }
  }

  .f-sort-section {
    :deep(.van-dropdown-menu) {
      background: #2a2a2a;
    }

    :deep(.van-dropdown-menu__bar) {
      background: #2a2a2a;
      box-shadow: none;
    }

    :deep(.van-dropdown-menu__title) {
      color: #ffffff;
    }
  }
}

.m-workflow-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .f-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 0;
    color: #999999;
  }

  :deep(.van-empty) {
    padding: 60px 0;
  }

  :deep(.van-empty__image) {
    width: 120px;
    height: 120px;
  }

  :deep(.van-empty__description) {
    color: #999999;
    font-size: 14px;
    margin-bottom: 16px;
  }
}

.f-workflow-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.f-create-form {
  padding: 20px 16px;

  :deep(.van-cell) {
    background: transparent;
    color: #ffffff;
    padding: 12px 0;

    &::after {
      border-color: #3a3a3a;
    }
  }

  :deep(.van-field__label) {
    color: #cccccc;
  }

  :deep(.van-field__control) {
    color: #ffffff;

    &::placeholder {
      color: #666666;
    }
  }
}

:deep(.van-floating-bubble) {
  background: #4a9eff;
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.4);
}
</style>
