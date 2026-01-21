import { ref, computed } from 'vue'
import { toast } from '@/utils/toast'
import { compareWorkflowContent } from '@/utils/workflow-compare'
import {
  listWorkflows,
  getWorkflowById,
  createWorkflow,
  getWorkflowContent,
  saveWorkflowContent
} from '@/services/workflow'
import type { Workflow } from '@/types/workflow'

export function useWorkflowEditor(serviceId: string, serverKey: string) {
  // 工作流相关状态
  const workflows = ref<Workflow[]>([])
  const currentWorkflowId = ref<string | null>(null)
  const currentWorkflow = ref<Workflow | null>(null)
  const savedWorkflowContent = ref('')
  const pendingWorkflowContent = ref('')
  const editableJsonContent = ref('')
  const jsonEditError = ref('')

  // 工作流变更检测
  const hasUnsavedChanges = computed(() => {
    if (!currentWorkflowId.value) return false
    return !compareWorkflowContent(
      savedWorkflowContent.value,
      pendingWorkflowContent.value,
      (path) => {
        if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'offset') return true
        if (path.length >= 3 && path[0] === 'extra' && path[1] === 'ds' && path[2] === 'scale') return true
        if (path.length >= 4 && path[0] === 'nodes' && path[2] === 'properties' && path[3] === 'Node name for S&R') return true
        return false
      }
    )
  })

  // 加载工作流列表
  async function loadWorkflows(): Promise<void> {
    try {
      workflows.value = await listWorkflows({ comfyuiServerId: serviceId })
    } catch (error) {
      console.error('加载工作流列表失败:', error)
      toast.error('加载工作流列表失败')
    }
  }

  // 选择工作流
  async function selectWorkflow(workflowId: string, loadInIframe: (content: string) => Promise<void>): Promise<void> {
    if (currentWorkflowId.value === workflowId) return

    currentWorkflowId.value = workflowId

    try {
      currentWorkflow.value = await getWorkflowById(workflowId)
      const content = await getWorkflowContent(workflowId)

      savedWorkflowContent.value = content
      pendingWorkflowContent.value = content

      await loadInIframe(content)
    } catch (error) {
      console.error('加载工作流失败:', error)
      toast.error('加载工作流失败')
    }
  }

  // 创建工作流
  async function handleCreateWorkflow(name: string, description?: string): Promise<Workflow | null> {
    try {
      const workflow = await createWorkflow({
        workflowName: name,
        description,
        comfyuiServerId: serviceId,
        comfyuiServerKey: serverKey
      })

      toast.success('工作流创建成功')
      await loadWorkflows()
      return workflow
    } catch (error) {
      console.error('创建工作流失败:', error)
      toast.error('创建工作流失败')
      return null
    }
  }

  // 保存工作流
  async function saveWorkflow(fetchFromIframe: () => void): Promise<void> {
    if (!currentWorkflow.value) return

    try {
      await new Promise<void>((resolve) => {
        fetchFromIframe()
        setTimeout(resolve, 500)
      })

      await saveWorkflowContent(
        currentWorkflow.value.id,
        { content: pendingWorkflowContent.value }
      )

      savedWorkflowContent.value = pendingWorkflowContent.value
      toast.success('工作流已保存')
    } catch (error) {
      console.error('保存工作流失败:', error)
      toast.error('保存工作流失败')
    }
  }

  return {
    workflows,
    currentWorkflowId,
    currentWorkflow,
    savedWorkflowContent,
    pendingWorkflowContent,
    editableJsonContent,
    jsonEditError,
    hasUnsavedChanges,
    loadWorkflows,
    selectWorkflow,
    handleCreateWorkflow,
    saveWorkflow
  }
}
