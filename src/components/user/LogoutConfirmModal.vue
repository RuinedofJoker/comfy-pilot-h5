<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '420px' }"
    round
    closeable
    @close="handleClose"
    @update:show="emit('update:visible', $event)"
  >
    <div class="m-logout-confirm-modal">
      <h3 class="f-modal-title">确认退出</h3>

      <div class="f-modal-body">
        <p class="f-message">
          确定要退出登录吗？
        </p>
      </div>

      <!-- 底部按钮 -->
      <div class="f-modal-footer">
        <button class="f-btn" @click="handleClose">取消</button>
        <button class="f-btn f-btn-danger" @click="handleConfirm" :disabled="loading">
          {{ loading ? '退出中...' : '退出' }}
        </button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Props
interface Props {
  visible: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': []
}>()

// 状态
const loading = ref(false)

// 处理确认
function handleConfirm() {
  emit('confirm')
}

// 处理关闭
function handleClose() {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
// 弹窗主容器样式
.m-logout-confirm-modal {
  background: #2a2a2a;
  color: #cccccc;
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
}

// 消息文本
.f-message {
  font-size: 13px;
  color: #cccccc;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

// 警告文本
.f-warning {
  font-size: 12px;
  color: #ff6b6b;
  margin: 0;
  line-height: 1.5;
}

// 底部按钮区域
.f-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-shrink: 0;
}

// 按钮样式
.f-btn {
  padding: 10px 24px;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 14px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 100px;

  &:hover {
    background: #454545;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-danger {
    background: #dc2626;
    border-color: #dc2626;
    color: #ffffff;

    &:hover {
      background: #ef4444;
    }

    &:disabled {
      background: #dc2626;
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
