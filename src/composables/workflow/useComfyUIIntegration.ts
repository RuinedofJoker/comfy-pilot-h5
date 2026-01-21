import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from '@/utils/toast'

export function useComfyUIIntegration() {
  // ComfyUI iframe 引用 (需要从外部设置)
  const comfyuiFrame = ref<HTMLIFrameElement | null>(null)

  // 设置 iframe 引用的方法
  function setComfyuiFrame(iframe: HTMLIFrameElement | null): void {
    comfyuiFrame.value = iframe
  }

  // 当前视图状态
  const currentView = ref<'comfyui' | 'json'>('comfyui')

  // JSON 编辑相关状态
  const editableJsonContent = ref('')
  const jsonEditError = ref('')
  const isJsonValid = ref(true)

  // 视图切换按钮位置
  const viewTogglePosition = ref({ x: 0, y: 20 })
  const isDraggingViewToggle = ref(false)
  const dragStartPos = ref({ x: 0, y: 0 })
  const dragStartTogglePos = ref({ x: 0, y: 0 })

  // 切换视图
  async function switchView(view: 'comfyui' | 'json'): Promise<void> {
    const previousView = currentView.value
    currentView.value = view

    if (view === 'json' && previousView === 'comfyui') {
      // 从 ComfyUI 视图切换到 JSON 视图：获取最新内容
      try {
        const content = await fetchWorkflowFromIframe()
        editableJsonContent.value = content
        jsonEditError.value = ''
        isJsonValid.value = true
      } catch (error) {
        console.error('获取工作流内容失败:', error)
        // 失败时保持当前内容
      }
    } else if (view === 'comfyui' && previousView === 'json') {
      // 从 JSON 视图切换回 ComfyUI 视图：应用 JSON 修改
      if (isJsonValid.value && editableJsonContent.value) {
        await applyJsonChangesToComfyUI()
      }
    }
  }

  // 应用 JSON 修改到 ComfyUI
  async function applyJsonChangesToComfyUI(): Promise<void> {
    if (!editableJsonContent.value.trim()) {
      return
    }

    try {
      // 验证 JSON 格式
      const workflowData = JSON.parse(editableJsonContent.value)

      // 发送到 ComfyUI iframe
      await sendComfyUIMessage('comfy-pilot:set-workflow', workflowData)

      jsonEditError.value = ''
      toast.success('工作流已应用到 ComfyUI')
    } catch (error) {
      console.error('应用 JSON 修改失败:', error)
      jsonEditError.value = error instanceof Error ? error.message : 'JSON 格式错误'
      toast.error('JSON 格式错误，无法应用修改')
    }
  }

  // 发送消息到 ComfyUI 并等待响应
  function sendComfyUIMessage(type: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!comfyuiFrame.value?.contentWindow) {
        reject(new Error('ComfyUI iframe 未就绪'))
        return
      }

      const requestId = `req_${Date.now()}_${Math.random()}`
      let timeoutId: number | null = null

      const handleMessage = (event: MessageEvent) => {
        // 安全检查：确保消息来自 iframe
        if (event.source !== comfyuiFrame.value?.contentWindow) {
          return
        }

        const { requestId: resId, type: resType, payload: resPayload } = event.data || {}

        // 只处理匹配 requestId 的响应消息
        if (resId === requestId) {
          window.removeEventListener('message', handleMessage)
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
          }

          if (resType?.includes('error')) {
            reject(new Error(resPayload?.message || '操作失败'))
          } else {
            resolve(resPayload)
          }
        }
      }

      window.addEventListener('message', handleMessage)

      comfyuiFrame.value.contentWindow.postMessage(
        {
          type,
          payload,
          requestId
        },
        '*'
      )

      timeoutId = window.setTimeout(() => {
        window.removeEventListener('message', handleMessage)
        reject(new Error('操作超时'))
      }, 5000)
    })
  }

  // 在 ComfyUI 中加载工作流
  async function loadWorkflowInComfyUI(content: string): Promise<void> {
    if (!comfyuiFrame.value?.contentWindow) {
      return
    }

    try {
      // 1. 创建新的工作流标签页
      await sendComfyUIMessage('comfy-pilot:new-workflow', null)

      // 2. 如果内容不为空，设置工作流内容
      if (content && content.trim()) {
        const workflowData = JSON.parse(content)
        await sendComfyUIMessage('comfy-pilot:set-workflow', workflowData)
      }
    } catch (error) {
      console.error('加载工作流到 ComfyUI 失败:', error)
    }
  }

  // 从 iframe 获取工作流内容
  function fetchWorkflowFromIframe(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!comfyuiFrame.value?.contentWindow) {
        reject(new Error('ComfyUI iframe 未就绪'))
        return
      }

      const requestId = `req_${Date.now()}_${Math.random()}`
      let timeoutId: number | null = null

      const handleMessage = (event: MessageEvent) => {
        // 安全检查：确保消息来自 iframe
        if (event.source !== comfyuiFrame.value?.contentWindow) {
          return
        }

        const { type, payload, requestId: resId } = event.data || {}

        // 只处理匹配 requestId 的响应消息
        if (resId === requestId) {
          window.removeEventListener('message', handleMessage)
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
          }

          if (type === 'comfy-pilot:workflow-data' && payload) {
            resolve(JSON.stringify(payload, null, 2))
          } else {
            reject(new Error('获取工作流失败'))
          }
        }
      }

      window.addEventListener('message', handleMessage)

      comfyuiFrame.value.contentWindow.postMessage(
        {
          type: 'comfy-pilot:get-workflow',
          requestId
        },
        '*'
      )

      timeoutId = window.setTimeout(() => {
        window.removeEventListener('message', handleMessage)
        reject(new Error('获取工作流超时'))
      }, 5000)
    })
  }

  // 复制 JSON 到剪贴板
  async function copyJsonToClipboard(): Promise<void> {
    try {
      await navigator.clipboard.writeText(editableJsonContent.value)
      toast.success('JSON 已复制到剪贴板')
    } catch (error) {
      console.error('复制失败:', error)
      toast.error('复制失败')
    }
  }

  // 格式化 JSON
  function formatJson(): void {
    try {
      const parsed = JSON.parse(editableJsonContent.value)
      editableJsonContent.value = JSON.stringify(parsed, null, 2)
      jsonEditError.value = ''
      isJsonValid.value = true
      toast.success('JSON 已格式化')
    } catch (error) {
      toast.error('JSON 格式错误，无法格式化')
    }
  }

  // 验证 JSON
  function handleJsonValidate(isValid: boolean, errors: string[]): void {
    isJsonValid.value = isValid
    if (!isValid && errors.length > 0) {
      jsonEditError.value = errors[0] || 'JSON 格式错误'
    } else {
      jsonEditError.value = ''
    }
  }

  // 开始拖拽视图切换按钮
  function handleViewToggleMouseDown(event: MouseEvent): void {
    isDraggingViewToggle.value = true
    dragStartPos.value = { x: event.clientX, y: event.clientY }
    dragStartTogglePos.value = { ...viewTogglePosition.value }

    document.addEventListener('mousemove', handleViewToggleMouseMove)
    document.addEventListener('mouseup', handleViewToggleMouseUp)
  }

  // 拖拽移动
  function handleViewToggleMouseMove(event: MouseEvent): void {
    if (!isDraggingViewToggle.value) return

    const container = document.querySelector('.f-comfyui-container') as HTMLElement
    const toggleElement = document.querySelector('.f-view-toggle') as HTMLElement

    if (!container || !toggleElement) return

    const containerRect = container.getBoundingClientRect()
    const toggleRect = toggleElement.getBoundingClientRect()

    // 计算新位置
    const deltaX = event.clientX - dragStartPos.value.x
    const deltaY = event.clientY - dragStartPos.value.y

    let newX = dragStartTogglePos.value.x + deltaX
    let newY = dragStartTogglePos.value.y + deltaY

    // 限制在容器范围内
    const minX = -containerRect.width / 2 + toggleRect.width / 2 + 12
    const maxX = containerRect.width / 2 - toggleRect.width / 2 - 12
    const minY = 12
    const maxY = containerRect.height - toggleRect.height - 12

    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))

    viewTogglePosition.value = { x: newX, y: newY }
  }

  // 结束拖拽
  function handleViewToggleMouseUp(): void {
    isDraggingViewToggle.value = false
    document.removeEventListener('mousemove', handleViewToggleMouseMove)
    document.removeEventListener('mouseup', handleViewToggleMouseUp)
  }

  // 监听来自 ComfyUI 的推送消息（不需要 requestId 的消息）
  function handleComfyUIMessage(event: MessageEvent): void {
    // 安全检查：确保消息来自 iframe
    if (event.source !== comfyuiFrame.value?.contentWindow) {
      return
    }

    if (!event.data || typeof event.data !== 'object') return

    const { type, payload, requestId } = event.data

    // 如果消息有 requestId，说明是请求-响应消息，由 sendComfyUIMessage 处理
    // 这里只处理推送消息（没有 requestId 的消息）
    if (requestId) {
      return
    }

    switch (type) {
      case 'comfy-pilot:workflow-graph-changed':
        // ComfyUI 中工作流图发生变化（推送消息）
        if (payload && currentView.value === 'comfyui') {
          // 只在 ComfyUI 视图时更新内容
          editableJsonContent.value = JSON.stringify(payload, null, 2)
          console.log('[ComfyUI Integration] 工作流图已更新')
        }
        break

      default:
        // 忽略未知的推送消息
        break
    }
  }

  // 组件挂载时设置消息监听
  onMounted(() => {
    window.addEventListener('message', handleComfyUIMessage)
  })

  // 组件卸载时清理监听
  onUnmounted(() => {
    window.removeEventListener('message', handleComfyUIMessage)
    document.removeEventListener('mousemove', handleViewToggleMouseMove)
    document.removeEventListener('mouseup', handleViewToggleMouseUp)
  })

  return {
    // 状态
    comfyuiFrame,
    currentView,
    editableJsonContent,
    jsonEditError,
    isJsonValid,
    viewTogglePosition,
    isDraggingViewToggle,

    // 方法
    setComfyuiFrame,
    switchView,
    loadWorkflowInComfyUI,
    fetchWorkflowFromIframe,
    copyJsonToClipboard,
    formatJson,
    handleJsonValidate,
    handleViewToggleMouseDown
  }
}
