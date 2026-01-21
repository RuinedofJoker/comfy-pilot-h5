<template>
  <div class="f-toolbar">
    <div class="f-toolbar-left">
      <button class="f-toolbar-btn" @click="$emit('create-workflow')">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>新建</span>
      </button>

      <!-- 工作流选择器 -->
      <div class="f-workflow-selector" :class="{ active: showDropdown }">
        <button class="f-workflow-btn" @click="toggleDropdown">
          <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
          </svg>
          <span>{{ currentWorkflow?.workflowName || '选择工作流' }}</span>
          <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>

        <div v-if="showDropdown" class="f-workflow-dropdown">
          <!-- 空状态提示 -->
          <div v-if="workflows.length === 0" class="f-dropdown-empty">
            <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
            <div class="f-empty-text">暂无工作流</div>
            <div class="f-empty-hint">点击"新建"按钮创建工作流</div>
          </div>

          <!-- 工作流列表 -->
          <div
            v-for="workflow in workflows"
            :key="workflow.id"
            class="f-dropdown-item"
            :class="{ active: currentWorkflowId === workflow.id }"
            @click="handleSelectWorkflow(workflow.id)"
          >
            <div class="f-workflow-name">{{ workflow.workflowName }}</div>
            <div class="f-workflow-meta">
              <span>{{ formatTime(workflow.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="f-service-indicator" :class="{ error: !isServiceAvailable }">
        <span class="f-service-dot" :class="{ error: !isServiceAvailable }"></span>
        <span>{{ isServiceAvailable ? (serviceName || 'ComfyUI 服务') : 'ComfyUI 服务不可用' }}</span>
      </div>

      <div class="f-workflow-status" :class="{ saved: !hasUnsavedChanges, unsaved: hasUnsavedChanges }">
        <svg v-if="!hasUnsavedChanges" class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <svg v-else class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <span>{{ hasUnsavedChanges ? '有未保存的修改' : '已保存' }}</span>
      </div>

      <button class="f-toolbar-btn primary" :disabled="!hasUnsavedChanges" @click="$emit('save-workflow')">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
        </svg>
        <span>保存</span>
      </button>

      <button class="f-toolbar-btn primary" :disabled="!currentWorkflowId" @click="$emit('execute-workflow')">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <span>运行</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Workflow } from '@/types/workflow'

// Props
interface Props {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  currentWorkflowId: string | null
  serviceName: string | null
  isServiceAvailable: boolean
  hasUnsavedChanges: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'create-workflow': []
  'select-workflow': [workflowId: string]
  'save-workflow': []
  'execute-workflow': []
}>()

// 本地状态
const showDropdown = ref(false)

// 切换下拉菜单
function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value
}

// 选择工作流
function handleSelectWorkflow(workflowId: string): void {
  emit('select-workflow', workflowId)
  showDropdown.value = false // 关闭下拉菜单
}

// 格式化时间
function formatTime(time: string): string {
  const now = new Date()
  const target = new Date(time)
  const diff = now.getTime() - target.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return target.toLocaleDateString()
}
</script>

<style scoped lang="scss">
// 工具栏
.f-toolbar {
  background: #242424;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #3a3a3a;
}

.f-toolbar-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.f-toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;

  &-lg {
    width: 20px;
    height: 20px;
  }
}

// 工具栏按钮
.f-toolbar-btn {
  padding: 4px 10px;
  background: #2a2a2a;
  color: #999999;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover:not(:disabled) {
    background: #333333;
    border-color: #4a4a4a;
    color: #cccccc;
  }

  &.primary {
    background: #3a3a3a;
    color: #cccccc;
    border-color: #4a4a4a;

    &:hover:not(:disabled) {
      background: #454545;
      border-color: #555555;
      color: #ffffff;
    }
  }

  &:disabled {
    background: #242424;
    color: #555555;
    cursor: not-allowed;
    border-color: #2a2a2a;
  }
}

// 工作流选择器
.f-workflow-selector {
  position: relative;

  &.active .f-workflow-dropdown {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
}

.f-workflow-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  color: #cccccc;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 180px;

  &:hover {
    background: #333333;
    border-color: #4a4a4a;
    color: #ffffff;
  }
}

.f-workflow-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: #353535;
  border: 1px solid #444444;
  border-radius: 6px;
  min-width: 300px;
  max-height: 400px;
  overflow-y: auto;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.f-dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #999999;

  .f-icon {
    margin-bottom: 12px;
    opacity: 0.6;
  }

  .f-empty-text {
    font-size: 14px;
    color: #cccccc;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .f-empty-hint {
    font-size: 12px;
    color: #777777;
  }
}

.f-dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #444444;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #2a2a2a;
  }

  &.active {
    background: #4a9eff;
  }
}

.f-workflow-name {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
  margin-bottom: 4px;
}

.f-workflow-meta {
  font-size: 11px;
  color: #999999;
}

.f-dropdown-item.active .f-workflow-meta {
  color: rgba(255, 255, 255, 0.8);
}

// 服务指示器
.f-service-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;
  color: #cccccc;

  &.error {
    border-color: #e74c3c;
    color: #e74c3c;
  }
}

.f-service-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  animation: pulse 2s infinite;

  &.error {
    background: #e74c3c;
  }
}

// 工作流状态
.f-workflow-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 12px;

  &.saved {
    color: #27ae60;
    border-color: #27ae60;
  }

  &.unsaved {
    color: #f39c12;
    border-color: #f39c12;
  }
}

// 状态指示器
.f-status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #cccccc;
}

.f-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;

  &.locked {
    background: #e74c3c;
    animation: pulse 1.5s infinite;
  }
}

// 动画
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
