import { ref, onMounted, onUnmounted } from 'vue'
import { toast } from '@/utils/toast'
import type { WorkflowExecutionResult } from '@/types/workflow'

export function useComfyUIIntegration() {
  // ComfyUI iframe 引用 (需要从外部设置)
  const comfyuiFrame = ref<HTMLIFrameElement | null>(null)

  // iframe 连接状态
  const isIframeConnected = ref(false)
  const isCheckingConnection = ref(false)

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

  // 等待 iframe 加载完成
  function waitForIframeLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!comfyuiFrame.value) {
        reject(new Error('iframe 元素不存在'))
        return
      }

      // 检查当前 location 是否已经是目标 URL（不是 about:blank）
      try {
        const currentLocation = comfyuiFrame.value.contentWindow?.location.href
        if (currentLocation && currentLocation !== 'about:blank' &&
            comfyuiFrame.value.contentDocument?.readyState === 'complete') {
          console.log('[ComfyUI Integration] iframe 已经加载完成:', currentLocation)
          resolve()
          return
        }
      } catch (e) {
        // 跨域情况下无法访问 location，继续等待 load 事件
      }

      // 监听 load 事件
      const handleLoad = () => {
        console.log('[ComfyUI Integration] iframe load 事件触发')
        resolve()
      }

      const handleError = () => {
        console.error('[ComfyUI Integration] iframe 加载失败')
        reject(new Error('iframe 加载失败'))
      }

      comfyuiFrame.value.addEventListener('load', handleLoad, { once: true })
      comfyuiFrame.value.addEventListener('error', handleError, { once: true })

      // 设置超时（15秒）
      setTimeout(() => {
        comfyuiFrame.value?.removeEventListener('load', handleLoad)
        comfyuiFrame.value?.removeEventListener('error', handleError)
        reject(new Error('iframe 加载超时'))
      }, 15000)
    })
  }

  // 检测 iframe 连接状态
  async function checkIframeConnection(): Promise<boolean> {
    if (!comfyuiFrame.value?.contentWindow) {
      console.error('[ComfyUI Integration] iframe 元素或 contentWindow 不存在')
      isIframeConnected.value = false
      return false
    }

    isCheckingConnection.value = true

    try {
      // 等待 iframe 加载完成
      console.log('[ComfyUI Integration] 等待 iframe 加载完成...')
      await waitForIframeLoad()

      // 额外等待 1000ms 确保 iframe 内部脚本初始化完成
      console.log('[ComfyUI Integration] 等待 ComfyUI 初始化...')
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 检测是否能访问 iframe 的 contentWindow（说明同源且可通信）
      try {
        // 尝试访问 iframe 的 location（如果跨域会抛出错误）
        const iframeLocation = comfyuiFrame.value.contentWindow.location.href
        console.log('[ComfyUI Integration] iframe location:', iframeLocation)

        // 如果能访问到 location，说明连接成功
        isIframeConnected.value = true
        console.log('[ComfyUI Integration] ✅ iframe 连接成功（同源检测通过）')
        return true
      } catch (crossOriginError) {
        // 跨域情况下，尝试通过 postMessage 通信
        console.log('[ComfyUI Integration] 跨域环境，尝试 postMessage 通信...')

        // 发送测试消息并等待任何响应
        const connected = await new Promise<boolean>((resolve) => {
          let resolved = false
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true
              window.removeEventListener('message', messageHandler)
              resolve(false)
            }
          }, 3000)

          const messageHandler = (event: MessageEvent) => {
            // 检查消息是否来自 iframe
            if (event.source === comfyuiFrame.value?.contentWindow) {
              if (!resolved) {
                resolved = true
                clearTimeout(timeout)
                window.removeEventListener('message', messageHandler)
                console.log('[ComfyUI Integration] 收到 iframe 消息，连接成功')
                resolve(true)
              }
            }
          }

          window.addEventListener('message', messageHandler)

          // 发送测试消息
          comfyuiFrame.value?.contentWindow?.postMessage(
            { type: 'comfy-pilot:ping', timestamp: Date.now() },
            '*'
          )
        })

        isIframeConnected.value = connected
        if (connected) {
          console.log('[ComfyUI Integration] ✅ iframe 连接成功（postMessage 通信正常）')
        } else {
          console.error('[ComfyUI Integration] ❌ iframe 连接失败（无响应）')
        }
        return connected
      }
    } catch (error) {
      isIframeConnected.value = false
      console.error('[ComfyUI Integration] ❌ iframe 连接失败:', error)
      return false
    } finally {
      isCheckingConnection.value = false
    }
  }

  // 切换视图
  async function switchView(view: 'comfyui' | 'json'): Promise<void> {
    const previousView = currentView.value
    currentView.value = view

    // 如果 iframe 未连接,不进行同步操作
    if (!isIframeConnected.value) {
      return
    }

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
  function sendComfyUIMessage(type: string, payload: any, timeout: number = 10000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!comfyuiFrame.value?.contentWindow) {
        console.error('[ComfyUI Integration] iframe contentWindow 不存在')
        reject(new Error('ComfyUI iframe 未就绪'))
        return
      }

      const requestId = `req_${Date.now()}_${Math.random()}`
      let timeoutId: number | null = null

      console.log(`[ComfyUI Integration] 发送消息: ${type}, requestId: ${requestId}`)

      const handleMessage = (event: MessageEvent) => {
        // 安全检查：确保消息来自 iframe
        if (event.source !== comfyuiFrame.value?.contentWindow) {
          return
        }

        const { requestId: resId, type: resType, payload: resPayload } = event.data || {}

        // 只处理匹配 requestId 的响应消息
        if (resId === requestId) {
          console.log(`[ComfyUI Integration] 收到响应: ${resType}, requestId: ${resId}`)
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
        console.error(`[ComfyUI Integration] 消息超时: ${type}, requestId: ${requestId}, timeout: ${timeout}ms`)
        window.removeEventListener('message', handleMessage)
        reject(new Error(`操作超时 (${timeout}ms)`))
      }, timeout)
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

  // 执行工作流（不设置超时，因为工作流执行可能很长）
  async function executeWorkflow(
    comfyuiBaseUrl: string,
    batchCount: number = 1
  ): Promise<WorkflowExecutionResult> {
    if (!comfyuiFrame.value?.contentWindow) {
      throw new Error('ComfyUI iframe 未就绪')
    }

    // 第一步：发送执行请求
    const execResult = await sendExecuteRequest(batchCount)

    if (!execResult.success) {
      return execResult
    }

    // 第二步：如果执行成功但没有 outputs，开始轮询
    if (execResult.success && !execResult.outputs && execResult.promptId) {
      console.log('[执行工作流] 开始轮询获取执行结果...')
      const polledResult = await pollExecutionResult(comfyuiBaseUrl, execResult.promptId)
      return polledResult
    }

    // 第三步：如果插件直接返回了 outputs，也需要处理 URL
    if (execResult.outputs?.outputs) {
      processOutputUrls(execResult.outputs.outputs, comfyuiBaseUrl)
    }

    return execResult
  }

  // 发送执行请求
  function sendExecuteRequest(batchCount: number): Promise<WorkflowExecutionResult> {
    return new Promise((resolve, reject) => {
      if (!comfyuiFrame.value?.contentWindow) {
        reject(new Error('ComfyUI iframe 未就绪'))
        return
      }

      const requestId = `exec_${Date.now()}_${Math.random()}`

      const handleMessage = (event: MessageEvent) => {
        if (event.source !== comfyuiFrame.value?.contentWindow) {
          return
        }

        const { requestId: resId, type: resType, payload: resPayload } = event.data || {}

        if (resId === requestId && resType === 'comfy-pilot:execution-result') {
          window.removeEventListener('message', handleMessage)
          resolve(resPayload || { success: false, error: '执行结果为空' })
        }
      }

      window.addEventListener('message', handleMessage)

      comfyuiFrame.value.contentWindow.postMessage(
        {
          type: 'comfy-pilot:execute-workflow',
          payload: { batchCount },
          requestId
        },
        '*'
      )
    })
  }

  // 轮询获取执行结果
  async function pollExecutionResult(
    comfyuiBaseUrl: string,
    promptId: string
  ): Promise<WorkflowExecutionResult> {
    const maxAttempts = 60 // 最多轮询 60 次（5 分钟）
    const pollInterval = 5000 // 每 5 秒轮询一次

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[执行工作流] 轮询第 ${attempt} 次，查询 Prompt ID: ${promptId}`)

      try {
        // 调用 ComfyUI 的 history API
        const response = await fetch(`${comfyuiBaseUrl}/history/${promptId}`)

        if (!response.ok) {
          console.warn(`[执行工作流] 轮询失败，HTTP 状态: ${response.status}`)
          await sleep(pollInterval)
          continue
        }

        const historyData = await response.json()

        // 检查是否有该 promptId 的历史记录
        if (historyData && historyData[promptId]) {
          const history = historyData[promptId]
          console.log('[执行工作流] 成功获取执行历史:', history)

          // 构建返回结果（注意：history.outputs 直接就是节点输出对象）
          const result = {
            success: true,
            promptId: promptId,
            outputs: {
              outputs: history.outputs || null
            },
            status: history.status || null
          }

          // 处理输出 URL
          if (result.outputs.outputs) {
            processOutputUrls(result.outputs.outputs, comfyuiBaseUrl)
          }

          return result
        }

        console.log('[执行工作流] 历史记录尚未生成，继续等待...')
      } catch (error) {
        console.error('[执行工作流] 轮询出错:', error)
      }

      // 等待后继续下一次轮询
      await sleep(pollInterval)
    }

    // 超过最大轮询次数
    return {
      success: true,
      promptId: promptId,
      outputs: null,
      outputError: '轮询超时，未能获取执行结果'
    }
  }

  // 延迟函数
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 处理输出中的 URL，拼接完整的 fullUrl
  function processOutputUrls(outputs: Record<string, any>, baseUrl: string): void {
    for (const nodeOutput of Object.values(outputs)) {
      // 处理图片
      if (nodeOutput.images && Array.isArray(nodeOutput.images)) {
        nodeOutput.images.forEach((img: any) => {
          // 根据 filename, subfolder, type 构建 URL
          const params = new URLSearchParams({
            filename: img.filename,
            subfolder: img.subfolder || '',
            type: img.type || 'output'
          })
          img.url = `/view?${params.toString()}`
          img.fullUrl = `${baseUrl}${img.url}`
        })
      }

      // 处理视频
      if (nodeOutput.videos && Array.isArray(nodeOutput.videos)) {
        nodeOutput.videos.forEach((video: any) => {
          const params = new URLSearchParams({
            filename: video.filename,
            subfolder: video.subfolder || '',
            type: video.type || 'output'
          })
          video.url = `/view?${params.toString()}`
          video.fullUrl = `${baseUrl}${video.url}`
        })
      }

      // 处理 GIF
      if (nodeOutput.gifs && Array.isArray(nodeOutput.gifs)) {
        nodeOutput.gifs.forEach((gif: any) => {
          const params = new URLSearchParams({
            filename: gif.filename,
            subfolder: gif.subfolder || '',
            type: gif.type || 'output'
          })
          gif.url = `/view?${params.toString()}`
          gif.fullUrl = `${baseUrl}${gif.url}`
        })
      }

      // 处理音频
      if (nodeOutput.audio && Array.isArray(nodeOutput.audio)) {
        nodeOutput.audio.forEach((audio: any) => {
          const params = new URLSearchParams({
            filename: audio.filename,
            subfolder: audio.subfolder || '',
            type: audio.type || 'output'
          })
          audio.url = `/view?${params.toString()}`
          audio.fullUrl = `${baseUrl}${audio.url}`
        })
      }
    }
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
    isIframeConnected,
    isCheckingConnection,

    // 方法
    setComfyuiFrame,
    checkIframeConnection,
    switchView,
    loadWorkflowInComfyUI,
    fetchWorkflowFromIframe,
    executeWorkflow,
    copyJsonToClipboard,
    formatJson,
    handleJsonValidate,
    handleViewToggleMouseDown
  }
}
