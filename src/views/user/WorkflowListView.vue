<template>
  <div class="g-workflow-list-view">
    <!-- 顶部导航栏 -->
    <TopNavBar @open-agent-config="showAgentConfigModal = true" />

    <!-- Agent 配置弹窗 -->
    <AgentConfigModal v-model:visible="showAgentConfigModal" />

    <!-- 用户菜单 -->
    <UserMenu v-model:show="showUserMenu" />

    <!-- 主内容区 -->
    <div class="m-main-container">
      <!-- 页面标题 -->
      <div class="m-page-header">
        <h1 class="f-page-title">📁 我的工作流</h1>
        <p class="f-page-subtitle">管理和编辑你的 ComfyUI 工作流</p>
      </div>

      <!-- 工具栏 -->
      <div class="m-toolbar">
        <div class="f-toolbar-left">
          <!-- 搜索框 -->
          <div class="f-search-box">
            <van-icon name="search" size="14" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索工作流..."
            />
          </div>

          <!-- 筛选按钮组 -->
          <button
            class="f-filter-btn"
            :class="{ active: filterType === 'all' }"
            @click="filterType = 'all'"
          >
            全部
          </button>
          <button
            class="f-filter-btn"
            :class="{ active: filterType === 'favorite' }"
            @click="filterType = 'favorite'"
          >
            ⭐ 收藏
          </button>
        </div>

        <div class="f-toolbar-right">
          <!-- 排序选择 -->
          <select v-model="sortBy" class="f-sort-select">
            <option value="updateTime">最近使用</option>
            <option value="workflowName">名称</option>
            <option value="createTime">创建时间</option>
          </select>
        </div>
      </div>

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
        v-else-if="!isLoading && displayedWorkflows.length === 0"
        image="search"
        :description="searchKeyword ? '未找到相关工作流' : '暂无工作流'"
      />

      <!-- 工作流网格 -->
      <div v-else class="m-workflows-grid">
        <div
          v-for="workflow in displayedWorkflows"
          :key="workflow.id"
          class="f-workflow-card"
          @click="handleOpenWorkflow(workflow)"
        >
          <!-- 缩略图 -->
          <div class="f-workflow-thumbnail">
            <span class="f-thumbnail-icon">📊</span>
          </div>

          <!-- 卡片内容 -->
          <div class="f-workflow-content">
            <!-- 标题区 -->
            <div class="f-workflow-header">
              <div>
                <h3 class="f-workflow-title">{{ workflow.workflowName }}</h3>
                <div class="f-workflow-service">
                  <van-icon name="cluster-o" size="10" />
                  {{ workflow.comfyuiServerKey }}
                </div>
              </div>
            </div>

            <!-- 描述 -->
            <p class="f-workflow-description">
              {{ workflow.description || '暂无描述' }}
            </p>

            <!-- 页脚 -->
            <div class="f-workflow-footer">
              <div class="f-workflow-time">
                <van-icon name="clock-o" size="10" />
                {{ formatTime(workflow.updateTime) }}
              </div>
              <div class="f-workflow-actions">
                <button
                  class="f-action-btn"
                  @click.stop="handleEditWorkflow(workflow)"
                >
                  <van-icon name="edit" size="12" />
                  编辑
                </button>
                <button
                  class="f-action-btn"
                  @click.stop="handleDeleteWorkflow(workflow)"
                >
                  <van-icon name="delete-o" size="12" />
                  删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑工作流信息弹窗 -->
    <BaseAdminModal
      v-model="showEditDialog"
      title="编辑工作流信息"
      @confirm="handleConfirmEdit"
      @cancel="handleCancelEdit"
    >
      <BaseFormGroup label="工作流名称" required>
        <BaseInput
          v-model="editForm.workflowName"
          placeholder="请输入工作流名称"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="描述">
        <BaseTextarea
          v-model="editForm.description"
          placeholder="请输入工作流描述（可选）"
          :rows="3"
        />
      </BaseFormGroup>

      <BaseFormGroup label="缩略图 URL">
        <BaseInput
          v-model="editForm.thumbnailUrl"
          placeholder="https://example.com/thumbnail.png"
        />
      </BaseFormGroup>
    </BaseAdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { showToast } from 'vant'
import TopNavBar from '@/components/user/TopNavBar.vue'
import UserMenu from '@/components/user/UserMenu.vue'
import AgentConfigModal from '@/components/user/AgentConfigModal.vue'
import BaseAdminModal from '@/components/admin/BaseAdminModal.vue'
import BaseFormGroup from '@/components/admin/BaseFormGroup.vue'
import BaseInput from '@/components/admin/BaseInput.vue'
import BaseTextarea from '@/components/admin/BaseTextarea.vue'
import { useWorkflowList } from '@/composables/useWorkflowList'
import { useWorkflowStore } from '@/stores/workflow'
import type { Workflow } from '@/types/workflow'

const showUserMenu = ref(false)
const showAgentConfigModal = ref(false)
const showEditDialog = ref(false)
const editingWorkflow = ref<Workflow | null>(null)
const filterType = ref<'all' | 'favorite'>('all')
const workflowStore = useWorkflowStore()

const editForm = reactive({
  workflowName: '',
  description: '',
  thumbnailUrl: ''
})

const {
  searchKeyword,
  sortBy,
  filteredWorkflows,
  isLoading,
  deleteWorkflow,
  openWorkflow
} = useWorkflowList()

// 显示的工作流列表（根据筛选类型）
const displayedWorkflows = computed(() => {
  return filteredWorkflows.value
})

// 格式化时间
function formatTime(time: string): string {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

// 打开工作流编辑器
function handleOpenWorkflow(workflow: Workflow): void {
  openWorkflow(workflow.id)
}

// 编辑工作流信息
function handleEditWorkflow(workflow: Workflow): void {
  editingWorkflow.value = workflow
  editForm.workflowName = workflow.workflowName
  editForm.description = workflow.description || ''
  editForm.thumbnailUrl = workflow.thumbnailUrl || ''
  showEditDialog.value = true
}

// 删除工作流
function handleDeleteWorkflow(workflow: Workflow): void {
  deleteWorkflow(workflow.id, workflow.workflowName)
}

// 确认编辑
async function handleConfirmEdit(): Promise<void> {
  if (!editForm.workflowName.trim()) {
    showToast({ type: 'fail', message: '请输入工作流名称' })
    return
  }

  if (!editingWorkflow.value) {
    return
  }

  try {
    await workflowStore.updateWorkflowInfo(editingWorkflow.value.id, {
      workflowName: editForm.workflowName,
      description: editForm.description || undefined,
      thumbnailUrl: editForm.thumbnailUrl || undefined
    })
    showToast({ type: 'success', message: '更新成功' })
    resetEditForm()
    showEditDialog.value = false
  } catch (error) {
    showToast({ type: 'fail', message: '更新失败' })
  }
}

// 取消编辑
function handleCancelEdit(): void {
  resetEditForm()
}

// 重置编辑表单
function resetEditForm(): void {
  editForm.workflowName = ''
  editForm.description = ''
  editForm.thumbnailUrl = ''
  editingWorkflow.value = null
}
</script>

<style scoped lang="scss">
.g-workflow-list-view {
  min-height: 100vh;
  background: #202020;
  display: flex;
  flex-direction: column;
}

.m-main-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  &::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 4px;

    &:hover {
      background: #555555;
    }
  }
}

// 页面标题
.m-page-header {
  margin-bottom: 24px;
}

.f-page-title {
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.f-page-subtitle {
  font-size: 13px;
  color: #999999;
}

// 工具栏
.m-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #353535;
  border: 1px solid #444444;
  border-radius: 6px;
}

.f-toolbar-left {
  display: flex;
  gap: 10px;
  align-items: center;
}

.f-toolbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

// 搜索框
.f-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  transition: border-color 0.2s;

  &:focus-within {
    border-color: #4a9eff;
  }

  input {
    border: none;
    background: none;
    outline: none;
    font-size: 13px;
    color: #ffffff;
    width: 200px;

    &::placeholder {
      color: #666666;
    }
  }
}

// 筛选按钮
.f-filter-btn {
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #cccccc;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
  }

  &.active {
    background: #4a9eff;
    color: #ffffff;
    border-color: #4a9eff;
  }
}

// 排序选择
.f-sort-select {
  padding: 6px 10px;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: #2a2a2a;
  color: #cccccc;
  outline: none;

  &:hover {
    border-color: #555555;
  }
}

// 加载状态
.f-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #999999;
}

// 空状态
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

// 工作流网格
.m-workflows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

// 工作流卡片
.f-workflow-card {
  background: #353535;
  border: 1px solid #444444;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #4a9eff;
    background: #3a3a3a;
  }
}

// 缩略图
.f-workflow-thumbnail {
  width: 100%;
  height: 160px;
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
  border-bottom: 1px solid #444444;
}

.f-thumbnail-icon {
  font-size: 48px;
}

// 卡片内容
.f-workflow-content {
  padding: 16px;
}

// 标题区
.f-workflow-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.f-workflow-title {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 6px;
}

.f-workflow-service {
  font-size: 11px;
  color: #777777;
  display: flex;
  align-items: center;
  gap: 4px;
}

// 描述
.f-workflow-description {
  font-size: 12px;
  color: #999999;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 36px;
}

// 页脚
.f-workflow-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #444444;
}

.f-workflow-time {
  font-size: 11px;
  color: #666666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.f-workflow-actions {
  display: flex;
  gap: 6px;
}

// 操作按钮
.f-action-btn {
  padding: 4px 8px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  color: #cccccc;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}

// 响应式
@media (max-width: 768px) {
  .m-main-container {
    padding: 16px;
  }

  .m-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .f-toolbar-left,
  .f-toolbar-right {
    flex-wrap: wrap;
  }

  .m-workflows-grid {
    grid-template-columns: 1fr;
  }

  .f-search-box input {
    width: 150px;
  }
}
</style>
