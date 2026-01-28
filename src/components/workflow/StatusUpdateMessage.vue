<template>
  <div class="f-status-update-message">
    <!-- 标题（带阶段图标） -->
    <div class="f-status-title">
      <span class="f-phase-icon">{{ phaseIcon }}</span>
      <span class="f-phase-title">{{ statusData.title }}</span>
    </div>

    <!-- 消息内容（Markdown 渲染） -->
    <div class="f-status-content f-markdown-content markdown-body" v-html="renderedMessage"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

interface StatusData {
  phase: 'discovery' | 'planning' | 'execution' | 'summary'
  title: string
  message: string
}

interface Props {
  /** 状态更新 JSON 字符串 */
  statusJson: string
}

const props = defineProps<Props>()

// 解析状态数据
const statusData = computed<StatusData>(() => {
  try {
    const parsed = JSON.parse(props.statusJson)
    return {
      phase: parsed.phase || 'discovery',
      title: parsed.title || '',
      message: parsed.message || ''
    }
  } catch (error) {
    console.error('[StatusUpdateMessage] 解析状态更新失败:', error)
    return {
      phase: 'discovery',
      title: '状态更新',
      message: ''
    }
  }
})

// 根据阶段获取图标
const phaseIcon = computed(() => {
  const icons: Record<string, string> = {
    discovery: '🔍',
    planning: '📋',
    execution: '⚙️',
    summary: '🧾'
  }
  return icons[statusData.value.phase] || '📌'
})

// 渲染 Markdown 内容
const renderedMessage = computed(() => {
  if (!statusData.value.message) return ''
  return renderMarkdown(statusData.value.message)
})
</script>

<script lang="ts">
export default {
  name: 'StatusUpdateMessage'
}
</script>

<style scoped lang="scss">
.f-status-update-message {
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: text;
  user-select: text;
}

.f-status-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #e5e5e5;
}

.f-phase-icon {
  font-size: 20px;
  line-height: 1;
}

.f-phase-title {
  flex: 1;
}

.f-status-content {
  font-size: 13px;
  line-height: 1.6;
  color: #cccccc;
  word-wrap: break-word;
  white-space: pre-wrap;
}
</style>
