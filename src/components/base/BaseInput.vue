<template>
  <div class="f-base-input">
    <label v-if="label" class="f-base-input__label">
      {{ label }}
      <span v-if="required" class="f-base-input__required">*</span>
    </label>
    <div class="f-base-input__wrapper">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        class="f-base-input__field"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
    </div>
    <div v-if="error" class="f-base-input__error">{{ error }}</div>
    <div v-else-if="hint" class="f-base-input__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur(event: FocusEvent): void {
  emit('blur', event)
}

function handleFocus(event: FocusEvent): void {
  emit('focus', event)
}
</script>

<style scoped lang="scss">
.f-base-input {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #cccccc;
  }

  &__required {
    color: #e74c3c;
    margin-left: 2px;
  }

  &__wrapper {
    position: relative;
  }

  &__field {
    width: 100%;
    padding: 12px 16px;
    background: #0a0a0a;
    border: 1px solid #2a2a2a;
    border-radius: 8px;
    font-size: 14px;
    color: #ffffff;
    transition: all 0.2s;
    outline: none;

    &::placeholder {
      color: #555555;
    }

    &:focus {
      border-color: #4a9eff;
      background: #0f0f0f;
    }

    &:disabled {
      background: #1a1a1a;
      color: #555555;
      cursor: not-allowed;
    }

    &:readonly {
      background: #1a1a1a;
      cursor: default;
    }

    // 修复浏览器自动填充样式
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #0a0a0a inset !important;
      -webkit-text-fill-color: #ffffff !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  &__error {
    font-size: 12px;
    color: #e74c3c;
  }

  &__hint {
    font-size: 12px;
    color: #777777;
  }
}
</style>
