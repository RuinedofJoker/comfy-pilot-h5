<template>
  <BaseCard :hoverable="true" class="f-workflow-card" @click="handleClick">
    <div class="f-workflow-card__header">
      <h3 class="f-workflow-card__name">{{ workflow.workflowName }}</h3>
      <div class="f-workflow-card__actions">
        <button
          class="f-workflow-card__action-btn"
          @click.stop="handleEdit"
          title="编辑"
        >
          <BaseIcon name="edit" :size="16" />
        </button>
        <button
          class="f-workflow-card__action-btn"
          @click.stop="handleDelete"
          title="删除"
        >
          <BaseIcon name="delete" :size="16" />
        </button>
      </div>
    </div>

    <p v-if="workflow.description" class="f-workflow-card__description">
      {{ workflow.description }}
    </p>

    <div class="f-workflow-card__footer">
      <div class="f-workflow-card__info">
        <span class="f-workflow-card__info-item">
          <BaseIcon name="clock" :size="14" />
          {{ formatRelativeTime(workflow.updateTime) }}
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/base/BaseCard.vue'
import BaseIcon from '@/components/base/BaseIcon.vue'
import { formatRelativeTime } from '@/utils/format'
import type { Workflow } from '@/types/workflow'

interface Props {
  workflow: Workflow
}

const props = defineProps<Props>()

const emit = defineEmits<{
  open: [workflow: Workflow]
  edit: [workflow: Workflow]
  delete: [workflow: Workflow]
}>()

function handleClick(): void {
  emit('open', props.workflow)
}

function handleEdit(): void {
  emit('edit', props.workflow)
}

function handleDelete(): void {
  emit('delete', props.workflow)
}
</script>

<style scoped lang="scss">
.f-workflow-card {
  cursor: pointer;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  &__name {
    flex: 1;
    font-size: 18px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .f-workflow-card:hover & {
      opacity: 1;
    }
  }

  &__action-btn {
    width: 28px;
    height: 28px;
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

  &__description {
    font-size: 14px;
    color: #999999;
    line-height: 1.6;
    margin: 0 0 16px 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
