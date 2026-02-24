<template>
  <div class="f-token-usage-indicator" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
    <!-- SVG 圆形进度指示器 -->
    <svg class="f-progress-ring" :width="size" :height="size" viewBox="0 0 36 36">
      <!-- 背景圆环 -->
      <circle
        class="f-progress-ring-bg"
        cx="18"
        cy="18"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
      />
      <!-- 进度圆环 - 只有当有数据时才显示 -->
      <circle
        v-if="hasData"
        class="f-progress-ring-progress"
        cx="18"
        cy="18"
        :r="radius"
        fill="none"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        :class="progressColorClass"
      />
    </svg>
    <!-- 百分比文字或问号 -->
    <span class="f-usage-text">{{ displayText }}</span>

    <!-- 悬浮提示框 -->
    <div v-if="showTooltip && hasData" class="f-token-tooltip">
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Input Tokens:</span>
        <span class="f-tooltip-value">{{ tokenStats?.inputTokens ?? 0 }}</span>
      </div>
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Output Tokens:</span>
        <span class="f-tooltip-value">{{ tokenStats?.outputTokens ?? 0 }}</span>
      </div>
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Total Tokens:</span>
        <span class="f-tooltip-value">{{ tokenStats?.totalTokens ?? 0 }}</span>
      </div>
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Max Tokens:</span>
        <span class="f-tooltip-value">{{ tokenStats?.maxTokens ?? 0 }}</span>
      </div>
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Message Count:</span>
        <span class="f-tooltip-value">{{ tokenStats?.messageCount ?? 0 }}</span>
      </div>
      <div class="f-tooltip-item">
        <span class="f-tooltip-label">Max Messages:</span>
        <span class="f-tooltip-value">{{ tokenStats?.maxMessages ?? 0 }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  percentage: number  // 使用率百分比 0-100
  size?: number      // 组件大小，默认 20
  tokenStats?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
    maxTokens?: number
    messageCount?: number
    maxMessages?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  size: 20
})

// 悬浮提示框显示状态
const showTooltip = ref(false)

// 圆环参数
const strokeWidth = 3
const radius = 15 // (36 - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

// 计算进度偏移量
const strokeDashoffset = computed(() => {
  const progress = Math.min(Math.max(props.percentage, 0), 100)
  return circumference - (progress / 100) * circumference
})

// 根据百分比返回颜色类
const progressColorClass = computed(() => {
  if (props.percentage >= 90) return 'f-progress-danger'
  if (props.percentage >= 70) return 'f-progress-warning'
  return 'f-progress-normal'
})

// 检查是否有数据（-1 表示没有数据）
const hasData = computed(() => props.percentage >= 0)

// 显示文本：有数据显示百分比，无数据显示问号+百分号
const displayText = computed(() => {
  return hasData.value ? `${props.percentage}%` : '?%'
})
</script>

<style scoped lang="scss">
.f-token-usage-indicator {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
}

.f-progress-ring {
  transform: rotate(-90deg); // 从顶部开始
  flex-shrink: 0;
}

.f-progress-ring-bg {
  stroke: rgba(255, 255, 255, 0.1);
}

.f-progress-ring-progress {
  transition: stroke-dashoffset 0.3s ease;

  &.f-progress-normal {
    stroke: #4ade80; // 绿色 - 正常
  }

  &.f-progress-warning {
    stroke: #fbbf24; // 黄色 - 警告
  }

  &.f-progress-danger {
    stroke: #ef4444; // 红色 - 危险
  }
}

.f-usage-text {
  font-size: 11px;
  color: #999999;
  line-height: 1;
  white-space: nowrap;
}

// 悬浮提示框
.f-token-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: rgb(24, 24, 24);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  // 小三角箭头
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgb(24, 24, 24);
  }
}

.f-tooltip-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 2px 0;
  color: #cccccc;

  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.f-tooltip-label {
  color: #999999;
}

.f-tooltip-value {
  color: #ffffff;
  font-weight: 500;
}
</style>
