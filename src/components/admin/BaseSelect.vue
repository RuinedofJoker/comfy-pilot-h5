<template>
  <select
    :value="modelValue"
    class="f-base-select"
    :disabled="disabled"
    @change="handleChange"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string | number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
.f-base-select {
  width: 100%;
  padding: 8px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  font-size: 13px;
  color: #cccccc;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;

  &:focus {
    border-color: #555555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: #1e1e1e;
    color: #cccccc;
  }
}
</style>
