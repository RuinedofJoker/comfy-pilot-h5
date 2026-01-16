<template>
  <BaseCard :hoverable="true" class="f-service-card" @click="handleClick">
    <div class="f-service-card__header">
      <div class="f-service-card__status" :class="statusClass">
        <span class="f-service-card__status-dot"></span>
        <span class="f-service-card__status-text">{{ statusText }}</span>
      </div>
    </div>

    <div class="f-service-card__body">
      <h3 class="f-service-card__name">{{ service.serverName }}</h3>
      <p class="f-service-card__url">{{ service.baseUrl }}</p>
      <p v-if="service.description" class="f-service-card__description">
        {{ service.description }}
      </p>
    </div>

    <div class="f-service-card__footer">
      <div class="f-service-card__info">
        <span class="f-service-card__info-item">
          <BaseIcon name="clock" :size="14" />
          {{ formatRelativeTime(service.updateTime) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/base/BaseCard.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { formatRelativeTime } from '@/utils/format'
import type { ComfyUIService } from '@/types/service'
import { HealthStatusValues } from '@/types/service'

interface Props {
  service: ComfyUIService
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [service: ComfyUIService]
}>()

const statusClass = computed(() => ({
  'f-service-card__status--online': props.service.healthStatus === HealthStatusValues.HEALTHY,
  'f-service-card__status--offline': props.service.healthStatus === HealthStatusValues.UNKNOWN,
  'f-service-card__status--error': props.service.healthStatus === HealthStatusValues.UNHEALTHY
}))

const statusText = computed(() => {
  switch (props.service.healthStatus) {
    case HealthStatusValues.HEALTHY:
      return '健康'
    case HealthStatusValues.UNHEALTHY:
      return '异常'
    case HealthStatusValues.UNKNOWN:
      return '未知'
    default:
      return '未知'
  }
})

function handleClick(): void {
  emit('select', props.service)
}
</script>

<style scoped lang="scss">
.f-service-card {
  cursor: pointer;

  &__header {
    margin-bottom: 16px;
  }

  &__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;

    &--online {
      background: rgba(82, 196, 26, 0.1);
      color: #52c41a;

      .f-service-card__status-dot {
        background: #52c41a;
      }
    }

    &--offline {
      background: rgba(153, 153, 153, 0.1);
      color: #999999;

      .f-service-card__status-dot {
        background: #999999;
      }
    }

    &--error {
      background: rgba(255, 77, 79, 0.1);
      color: #ff4d4f;

      .f-service-card__status-dot {
        background: #ff4d4f;
      }
    }
  }

  &__status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  &__body {
    margin-bottom: 16px;
  }

  &__name {
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0 0 8px 0;
  }

  &__url {
    font-size: 13px;
    color: #4a9eff;
    margin: 0 0 12px 0;
    word-break: break-all;
  }

  &__description {
    font-size: 14px;
    color: #999999;
    line-height: 1.6;
    margin: 0;
  }

  &__footer {
    padding-top: 12px;
    border-top: 1px solid #3a3a3a;
  }

  &__info {
    display: flex;
    gap: 16px;
  }

  &__info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #999999;
  }
}
</style>
