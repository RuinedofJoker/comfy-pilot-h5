<template>
  <div class="f-chat-input-container">
    <!-- 附件预览 -->
    <div v-if="attachments.length > 0" class="f-attachments-preview">
      <div v-for="(file, index) in attachments" :key="index" class="f-attachment-item">
        <span class="f-attachment-name">{{ file.name }}</span>
        <button class="f-attachment-remove" @click="$emit('remove-attachment', index)">×</button>
      </div>
    </div>

    <!-- 输入框 -->
    <div class="f-input-row">
      <button class="f-attach-btn" @click="$emit('attach-click')" title="添加附件">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
        </svg>
      </button>

      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
        @keydown="handleKeyDown"
        placeholder="Ask before edits"
        rows="1"
      />

      <button
        class="f-send-btn"
        :class="{ 'f-sending': isSending }"
        :disabled="!canSend"
        @click="handleSendClick"
        :title="isSending ? '停止' : '发送'"
      >
        <svg v-if="!isSending" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: string
  isSending: boolean
  attachments: Array<{ name: string }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'stop': []
  'attach-click': []
  'remove-attachment': [index: number]
}>()

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const canSend = computed(() => {
  return props.modelValue.trim().length > 0 || props.isSending
})

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    if (canSend.value) {
      handleSendClick()
    }
  }
}

function handleSendClick() {
  if (props.isSending) {
    emit('stop')
  } else if (props.modelValue.trim()) {
    emit('send')
  }
}
</script>

<style scoped lang="scss">
.f-chat-input-container {
  border-top: 1px solid #3a3a3a;
  background: #1e1e1e;
}

.f-attachments-preview {
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.f-attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #2a2a2a;
  border-radius: 4px;
  font-size: 12px;
  color: #cccccc;
}

.f-attachment-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0;
  font-size: 16px;

  &:hover {
    color: #ff4444;
  }
}

.f-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px;
}

.f-attach-btn {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: #fff;
  }
}

textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: #cccccc;
  font-size: 13px;
  font-family: inherit;
  line-height: 1.5;
  resize: none;
  outline: none;
  min-height: 32px;
  max-height: 120px;

  &::placeholder {
    color: #666;
  }
}

.f-send-btn {
  width: 32px;
  height: 32px;
  background: #d97706;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover:not(:disabled) {
    background: #ea580c;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.f-sending {
    background: #dc2626;

    &:hover {
      background: #ef4444;
    }
  }
}
</style>
