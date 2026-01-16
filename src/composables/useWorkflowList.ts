/**
 * 工作流列表逻辑 Composable
 */

import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useWorkflowStore } from '@/stores/workflow'
import type { CreateWorkflowRequest } from '@/types/workflow'

export function useWorkflowList() {
  const router = useRouter()
  const workflowStore = useWorkflowStore()
  const searchKeyword = ref('')
  const sortBy = ref<'createTime' | 'updateTime'>('updateTime')

  // 计算属性：过滤和排序后的工作流列表
  const filteredWorkflows = computed(() => {
    let list = workflowStore.workflows

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      list = list.filter(
        w =>
          w.workflowName.toLowerCase().includes(keyword) ||
          w.description?.toLowerCase().includes(keyword)
      )
    }

    // 排序
    return [...list].sort((a, b) => {
      const aTime = new Date(a[sortBy.value]).getTime()
      const bTime = new Date(b[sortBy.value]).getTime()
      return bTime - aTime
    })
  })

  /**
   * 创建新工作流
   */
  async function createWorkflow(params: CreateWorkflowRequest): Promise<void> {
    try {
      const workflow = await workflowStore.createNewWorkflow(params)
      showToast({
        type: 'success',
        message: '创建成功'
      })
      router.push(`/workflow/${workflow.id}`)
    } catch (error) {
      showToast({
        type: 'fail',
        message: '创建失败，请重试'
      })
    }
  }

  /**
   * 删除工作流
   */
  async function deleteWorkflow(id: string, name: string): Promise<void> {
    try {
      await showConfirmDialog({
        title: '确认删除',
        message: `确定要删除工作流"${name}"吗？此操作不可恢复。`
      })

      await workflowStore.removeWorkflow(id)
      showToast({
        type: 'success',
        message: '删除成功'
      })
    } catch (error) {
      // 用户取消删除
    }
  }

  /**
   * 打开工作流编辑器
   */
  function openWorkflow(id: string): void {
    router.push(`/workflow/${id}`)
  }

  /**
   * 加载工作流列表
   */
  async function loadWorkflows(): Promise<void> {
    try {
      await workflowStore.fetchWorkflows()
    } catch (error) {
      showToast({
        type: 'fail',
        message: '加载工作流列表失败'
      })
    }
  }

  onMounted(() => {
    loadWorkflows()
  })

  return {
    searchKeyword,
    sortBy,
    filteredWorkflows,
    isLoading: workflowStore.isLoading,
    hasWorkflows: workflowStore.hasWorkflows,
    createWorkflow,
    deleteWorkflow,
    openWorkflow,
    loadWorkflows
  }
}

