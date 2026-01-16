<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="modelValue" class="f-base-modal" @click="handleOverlayClick">
        <div class="f-base-modal__content" :style="contentStyle" @click.stop>
          <div v-if="showHeader" class="f-base-modal__header">
            <slot name="header">
              <h3 class="f-base-modal__title">{{ title }}</h3>
            </slot>
            <button
              v-if="showClose"
              class="f-base-modal__close"
              @click="handleClose"
            >
              ×
            </button>
          </div>
          <div class="f-base-modal__body">
            <slot />
          </div>
          <div v-if="$slots.footer" class="f-base-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string
  showHeader?: boolean
  showClose?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  showClose: true,
  closeOnOverlay: true,
  width: '520px'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const contentStyle = computed(() => ({
  width: props.width,
  maxWidth: '90%'
}))

function handleClose(): void {
  emit('update:modelValue', false)
  emit('close')
}

function handleOverlayClick(): void {
  if (props.closeOnOverlay) {
    handleClose()
  }
}
</script>

<style scoped lang="scss">
.f-base-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &__content {
    background: #2a2a2a;
    border-radius: 8px;
    border: 1px solid #444444;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  }

  &__header {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3a3a3a;
  }

  &__title {
    font-size: 16px;
    font-weight: 500;
    color: #ffffff;
  }

  &__close {
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    color: #999999;
    font-size: 20px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #3a3a3a;
      color: #ffffff;
    }
  }

  &__body {
    padding: 24px;
    max-height: 60vh;
    overflow-y: auto;
  }

  &__footer {
    padding: 16px 24px;
    border-top: 1px solid #3a3a3a;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
