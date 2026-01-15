<script setup lang="ts">
interface Props {
  title: string
  description?: string
}

defineProps<Props>()
</script>

<template>
  <div class="base-card">
    <h3 class="f-card-title">{{ title }}</h3>
    <p v-if="description" class="f-card-desc">{{ description }}</p>
    <div class="f-card-content">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-card {
  padding: 16px;
  background: #fff;
  border-radius: 8px;

  .f-card-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
  }

  .f-card-desc {
    margin-top: 8px;
    font-size: 14px;
    color: #999;
  }

  .f-card-content {
    margin-top: 12px;
  }
}
</style>
