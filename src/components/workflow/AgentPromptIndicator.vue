<template>
  <div v-if="visible" class="f-agent-prompt-indicator">
    <span class="f-prompt-icon">*</span>
    <span class="f-prompt-text">
      <span v-for="(char, index) in displayText" :key="index" class="f-prompt-char" :style="{ animationDelay: `${index * 0.1}s` }">
        {{ char }}
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  text: string
}

const props = defineProps<Props>()

// 将文本拆分为字符数组用于动画
const displayText = computed(() => {
  return props.text.split('')
})
</script>

<style scoped lang="scss">
.f-agent-prompt-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin: 8px 0;
  background: rgba(74, 158, 255, 0.1);
  border-left: 2px solid #4a9eff;
  border-radius: 4px;
  font-size: 13px;
  color: #4a9eff;
}

.f-prompt-icon {
  font-size: 16px;
  font-weight: bold;
  animation: pulse 1.5s ease-in-out infinite;
}

.f-prompt-text {
  display: flex;
}

.f-prompt-char {
  display: inline-block;
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
