<template>
  <div v-if="visible" class="f-modal-overlay" @click.self="$emit('close')">
    <div class="f-modal">
      <div class="f-modal-header">
        <h3>新建工作流</h3>
        <button class="f-close-btn" @click="$emit('close')">×</button>
      </div>
      <div class="f-modal-body">
        <div class="f-form-group">
          <label>工作流名称 *</label>
          <input
            v-model="workflowName"
            type="text"
            placeholder="请输入工作流名称"
          />
        </div>
        <div class="f-form-group">
          <label>描述</label>
          <textarea
            v-model="workflowDescription"
            placeholder="请输入工作流描述（可选）"
            rows="3"
          ></textarea>
        </div>
      </div>
      <div class="f-modal-footer">
        <button class="f-modal-btn" @click="$emit('close')">取消</button>
        <button
          class="f-modal-btn primary"
          :disabled="!workflowName.trim()"
          @click="handleConfirm"
        >
          创建
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'close': []
  'confirm': [name: string, description?: string]
}>()

// 本地状态
const workflowName = ref('')
const workflowDescription = ref('')

// 确认创建
function handleConfirm(): void {
  if (!workflowName.value.trim()) return

  emit('confirm', workflowName.value, workflowDescription.value || undefined)

  // 重置表单
  workflowName.value = ''
  workflowDescription.value = ''
}

// 监听 visible 变化，关闭时重置表单
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    workflowName.value = ''
    workflowDescription.value = ''
  }
})
</script>

<style scoped lang="scss">
// 模态框遮罩
.f-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

// 模态框容器
.f-modal {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

// 模态框头部
.f-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
  }
}

.f-close-btn {
  background: transparent;
  border: none;
  color: #777777;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #ffffff;
  }
}

// 模态框主体
.f-modal-body {
  padding: 20px;
}

.f-form-group {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #cccccc;
    font-weight: 500;
  }

  input,
  textarea {
    width: 100%;
    padding: 8px 12px;
    background: #242424;
    border: 1px solid #3a3a3a;
    border-radius: 3px;
    color: #cccccc;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: #4a9eff;
    }

    &::placeholder {
      color: #777777;
    }
  }

  textarea {
    resize: vertical;
    font-family: inherit;
  }
}

// 模态框底部
.f-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.f-modal-btn {
  padding: 8px 20px;
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #333333;
    border-color: #4a4a4a;
  }

  &.primary {
    background: #4a9eff;
    color: #ffffff;
    border-color: #4a9eff;

    &:hover:not(:disabled) {
      background: #5aa9ff;
    }
  }

  &:disabled {
    background: #242424;
    color: #555555;
    cursor: not-allowed;
    border-color: #2a2a2a;
  }
}
</style>
