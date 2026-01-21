/**
 * 工作流状态管理 Store（与后端 API 对应）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Workflow,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
  ListWorkflowsParams,
  WorkflowVersion,
  CreateVersionRequest
} from '@/types/workflow'
import * as workflowApi from '@/services/workflow'

export const useWorkflowStore = defineStore('workflow', () => {
  // 状态
  const workflows = ref<Workflow[]>([])
  const currentWorkflow = ref<Workflow | null>(null)
  const currentWorkflowContent = ref<string | null>(null)
  const versions = ref<WorkflowVersion[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)

  // 计算属性
  const hasWorkflows = computed(() => workflows.value.length > 0)

  /**
   * 查询工作流列表
   */
  async function fetchWorkflows(params?: ListWorkflowsParams): Promise<void> {
    isLoading.value = true
    try {
      workflows.value = await workflowApi.listWorkflows(params)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 查询工作流详情
   */
  async function fetchWorkflowById(id: string): Promise<void> {
    isLoading.value = true
    try {
      currentWorkflow.value = await workflowApi.getWorkflowById(id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建工作流
   */
  async function createNewWorkflow(data: CreateWorkflowRequest): Promise<Workflow> {
    const workflow = await workflowApi.createWorkflow(data)
    workflows.value.unshift(workflow)
    return workflow
  }

  /**
   * 更新工作流信息
   */
  async function updateWorkflowInfo(id: string, data: UpdateWorkflowRequest): Promise<void> {
    const updatedWorkflow = await workflowApi.updateWorkflow(id, data)

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
    await workflowApi.deleteWorkflow(id)
    workflows.value = workflows.value.filter(w => w.id !== id)

    if (currentWorkflow.value?.id === id) {
      currentWorkflow.value = null
      currentWorkflowContent.value = null
    }
  }

  /**
   * 获取工作流内容
   */
  async function fetchWorkflowContent(id: string): Promise<void> {
    isLoading.value = true
    try {
      currentWorkflowContent.value = await workflowApi.getWorkflowContent(id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 保存工作流内容
   */
  async function saveWorkflowContent(id: string, content: string): Promise<void> {
    isSaving.value = true
    try {
      const updatedWorkflow = await workflowApi.saveWorkflowContent(id, { content })

      // 更新当前工作流内容
      currentWorkflowContent.value = content

      // 更新列表中的工作流
      const index = workflows.value.findIndex(w => w.id === id)
      if (index !== -1) {
        workflows.value[index] = updatedWorkflow
      }

      // 更新当前工作流
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = updatedWorkflow
      }
    } finally {
      isSaving.value = false
    }
  }

  /**
   * 设置当前工作流
   */
  function setCurrentWorkflow(workflow: Workflow | null): void {
    currentWorkflow.value = workflow
    currentWorkflowContent.value = workflow?.activeContent || null
  }

  /**
   * 清除工作流数据
   */
  function clearWorkflowData(): void {
    workflows.value = []
    currentWorkflow.value = null
    currentWorkflowContent.value = null
    versions.value = []
  }

  /**
   * 查询工作流版本列表
   */
  async function fetchWorkflowVersions(workflowId: string): Promise<void> {
    isLoading.value = true
    try {
      versions.value = await workflowApi.listWorkflowVersions(workflowId)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 创建工作流版本
   */
  async function createVersion(workflowId: string, data: CreateVersionRequest): Promise<WorkflowVersion> {
    const version = await workflowApi.createWorkflowVersion(workflowId, data)
    versions.value.unshift(version)
    return version
  }

  return {
    // 状态
    workflows,
    currentWorkflow,
    currentWorkflowContent,
    versions,
    isLoading,
    isSaving,
    // 计算属性
    hasWorkflows,
    // 方法
    fetchWorkflows,
    fetchWorkflowById,
    fetchWorkflowContent,
    createNewWorkflow,
    updateWorkflowInfo,
    saveWorkflowContent,
    removeWorkflow,
    setCurrentWorkflow,
    clearWorkflowData,
    fetchWorkflowVersions,
    createVersion
  }
})
