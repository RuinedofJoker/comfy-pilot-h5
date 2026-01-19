<template>
  <div class="f-base-radio-group">
    <label
      v-for="option in options"
      :key="option.value"
      class="f-radio-option"
      :class="{ 'is-disabled': disabled }"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="f-radio-label">{{ option.label }}</span>
    </label>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string | number | boolean
}

interface Props {
  modelValue: string | number | boolean
  options: Option[]
  name?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number | boolean): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value

  // 尝试转换为布尔值
  if (value === 'true') {
    emit('update:modelValue', true)
  } else if (value === 'false') {
    emit('update:modelValue', false)
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped lang="scss">
.f-base-radio-group {
  display: flex;
  gap: 16px;
}

.f-radio-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #cccccc;
  transition: color 0.15s;

  &:hover:not(.is-disabled) {
    color: #ffffff;
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input[type='radio'] {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: #4a9eff;

    &:disabled {
      cursor: not-allowed;
    }
  }
}

.f-radio-label {
  user-select: none;
}
</style>
