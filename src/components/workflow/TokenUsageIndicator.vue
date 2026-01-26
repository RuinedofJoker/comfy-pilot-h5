<template>
  <div class="f-token-usage-indicator">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  percentage: number  // 使用率百分比 0-100
  size?: number      // 组件大小，默认 20
}

const props = withDefaults(defineProps<Props>(), {
  size: 20
})

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

// 检查是否有数据
const hasData = computed(() => props.percentage > 0)

// 显示文本：有数据显示百分比，无数据显示问号+百分号
const displayText = computed(() => {
  return hasData.value ? `${props.percentage}%` : '?%'
})
</script>

<style scoped lang="scss">
.f-token-usage-indicator {
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
</style>
