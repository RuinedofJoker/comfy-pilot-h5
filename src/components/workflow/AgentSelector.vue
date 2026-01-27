<template>
  <button
    v-if="currentAgentName"
    class="f-agent-selector"
    @click="handleClick"
    :title="currentAgentName"
  >
    <span class="f-agent-name">{{ currentAgentName }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserAgentConfigStore } from '@/stores/userAgentConfig'

// Store
const userAgentConfigStore = useUserAgentConfigStore()

// 计算属性：当前 Agent 名称
const currentAgentName = computed(() => {
  return userAgentConfigStore.currentAgent?.agentName || ''
})

// 处理点击
function handleClick(): void {
  userAgentConfigStore.selectNextAgent()
}
</script>

<style scoped lang="scss">
.f-agent-selector {
  display: flex;
  align-items: center;
  padding: 4px 10px;
  background: transparent;
  border: none;
  color: #999999;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #cccccc;
  }

  .f-agent-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
