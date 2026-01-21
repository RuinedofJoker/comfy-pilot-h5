<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as monaco from 'monaco-editor'

// Props
interface Props {
  modelValue: string
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validate': [isValid: boolean, errors: string[]]
}>()

// Refs
const editorContainer = ref<HTMLDivElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// 初始化编辑器
onMounted(() => {
  if (!editorContainer.value) return

  // 创建编辑器实例
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'json',
    theme: 'vs-dark',
    automaticLayout: true,
    readOnly: props.readonly,
    minimap: {
      enabled: true
    },
    scrollBeyondLastLine: false,
    fontSize: 13,
    lineNumbers: 'on',
    renderWhitespace: 'selection',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    folding: true,
    foldingStrategy: 'indentation',
    showFoldingControls: 'always',
    formatOnPaste: true,
    formatOnType: true
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      emit('update:modelValue', value)
      validateJson(value)
    }
  })

  // 初始验证
  validateJson(props.modelValue)
})

// 验证 JSON
function validateJson(value: string): void {
  if (!value.trim()) {
    emit('validate', true, [])
    return
  }

  try {
    JSON.parse(value)
    emit('validate', true, [])
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'JSON 格式错误'
    emit('validate', false, [errorMessage])
  }
}

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

// 监听只读状态变化
watch(() => props.readonly, (newReadonly) => {
  if (editor) {
    editor.updateOptions({ readOnly: newReadonly })
  }
})

// 格式化 JSON
function formatJson(): void {
  if (editor) {
    editor.getAction('editor.action.formatDocument')?.run()
  }
}

// 暴露方法给父组件
defineExpose({
  formatJson
})

// 清理
onUnmounted(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})
</script>

<style scoped lang="scss">
.monaco-editor-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
