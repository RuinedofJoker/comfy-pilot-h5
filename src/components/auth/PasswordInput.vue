<template>
  <div class="f-password-input">
    <label v-if="label" class="f-password-input__label">
      {{ label }}
      <span v-if="required" class="f-password-input__required">*</span>
    </label>
    <div class="f-password-input__wrapper">
      <input
        :type="showPassword ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="f-password-input__field"
        @input="handleInput"
        @blur="handleBlur"
      />
      <button
        type="button"
        class="f-password-input__toggle"
        tabindex="-1"
        @click="togglePasswordVisibility"
      >
        <!-- 眼睛图标 - 显示密码 -->
        <svg
          v-if="!showPassword"
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <!-- 眼睛关闭图标 - 隐藏密码 -->
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </button>
    </div>
    <div v-if="error" class="f-password-input__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const showPassword = ref(false)

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur(): void {
  emit('blur')
}

function togglePasswordVisibility(): void {
  showPassword.value = !showPassword.value
}
</script>

<style scoped lang="scss">
.f-password-input {
  width: 100%;

  &__label {
    display: block;
    font-size: 14px;
    color: #cccccc;
    margin-bottom: 8px;
    font-weight: 500;
  }

  &__required {
    color: #ff4d4f;
    margin-left: 4px;
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__field {
    width: 100%;
    height: 40px;
    padding: 0 40px 0 12px;
    background: #1a1a1a;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: #ffffff;
    font-size: 14px;
    transition: all 0.2s;

    &::placeholder {
      color: #666666;
    }

    &:hover {
      border-color: #4a9eff;
    }

    &:focus {
      outline: none;
      border-color: #4a9eff;
      background: #252525;
    }

    &:disabled {
      background: #2a2a2a;
      color: #666666;
      cursor: not-allowed;
    }
  }

  &__toggle {
    position: absolute;
    right: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: #999999;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;

    &:hover {
      background: #3a3a3a;
      color: #ffffff;
    }
  }

  &__error {
    margin-top: 6px;
    font-size: 12px;
    color: #ff4d4f;
  }
}
</style>
