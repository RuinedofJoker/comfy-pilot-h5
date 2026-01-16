<template>
  <div class="f-form-group">
    <label v-if="label" class="f-form-group__label">
      {{ label }}
      <span v-if="required" class="f-form-group__required">*</span>
    </label>
    <slot></slot>
    <div v-if="hint" class="f-form-group__hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  hint?: string
  required?: boolean
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.f-form-group {
  margin-bottom: 12px;
}

.f-form-group__label {
  display: block;
  font-size: 12px;
  color: #cccccc;
  margin-bottom: 4px;
}

.f-form-group__required {
  color: #e74c3c;
  margin-left: 2px;
}

.f-form-group__hint {
  font-size: 11px;
  color: #777777;
  margin-top: 3px;
}
</style>
