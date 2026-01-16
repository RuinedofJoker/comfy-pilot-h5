<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="f-base-card__header">
      <slot name="header">
        <h3 class="f-base-card__title">{{ title }}</h3>
      </slot>
    </div>
    <div class="f-base-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="f-base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  hoverable?: boolean
  bordered?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  bordered: true
})

const cardClasses = computed(() => [
  'f-base-card',
  {
    'f-base-card--hoverable': props.hoverable,
    'f-base-card--bordered': props.bordered
  }
])
</script>

<style scoped lang="scss">
.f-base-card {
  background: #353535;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;

  &--bordered {
    border: 1px solid #444444;
  }

  &--hoverable {
    cursor: pointer;

    &:hover {
      border-color: #4a9eff;
      background: #3a3a3a;
    }
  }

  &__header {
    padding: 20px;
    border-bottom: 1px solid #444444;
  }

  &__title {
    font-size: 16px;
    color: #ffffff;
    font-weight: 500;
  }

  &__body {
    padding: 20px;
  }

  &__footer {
    padding: 16px 20px;
    border-top: 1px solid #444444;
  }
}
</style>
