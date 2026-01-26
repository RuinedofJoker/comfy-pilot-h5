<template>
  <div v-if="visible && filteredCommands.length > 0" class="f-command-suggestion">
    <div
      v-for="(command, index) in filteredCommands"
      :key="command.name"
      class="f-command-item"
      :class="{ 'is-selected': index === selectedIndex }"
      @mouseenter="selectedIndex = index"
      @click="handleSelect(command)"
    >
      <div class="f-command-name">{{ command.name }}</div>
      <div class="f-command-desc">{{ command.description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 命令定义接口
interface Command {
  name: string
  description: string
}

// Props
interface Props {
  visible: boolean
  inputValue: string
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'select': [command: Command]
}>()

// 可用命令列表
const availableCommands: Command[] = [
  { name: '/help', description: '显示帮助信息' },
  { name: '/clear', description: '清空对话历史' },
  { name: '/compact', description: '压缩会话' }
]

// 当前选中的索引
const selectedIndex = ref(0)

// 过滤后的命令列表
const filteredCommands = computed(() => {
  // 移除所有空白字符（包括换行符、空格等），只保留实际内容
  const input = props.inputValue.replace(/\s/g, '').toLowerCase()

  // 如果不是以 / 开头，不显示
  if (!input.startsWith('/')) {
    return []
  }

  // 如果只输入了 /，显示所有命令
  if (input === '/') {
    return availableCommands
  }

  // 如果输入完全匹配某个命令，不显示提示框
  const exactMatch = availableCommands.some(cmd =>
    cmd.name.toLowerCase() === input
  )
  if (exactMatch) {
    return []
  }

  // 根据输入过滤命令
  return availableCommands.filter(cmd =>
    cmd.name.toLowerCase().startsWith(input)
  )
})

// 监听过滤结果变化，重置选中索引
watch(() => filteredCommands.value.length, () => {
  selectedIndex.value = 0
})

// 处理上下箭头导航
function handleArrowKey(direction: 'up' | 'down'): void {
  if (filteredCommands.value.length === 0) return

  if (direction === 'up') {
    selectedIndex.value = selectedIndex.value > 0
      ? selectedIndex.value - 1
      : filteredCommands.value.length - 1
  } else {
    selectedIndex.value = selectedIndex.value < filteredCommands.value.length - 1
      ? selectedIndex.value + 1
      : 0
  }
}

// 处理回车选中
function handleEnter(): void {
  if (filteredCommands.value.length === 0) return

  const selected = filteredCommands.value[selectedIndex.value]
  if (selected) {
    handleSelect(selected)
  }
}

// 处理命令选中
function handleSelect(command: Command): void {
  emit('select', command)
}

// 检查是否有可用命令
function hasCommands(): boolean {
  return filteredCommands.value.length > 0
}

// 暴露方法和属性给父组件
defineExpose({
  handleArrowKey,
  handleEnter,
  hasCommands
})
</script>

<style scoped lang="scss">
.f-command-suggestion {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  max-height: 300px;
  overflow-y: auto;
}

.f-command-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #333333;

  &:last-child {
    border-bottom: none;
  }

  &:hover,
  &.is-selected {
    background: #3a3a3a;
  }
}

.f-command-name {
  font-size: 13px;
  font-weight: 500;
  color: #cccccc;
  margin-bottom: 2px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.f-command-desc {
  font-size: 11px;
  color: #999999;
  line-height: 1.4;
}
</style>
