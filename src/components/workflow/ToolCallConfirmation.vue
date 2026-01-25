<template>
  <div v-if="visible" class="f-tool-confirmation">
    <div class="f-tool-header">
      <span class="f-tool-icon">🔧</span>
      <span class="f-tool-title">工具调用请求</span>
    </div>

    <div class="f-tool-info">
      <div class="f-tool-name">
        <span class="f-label">工具名称:</span>
        <span class="f-value">{{ toolName }}</span>
      </div>

      <div v-if="formattedArgs" class="f-tool-args">
        <div class="f-label">参数:</div>
        <pre class="f-args-content">{{ formattedArgs }}</pre>
      </div>
    </div>

    <div class="f-tool-actions">
      <button class="f-btn f-btn-reject" @click="$emit('reject')">
        拒绝
      </button>
      <button class="f-btn f-btn-approve" @click="$emit('approve')">
        允许执行
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  toolName: string
  toolArgs: any
}

const props = defineProps<Props>()

defineEmits<{
  approve: []
  reject: []
}>()

// 格式化参数显示
const formattedArgs = computed(() => {
  if (!props.toolArgs) return ''
  try {
    return JSON.stringify(props.toolArgs, null, 2)
  } catch {
    return String(props.toolArgs)
  }
})
</script>

<style scoped lang="scss">
.f-tool-confirmation {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  margin: 8px 0;
  background: rgba(217, 119, 6, 0.1);
  border-left: 3px solid #d97706;
  border-radius: 4px;
  font-size: 13px;
}

.f-tool-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d97706;
  font-weight: 600;
}

.f-tool-icon {
  font-size: 16px;
}

.f-tool-title {
  font-size: 14px;
}

.f-tool-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #cccccc;
}

.f-tool-name {
  display: flex;
  gap: 8px;
  align-items: center;
}

.f-label {
  color: #999999;
  font-size: 12px;
}

.f-value {
  color: #ffffff;
  font-weight: 500;
}

.f-tool-args {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.f-args-content {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px;
  border-radius: 4px;
  color: #cccccc;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
  margin: 0;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3a3a;
    border-radius: 3px;

    &:hover {
      background: #4a4a4a;
    }
  }
}

.f-tool-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.f-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
}

.f-btn-reject {
  background: #3a3a3a;
  color: #cccccc;

  &:hover {
    background: #4a4a4a;
  }
}

.f-btn-approve {
  background: #d97706;
  color: #ffffff;

  &:hover {
    background: #ea580c;
  }
}
</style>
