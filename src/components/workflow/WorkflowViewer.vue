<template>
  <div class="f-comfyui-container">
    <!-- 视图切换按钮 -->
    <div
      class="f-view-toggle"
      :class="{ dragging: isDraggingViewToggle }"
      :style="{
        left: `calc(50% + ${viewTogglePosition.x}px)`,
        top: `${viewTogglePosition.y}px`
      }"
    >
      <div
        class="f-drag-handle"
        @mousedown="$emit('view-toggle-mousedown', $event)"
        title="拖动以移动位置"
      >
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </div>
      <button
        class="f-view-btn"
        :class="{ active: currentView === 'comfyui' }"
        @click="$emit('switch-view', 'comfyui')"
      >
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
        </svg>
        <span>ComfyUI 视图</span>
      </button>
      <button
        class="f-view-btn"
        :class="{ active: currentView === 'json' }"
        @click="$emit('switch-view', 'json')"
      >
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
        </svg>
        <span>JSON 原型</span>
      </button>
    </div>

    <!-- ComfyUI 视图 -->
    <div v-show="currentView === 'comfyui'" class="f-comfyui-view">
      <iframe
        ref="comfyuiFrame"
        class="f-comfyui-iframe"
        :src="comfyuiUrl"
      ></iframe>
    </div>

    <!-- JSON 视图 -->
    <div v-show="currentView === 'json'" class="f-json-view">
      <div class="f-json-header">
        <div class="f-json-title">
          <span>工作流 JSON 原型</span>
          <span class="f-json-hint">（可编辑，切换回 ComfyUI 视图时生效）</span>
        </div>
        <div class="f-json-actions">
          <button class="f-json-copy-btn" @click="$emit('copy-json')">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>复制</span>
          </button>
          <button class="f-json-format-btn" @click="$emit('format-json')">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
            </svg>
            <span>格式化</span>
          </button>
        </div>
      </div>
      <div v-if="jsonEditError" class="f-json-error">
        <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
        </svg>
        <span>{{ jsonEditError }}</span>
      </div>
      <MonacoJsonEditor
        ref="monacoEditor"
        v-model="localJsonContent"
        @validate="handleJsonValidate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import MonacoJsonEditor from './MonacoJsonEditor.vue'

// Props
interface Props {
  comfyuiUrl: string
  currentView: 'comfyui' | 'json'
  editableJsonContent: string
  jsonEditError: string
  viewTogglePosition: { x: number; y: number }
  isDraggingViewToggle: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'switch-view': [view: 'comfyui' | 'json']
  'copy-json': []
  'format-json': []
  'update:editableJsonContent': [value: string]
  'validate-json': [isValid: boolean, errors: string[]]
  'view-toggle-mousedown': [event: MouseEvent]
}>()

// Refs
const comfyuiFrame = ref<HTMLIFrameElement | null>(null)
const monacoEditor = ref<InstanceType<typeof MonacoJsonEditor> | null>(null)

// 本地 JSON 内容（用于 v-model 绑定）
const localJsonContent = ref(props.editableJsonContent)

// 监听 props 变化，同步到本地
watch(() => props.editableJsonContent, (newValue) => {
  if (localJsonContent.value !== newValue) {
    localJsonContent.value = newValue
  }
})

// 监听本地变化，同步到父组件
watch(localJsonContent, (newValue) => {
  emit('update:editableJsonContent', newValue)
})

// 处理 JSON 验证
function handleJsonValidate(isValid: boolean, errors: string[]): void {
  emit('validate-json', isValid, errors)
}

// 暴露给父组件
defineExpose({
  comfyuiFrame,
  monacoEditor
})
</script>

<style scoped lang="scss">
// ComfyUI 容器
.f-comfyui-container {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #252525;

  &.locked::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 10;
    pointer-events: none;
  }
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
  flex-shrink: 0;

  &-xl {
    width: 48px;
    height: 48px;
  }
}

// 视图切换
.f-view-toggle {
  position: absolute;
  transform: translateX(-50%);
  z-index: 30;
  display: flex;
  gap: 0;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  padding: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.2s;

  &.dragging {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
    cursor: move;
  }
}

.f-drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  cursor: move;
  color: #777777;
  border-right: 1px solid #3a3a3a;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    color: #cccccc;
    background: #333333;
  }

  &:active {
    color: #ffffff;
    background: #3a3a3a;
  }

  .f-icon {
    width: 14px;
    height: 14px;
  }
}

.f-view-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  color: #999999;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: #cccccc;
    background: #333333;
  }

  &.active {
    background: #3a3a3a;
    color: #ffffff;
    border: 1px solid #4a4a4a;
  }
}

// ComfyUI 视图
.f-comfyui-view {
  width: 100%;
  height: 100%;
  position: relative;
}

.f-comfyui-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

// JSON 视图
.f-json-view {
  width: 100%;
  height: 100%;
  background: #1e1e1e;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.f-json-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  background: #242424;
  flex-shrink: 0;
}

.f-json-title {
  font-size: 14px;
  color: #cccccc;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.f-json-hint {
  font-size: 12px;
  color: #777777;
  font-weight: 400;
}

.f-json-actions {
  display: flex;
  gap: 8px;
}

.f-json-copy-btn,
.f-json-format-btn {
  padding: 6px 12px;
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #cccccc;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #333333;
    border-color: #4a4a4a;
  }

  &:active {
    background: #3a3a3a;
  }
}

.f-json-error {
  padding: 12px 20px;
  background: rgba(231, 76, 60, 0.1);
  border-bottom: 1px solid rgba(231, 76, 60, 0.3);
  color: #e74c3c;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;

  .f-icon {
    flex-shrink: 0;
  }
}

// Monaco Editor 容器样式
:deep(.monaco-editor-container) {
  flex: 1;
  min-height: 0;
}

// 锁定遮罩
.f-lock-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(231, 76, 60, 0.95);
  color: white;
  padding: 40px 60px;
  border-radius: 12px;
  text-align: center;
  z-index: 20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
  animation: fadeIn 0.3s;
}

.f-lock-icon {
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.f-lock-text {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.f-lock-hint {
  font-size: 13px;
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>
