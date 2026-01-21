<template>
  <div class="m-session-sidebar">
    <div class="f-session-header">
      <h2 class="f-session-title">
        <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
        <span>Agent 会话</span>
      </h2>
      <button class="f-new-session-btn" @click="$emit('create-session')">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <span>新建会话</span>
      </button>
    </div>

    <div class="f-session-list">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="f-session-item"
        :class="{ active: currentSessionCode === session.sessionCode }"
        @click="$emit('select-session', session.sessionCode)"
      >
        <div class="f-session-header">
          <span class="f-status-dot" :class="{ idle: session.status !== 'ACTIVE' }"></span>
          <span class="f-session-name">{{ session.title || '未命名会话' }}</span>
        </div>
        <div class="f-session-meta">
          <div class="f-meta-row">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <span>{{ formatTime(session.updateTime) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="f-session-footer">
      <button class="f-back-btn" @click="$emit('go-back')">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        <span>返回服务选择</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChatSession } from '@/types/session'

// Props
interface Props {
  sessions: ChatSession[]
  currentSessionCode: string | null
}

defineProps<Props>()

// Emits
defineEmits<{
  'create-session': []
  'select-session': [sessionCode: string]
  'go-back': []
}>()

// 格式化时间
function formatTime(time: string): string {
  const now = new Date()
  const target = new Date(time)
  const diff = now.getTime() - target.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return target.toLocaleDateString()
}
</script>

<style scoped lang="scss">
// 左侧会话管理区域
.m-session-sidebar {
  width: 280px;
  background: #282828;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #3a3a3a;
  z-index: 100;
}

.f-session-header {
  padding: 12px;
  border-bottom: 1px solid #3a3a3a;
  background: #242424;
}

.f-session-title {
  font-size: 13px;
  margin-bottom: 10px;
  color: #999999;
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.f-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;

  &-lg {
    width: 20px;
    height: 20px;
  }
}

.f-new-session-btn {
  width: 100%;
  padding: 6px 10px;
  background: #3a3a3a;
  border: 1px solid #4a4a4a;
  color: #cccccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 400;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #454545;
    border-color: #555555;
    color: #ffffff;
  }
}

.f-session-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.f-session-item {
  padding: 10px;
  margin-bottom: 4px;
  background: #2a2a2a;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;

  &:hover {
    background: #333333;
    border-color: #3a3a3a;
  }

  &.active {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }
}

.f-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #27ae60;
  flex-shrink: 0;

  &.idle {
    background: #999999;
  }
}

.f-session-name {
  flex: 1;
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #cccccc;
}

.f-session-item.active .f-session-name {
  color: #ffffff;
}

.f-session-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 11px;
  color: #777777;
}

.f-meta-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.f-session-footer {
  padding: 12px;
  border-top: 1px solid #444444;
}

.f-back-btn {
  width: 100%;
  padding: 8px 12px;
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}
</style>
