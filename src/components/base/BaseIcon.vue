<template>
  <svg :class="iconClasses" :style="iconStyle" aria-hidden="true">
    <use :href="`#icon-${name}`" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  name: string
  size?: number | string
  color?: string
}

const props = defineProps<Props>()

const iconClasses = computed(() => ['f-base-icon'])

const iconStyle = computed(() => ({
  width: typeof props.size === 'number' ? `${props.size}px` : props.size,
  height: typeof props.size === 'number' ? `${props.size}px` : props.size,
  fill: props.color
}))
</script>

<style scoped lang="scss">
.f-base-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;
}
</style>
