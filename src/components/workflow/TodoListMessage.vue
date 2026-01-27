<template>
  <div class="f-todo-list-message">
    <!-- 标题 -->
    <div class="f-todo-title">Update Todos</div>

    <!-- 待办事项列表 -->
    <div class="f-todo-list">
      <div v-for="(todo, index) in todos" :key="index" class="f-todo-item" :class="{ 'f-todo-item--completed': todo.status === 'completed' }">
        <!-- 状态图标 -->
        <span
          class="f-todo-checkbox"
          :class="{
            'f-checkbox-empty': todo.status === 'pending',
            'f-checkbox-progress': todo.status === 'in_progress',
            'f-checkbox-completed': todo.status === 'completed'
          }"
        ></span>

        <!-- 任务内容 -->
        <span class="f-todo-content">
          {{ getDisplayContent(todo) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItem } from '@/types/websocket'

interface Props {
  /** 待办事项列表 JSON 字符串 */
  todosJson: string
}

const props = defineProps<Props>()

// 解析待办事项列表
const todos = computed<TodoItem[]>(() => {
  try {
    const parsed = JSON.parse(props.todosJson)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('[TodoListMessage] 解析待办事项失败:', error)
    return []
  }
})

// 获取待办项的展示内容
function getDisplayContent(todo: TodoItem): string {
  // pending: 显示 content（任务已创建但未执行到）
  // in_progress: 显示 activeForm（任务执行中）
  // completed: 显示 content（任务已完成）
  if (todo.status === 'in_progress') {
    return todo.activeForm
  }
  return todo.content
}
</script>

<script lang="ts">
import { computed } from 'vue'

export default {
  name: 'TodoListMessage'
}
</script>

<style scoped lang="scss">
.f-todo-list-message {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;
}

.f-todo-title {
  font-size: 14px;
  font-weight: 600;
  color: #e5e5e5;
  margin-bottom: 6px;
}

.f-todo-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.f-todo-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 20px;
  color: #e5e5e5;

  &--completed {
    color: #6b7280;

    .f-todo-content {
      text-decoration: line-through;
    }
  }
}

.f-todo-checkbox {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(49, 49, 49);
  border-radius: 2px;
  margin-top: 2px;
  font-size: 11px;
  line-height: 1;
}

.f-checkbox-empty {
  // 空方框，不显示任何内容
}

.f-checkbox-progress {
  color: #e5e5e5;

  &::before {
    content: '※';
  }
}

.f-checkbox-completed {
  color: #6b7280;

  &::before {
    content: '✓';
  }
}

.f-todo-content {
  flex: 1;
  word-break: break-word;
}
</style>
