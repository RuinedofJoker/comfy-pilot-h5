<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <span v-if="loading" class="f-btn-loading">
      <svg class="f-btn-spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" fill="none" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" />
      </svg>
    </span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'medium',
  disabled: false,
  loading: false,
  type: 'button',
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'f-base-btn',
  `f-base-btn--${props.variant}`,
  `f-base-btn--${props.size}`,
  {
    'f-base-btn--disabled': props.disabled,
    'f-base-btn--loading': props.loading,
    'f-base-btn--block': props.block
  }
])

function handleClick(event: MouseEvent): void {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
.f-base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  user-select: none;

  &:active:not(&--disabled):not(&--loading) {
    transform: scale(0.98);
  }

  // 尺寸
  &--small {
    padding: 4px 10px;
    font-size: 12px;
  }

  &--medium {
    padding: 6px 12px;
    font-size: 13px;
  }

  &--large {
    padding: 8px 16px;
    font-size: 14px;
  }

  // 变体
  &--primary {
    background: #4a9eff;
    color: #ffffff;
    border-color: #4a9eff;

    &:hover:not(.f-base-btn--disabled):not(.f-base-btn--loading) {
      background: #3d8de6;
      border-color: #3d8de6;
    }
  }

  &--secondary {
    background: #3a3a3a;
    color: #cccccc;
    border-color: #444444;

    &:hover:not(.f-base-btn--disabled):not(.f-base-btn--loading) {
      background: #454545;
      border-color: #555555;
      color: #ffffff;
    }
  }

  &--danger {
    background: #e74c3c;
    color: #ffffff;
    border-color: #e74c3c;

    &:hover:not(.f-base-btn--disabled):not(.f-base-btn--loading) {
      background: #c0392b;
      border-color: #c0392b;
    }
  }

  &--ghost {
    background: transparent;
    color: #cccccc;
    border-color: #444444;

    &:hover:not(.f-base-btn--disabled):not(.f-base-btn--loading) {
      background: #2a2a2a;
      border-color: #555555;
    }
  }

  // 状态
  &--disabled {
    background: #242424;
    color: #555555;
    border-color: #2a2a2a;
    cursor: not-allowed;
  }

  &--loading {
    cursor: not-allowed;
  }

  &--block {
    width: 100%;
  }
}

.f-btn-loading {
  display: inline-flex;
  align-items: center;
}

.f-btn-spinner {
  width: 14px;
  height: 14px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
