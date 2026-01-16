/**
 * 工作流状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Workflow, CreateWorkflowParams, UpdateWorkflowParams } from '@/types/workflow'
import {
  getMyWorkflows,
  getWorkflowDetail,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
} from '@/services/workflow'

export const useWorkflowStore = defineStore('workflow', () => {
  // 状态
  const workflows = ref<Workflow[]>([])
  const currentWorkflow = ref<Workflow | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const hasWorkflows = computed(() => workflows.value.length > 0)

  const draftWorkflows = computed(() =>
    workflows.value.filter(w => w.status === 'draft')
  )

  const publishedWorkflows = computed(() =>
    workflows.value.filter(w => w.status === 'published')
  )

  /**
   * 获取我的工作流列表
   */
  async function fetchMyWorkflows(): Promise<void> {
    isLoading.value = true
    try {
      workflows.value = await getMyWorkflows()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取工作流详情
   */
  async function fetchWorkflowDetail(id: string): Promise<void> {
    isLoading.value = true
    try {
      currentWorkflow.value = await getWorkflowDetail(id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建工作流
   */
  async function createNewWorkflow(params: CreateWorkflowParams): Promise<Workflow> {
    const workflow = await createWorkflow(params)
    workflows.value.unshift(workflow)
    return workflow
  }

  /**
   * 更新工作流
   */
  async function updateWorkflowData(id: string, params: UpdateWorkflowParams): Promise<void> {
    const updatedWorkflow = await updateWorkflow(id, params)

    // 更新列表中的工作流
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workflows.value[index] = updatedWorkflow
    }

    // 更新当前工作流
    if (currentWorkflow.value?.id === id) {
      currentWorkflow.value = updatedWorkflow
    }
  }

  /**
   * 删除工作流
   */
  async function removeWorkflow(id: string): Promise<void> {
    await deleteWorkflow(id)
    workflows.value = workflows.value.filter(w => w.id !== id)

    if (currentWorkflow.value?.id === id) {
      currentWorkflow.value = null
    }
  }

  /**
   * 设置当前工作流
   */
  function setCurrentWorkflow(workflow: Workflow | null): void {
    currentWorkflow.value = workflow
  }

  /**
   * 清除工作流数据
   */
  function clearWorkflowData(): void {
    workflows.value = []
    currentWorkflow.value = null
  }

  return {
    // 状态
    workflows,
    currentWorkflow,
    isLoading,
    // 计算属性
    hasWorkflows,
    draftWorkflows,
    publishedWorkflows,
    // 方法
    fetchMyWorkflows,
    fetchWorkflowDetail,
    createNewWorkflow,
    updateWorkflowData,
    removeWorkflow,
    setCurrentWorkflow,
    clearWorkflowData
  }
})
