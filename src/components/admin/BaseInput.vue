<template>
  <input
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    class="f-input"
    @input="handleInput"
  />
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

withDefaults(defineProps<Props>(), {
  type: 'text'
})

const emit = defineEmits<Emits>()

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.f-input {
  width: 100%;
  padding: 8px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  font-size: 13px;
  color: #cccccc;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: #666666;
  }

  &:focus {
    border-color: #555555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
