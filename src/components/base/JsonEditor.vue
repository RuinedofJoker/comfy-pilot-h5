<template>
  <div ref="editorContainer" class="json-editor"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

// Props 定义
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  height?: string
  schema?: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '',
  disabled: false,
  height: '200px',
  schema: undefined
})

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'blur': []
}>()

// 状态
const editorContainer = ref<HTMLDivElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

/**
 * 初始化编辑器
 */
onMounted(() => {
  if (!editorContainer.value) return

  // 创建 Monaco Editor 实例
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || '',
    language: 'json',
    theme: 'vs-dark',
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    readOnly: props.disabled,
    tabSize: 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    autoClosingBrackets: 'always',
    autoClosingQuotes: 'always',
    autoIndent: 'full',
    quickSuggestions: {
      other: 'on',
      comments: 'off',
      strings: 'on'
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    wordBasedSuggestions: 'off',
    // 关键：设置触发字符
    suggest: {
      showWords: false,
      showSnippets: false
    }
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
    emit('change', value)
  })

  // 监听失焦事件
  editor.onDidBlurEditorText(() => {
    emit('blur')
  })

  // 如果有 schema，注册自动补全
  if (props.schema) {
    registerJsonCompletion(props.schema)
  }
})

/**
 * 注册 JSON 自动补全
 */
const registerJsonCompletion = (schema: Record<string, any>) => {
  // 直接使用 schema 对象
  let schemaObj: Record<string, any> = {}

  if (typeof schema === 'string') {
    try {
      schemaObj = JSON.parse(schema)
    } catch (e) {
      console.warn('无法解析 schema:', e)
      return
    }
  } else {
    schemaObj = schema
  }

  // 提取所有的 key
  const schemaKeys = Object.keys(schemaObj)

  // 注册自动补全提供者
  monaco.languages.registerCompletionItemProvider('json', {
    triggerCharacters: ['"', ' ', '\n'], // 触发字符
    provideCompletionItems: (model, position) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      // 检查是否在对象内部
      const inObject = isInsideObject(textUntilPosition)
      if (!inObject) {
        return { suggestions: [] }
      }

      // 获取当前行和光标前的文本
      const currentLine = model.getLineContent(position.lineNumber)
      const textBeforeCursor = currentLine.substring(0, position.column - 1)

      // 检查是否在输入 key（在引号内）
      const inQuotes = (textBeforeCursor.match(/"/g) || []).length % 2 === 1

      // 生成建议
      const suggestions: monaco.languages.CompletionItem[] = schemaKeys.map(key => {
        const value = schemaObj[key]
        const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value)

        // 如果在引号内，只插入 key 名称
        const insertText = inQuotes ? key : `"${key}": ${valueStr}`

        return {
          label: key,
          kind: monaco.languages.CompletionItemKind.Property,
          insertText: insertText,
          detail: typeof value === 'string' ? value : JSON.stringify(value),
          documentation: `建议值: ${valueStr}`,
          sortText: `0${key}`,
          filterText: key, // 用于过滤匹配
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          }
        }
      })

      return { suggestions }
    }
  })
}

/**
 * 检查光标是否在对象内部
 */
const isInsideObject = (text: string): boolean => {
  let braceCount = 0
  let inString = false
  let escapeNext = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (escapeNext) {
      escapeNext = false
      continue
    }

    if (char === '\\') {
      escapeNext = true
      continue
    }

    if (char === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (char === '{') {
      braceCount++
    } else if (char === '}') {
      braceCount--
    }
  }

  return braceCount > 0
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.getValue() !== newValue) {
      editor.setValue(newValue || '')
    }
  }
)

/**
 * 监听 disabled 变化
 */
watch(
  () => props.disabled,
  (newValue) => {
    if (editor) {
      editor.updateOptions({ readOnly: newValue })
    }
  }
)

/**
 * 监听 schema 变化
 */
watch(
  () => props.schema,
  (newSchema) => {
    if (newSchema) {
      registerJsonCompletion(newSchema)
    }
  }
)

/**
 * 清理编辑器
 */
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

/**
 * 格式化 JSON
 */
const formatJson = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument')?.run()
  }
}

/**
 * 验证 JSON
 */
const validateJson = (): { valid: boolean; error?: string } => {
  const value = editor?.getValue() || ''
  if (!value.trim()) {
    return { valid: true }
  }

  try {
    JSON.parse(value)
    return { valid: true }
  } catch (e: any) {
    return { valid: false, error: e.message }
  }
}

// 暴露方法给父组件
defineExpose({
  formatJson,
  validateJson
})
</script>

<style scoped lang="scss">
.json-editor {
  width: 100%;
  height: v-bind(height);
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  overflow: hidden;

  &:focus-within {
    border-color: #4a9eff;
  }

  :deep(.monaco-editor) {
    .margin {
      background-color: #1a1a1a;
    }

    .monaco-editor-background {
      background-color: #1a1a1a;
    }
  }
}
</style>
