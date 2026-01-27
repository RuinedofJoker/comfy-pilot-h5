<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '520px' }"
    round
    closeable
    @close="handleClose"
    @update:show="emit('update:visible', $event)"
  >
    <div class="m-session-modal">
      <h3 class="f-modal-title">{{ isEdit ? '编辑会话' : '新建会话' }}</h3>

      <div class="f-modal-body">
        <!-- 会话基本信息 -->
        <div class="f-form-section">
          <h4 class="f-section-title">会话基本信息</h4>

          <!-- 标题输入 -->
          <div class="f-form-item">
            <label class="f-label">
              会话标题
              <span class="f-optional">(可选)</span>
            </label>
            <van-field
              v-model="formData.title"
              placeholder="请输入会话标题"
              :border="false"
              class="f-input"
            />
          </div>

          <!-- Rules 配置 -->
          <div class="f-form-item">
            <label class="f-label">
              Rules 配置
            </label>
            <van-field
              v-model="formData.rules"
              type="textarea"
              placeholder="请输入 Rules 配置"
              :border="false"
              class="f-input"
              rows="20"
            />
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="f-modal-footer">
        <button class="f-btn" @click="handleClose">取消</button>
        <button class="f-btn f-btn-primary" @click="handleConfirm" :disabled="loading">
          {{ loading ? '处理中...' : '确认' }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from '@/utils/toast'
import { getSessionByCode } from '@/services/session'

// Props
interface Props {
  visible: boolean
  isEdit?: boolean
  sessionCode?: string
  comfyuiServerId: string
  comfyuiServerName: string
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  sessionCode: undefined
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [data: { title?: string; rules?: string }]
}>()

// 状态
const loading = ref(false)

// 表单数据
const formData = ref({
  title: '',
  rules: ''
})

// 处理确认
function handleConfirm() {
  emit('confirm', {
    title: formData.value.title || undefined,
    rules: formData.value.rules || undefined
  })
}

// 清空表单
function resetForm() {
  formData.value.title = ''
  formData.value.rules = ''
}

// 处理关闭
function handleClose() {
  emit('update:visible', false)
  resetForm()
}

// 初始化表单
async function initForm() {
  // 如果是编辑模式，加载会话详情
  if (props.isEdit && props.sessionCode) {
    try {
      const session = await getSessionByCode(props.sessionCode)
      formData.value.title = session.title || ''
      formData.value.rules = session.rules || ''
    } catch (error) {
      console.error('加载会话详情失败:', error)
      toast.error('加载会话详情失败')
    }
  } else {
    // 新建模式，清空表单
    resetForm()
  }
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initForm()
  } else {
    // 关闭时清空表单
    resetForm()
  }
})
</script>

<style scoped lang="scss">
// 弹窗主容器样式
.m-session-modal {
  background: #2a2a2a;
  color: #cccccc;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

// 标题样式
.f-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #3a3a3a;
}

// 弹窗主体区域
.f-modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  flex: 1;
}

// 表单区域容器
.f-form-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 区域标题
.f-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3a3a;
}

// 表单项
.f-form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 标签样式
.f-label {
  display: block;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 8px;
  font-weight: 400;
  line-height: 1.5;
}

// 可选标记
.f-optional {
  color: #777777;
  font-size: 11px;
  margin-left: 4px;
}

// 输入框样式
.f-input {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #cccccc;
  font-size: 13px;
  padding: 0;
  min-height: auto;

  :deep(.van-cell) {
    padding: 0;
    background: transparent;
    line-height: normal;
    min-height: auto;
    position: relative;
  }

  :deep(.van-cell__value) {
    width: 100%;
    padding: 0;
  }

  :deep(.van-field__value) {
    width: 100%;
    padding: 0;
  }

  :deep(.van-field__body) {
    padding: 0;
    height: auto;
  }

  :deep(.van-field__control) {
    color: #cccccc;
    font-size: 13px;
    background: transparent;
    line-height: 1.5;
    min-height: auto;
    padding: 8px 12px;
    width: 100%;
  }

  :deep(.van-field__control::placeholder) {
    color: #555555;
  }

  // 自定义滚动条样式（纵向）
  :deep(.van-field__control::-webkit-scrollbar) {
    width: 8px;
  }

  :deep(.van-field__control::-webkit-scrollbar-track) {
    background: #1e1e1e;
  }

  :deep(.van-field__control::-webkit-scrollbar-thumb) {
    background: #3a3a3a;
    border-radius: 4px;

    &:hover {
      background: #4a4a4a;
    }
  }

  // 自定义滚动条样式（横向）
  :deep(.van-field__control::-webkit-scrollbar:horizontal) {
    height: 8px;
  }

  &:focus-within {
    border-color: #555555;
  }
}

// 提示信息框
.f-info-box {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(74, 158, 255, 0.1);
  border: 1px solid rgba(74, 158, 255, 0.3);
  border-radius: 4px;
  margin-top: 16px;

  .f-icon {
    width: 18px;
    height: 18px;
    color: #4a9eff;
    flex-shrink: 0;
    margin-top: 2px;
  }

  span {
    flex: 1;
    font-size: 12px;
    color: #cccccc;
    line-height: 1.5;
  }
}

// 底部按钮区域
.f-modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

// 按钮样式
.f-btn {
  padding: 6px 10px;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #454545;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover {
      background: #5aa8ff;
    }

    &:disabled {
      background: #4a9eff;
      opacity: 0.5;
    }
  }
}

// Popup 覆盖样式
:deep(.van-popup) {
  background: #2a2a2a;
  border: 1px solid #444444;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

:deep(.van-popup__close-icon) {
  color: #999999;
  font-size: 20px;

  &:hover {
    color: #ffffff;
  }
}
</style>
