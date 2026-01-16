<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="f-admin-modal" @click="handleMaskClick">
        <div class="f-admin-modal__content" @click.stop>
          <!-- 模态框头部 -->
          <div class="f-admin-modal__header">
            <span class="f-admin-modal__title">{{ title }}</span>
            <button class="f-admin-modal__close" @click="handleClose">×</button>
          </div>

          <!-- 模态框主体 -->
          <div class="f-admin-modal__body">
            <slot></slot>
          </div>

          <!-- 模态框底部 -->
          <div class="f-admin-modal__footer">
            <button class="f-btn" @click="handleCancel">{{ cancelText }}</button>
            <button class="f-btn f-btn-primary" @click="handleConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  modelValue: boolean
  title: string
  cancelText?: string
  confirmText?: string
  closeOnMask?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  cancelText: '取消',
  confirmText: '保存',
  closeOnMask: true
})

const emit = defineEmits<Emits>()

// 处理遮罩点击
function handleMaskClick(): void {
  if (props.closeOnMask) {
    handleClose()
  }
}

// 关闭模态框
function handleClose(): void {
  emit('update:modelValue', false)
}

// 取消按钮
function handleCancel(): void {
  emit('cancel')
  handleClose()
}

// 确认按钮
function handleConfirm(): void {
  emit('confirm')
}

// 监听模态框显示状态，控制 body 滚动
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped lang="scss">
// 模态框遮罩层
.f-admin-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

// 模态框内容容器
.f-admin-modal__content {
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

// 模态框头部
.f-admin-modal__header {
  padding: 16px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.f-admin-modal__title {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
}

.f-admin-modal__close {
  background: none;
  border: none;
  font-size: 20px;
  color: #777777;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #cccccc;
  }
}

// 模态框主体
.f-admin-modal__body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;

  // 深色滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 3px;

    &:hover {
      background: #555555;
    }
  }
}

// 模态框底部
.f-admin-modal__footer {
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

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover {
      background: #5aa8ff;
    }
  }
}

// 过渡动画
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .f-admin-modal__content,
.modal-fade-leave-active .f-admin-modal__content {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .f-admin-modal__content,
.modal-fade-leave-to .f-admin-modal__content {
  transform: scale(0.95);
}
</style>
