<template>
  <div class="g-workflow-list-view">
    <TopNavBar />

    <div class="g-workflow-list-view__container">
      <div class="g-workflow-list-view__header">
        <div class="g-workflow-list-view__header-left">
          <h1 class="g-workflow-list-view__title">我的工作流</h1>
          <p class="g-workflow-list-view__description">
            管理您的 ComfyUI 工作流
          </p>
        </div>
        <div class="g-workflow-list-view__header-right">
          <BaseButton variant="primary" @click="handleCreateWorkflow">
            <BaseIcon name="plus" :size="16" />
            新建工作流
          </BaseButton>
        </div>
      </div>

      <div v-if="loading" class="g-workflow-list-view__loading">
        <BaseIcon name="loading" :size="48" />
        <p>加载工作流列表中...</p>
      </div>

      <div v-else-if="workflows.length === 0" class="g-workflow-list-view__empty">
        <BaseIcon name="inbox" :size="64" />
        <p>暂无工作流</p>
        <BaseButton variant="primary" @click="handleCreateWorkflow">
          创建第一个工作流
        </BaseButton>
      </div>

      <div v-else class="g-workflow-list-view__grid">
        <WorkflowCard
          v-for="workflow in workflows"
          :key="workflow.id"
          :workflow="workflow"
          @open="handleOpenWorkflow"
          @edit="handleEditWorkflow"
          @delete="handleDeleteWorkflow"
        />
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <BaseModal
      v-model="showDeleteModal"
      title="删除工作流"
      width="400px"
    >
      <p style="color: #cccccc; margin: 0 0 20px 0;">
        确定要删除工作流 "{{ workflowToDelete?.name }}" 吗？此操作无法撤销。
      </p>
      <template #footer>
        <BaseButton variant="secondary" @click="showDeleteModal = false">
          取消
        </BaseButton>
        <BaseButton variant="danger" :loading="deleting" @click="confirmDelete">
          删除
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TopNavBar from '@/components/user/TopNavBar.vue'
import WorkflowCard from '@/components/user/WorkflowCard.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import { getWorkflowList, deleteWorkflow } from '@/services/workflow'
import type { Workflow } from '@/types/workflow'

const router = useRouter()

const workflows = ref<Workflow[]>([])
const loading = ref(false)
const showDeleteModal = ref(false)
const workflowToDelete = ref<Workflow | null>(null)
const deleting = ref(false)

onMounted(async () => {
  await loadWorkflows()
})

async function loadWorkflows(): Promise<void> {
  loading.value = true
  try {
    workflows.value = await getWorkflowList()
  } catch (error) {
    console.error('加载工作流列表失败:', error)
  } finally {
    loading.value = false
  }
}

function handleCreateWorkflow(): void {
  router.push('/workflow/new')
}

function handleOpenWorkflow(workflow: Workflow): void {
  router.push(`/workflow/${workflow.id}`)
}

function handleEditWorkflow(workflow: Workflow): void {
  router.push(`/workflow/${workflow.id}`)
}

function handleDeleteWorkflow(workflow: Workflow): void {
  workflowToDelete.value = workflow
  showDeleteModal.value = true
}

async function confirmDelete(): Promise<void> {
  if (!workflowToDelete.value) return

  deleting.value = true
  try {
    await deleteWorkflow(workflowToDelete.value.id)
    await loadWorkflows()
    showDeleteModal.value = false
  } catch (error) {
    console.error('删除工作流失败:', error)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped lang="scss">
.g-workflow-list-view {
  min-height: 100vh;
  background: #1a1a1a;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 24px;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 32px;
  }

  &__header-left {
    flex: 1;
  }

  &__title {
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  &__description {
    font-size: 16px;
    color: #999999;
    margin: 0;
  }

  &__header-right {
    flex-shrink: 0;
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
