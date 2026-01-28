/**
 * 用户 Agent 配置状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserAgentConfig, AgentRuntimeConfig } from '@/types/agent'
import { agentRuntimeApi } from '@/services/agent'
import { getSelectedAgentCode, setSelectedAgentCode, removeSelectedAgentCode } from '@/utils/storage'

export const useUserAgentConfigStore = defineStore('userAgentConfig', () => {
  // 状态
  const userAgentConfigs = ref<UserAgentConfig[]>([])
  const runtimeAgents = ref<AgentRuntimeConfig[]>([])
  const selectedAgentCode = ref<string>('')
  const isLoading = ref(false)

  // 计算属性：已配置的 Agent（agentConfig 不为空）
  const configuredAgents = computed(() => {
    return userAgentConfigs.value.filter(config =>
      config.agentConfig && config.agentConfig.trim() !== ''
    )
  })

  // 计算属性：当前选中的 Agent 配置
  const currentAgentConfig = computed(() => {
    return userAgentConfigs.value.find(config => config.agentCode === selectedAgentCode.value)
  })

  // 计算属性：当前选中的 Agent 运行时信息
  const currentAgent = computed(() => {
    return runtimeAgents.value.find(agent => agent.agentCode === selectedAgentCode.value)
  })

  /**
   * 加载用户 Agent 配置列表
   */
  async function loadUserAgentConfigs(): Promise<void> {
    isLoading.value = true
    try {
      userAgentConfigs.value = await agentRuntimeApi.getUserAgentConfigs()

      // 如果没有选中的 Agent，自动选择第一个已配置的 Agent
      if (!selectedAgentCode.value) {
        autoSelectFirstConfiguredAgent()
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载运行时 Agent 列表
   */
  async function loadRuntimeAgents(): Promise<void> {
    try {
      runtimeAgents.value = await agentRuntimeApi.getEnabledAgents()
    } catch (error) {
      console.error('加载运行时 Agent 列表失败:', error)
    }
  }

  /**
   * 更新用户 Agent 配置
   */
  async function updateUserAgentConfig(data: UserAgentConfig): Promise<void> {
    await agentRuntimeApi.updateUserAgentConfig(data)
    // 重新加载配置列表
    await loadUserAgentConfigs()
  }

  /**
   * 选择 Agent
   */
  function selectAgent(agentCode: string): void {
    selectedAgentCode.value = agentCode
    setSelectedAgentCode(agentCode)
  }

  /**
   * 切换到下一个已配置的 Agent
   */
  function selectNextAgent(): void {
    const configured = configuredAgents.value
    if (configured.length === 0) return

    const currentIndex = configured.findIndex(config => config.agentCode === selectedAgentCode.value)
    const nextIndex = (currentIndex + 1) % configured.length
    const nextAgent = configured[nextIndex]
    if (nextAgent) {
      selectAgent(nextAgent.agentCode)
    }
  }

  /**
   * 自动选择第一个已配置的 Agent
   */
  function autoSelectFirstConfiguredAgent(): void {
    // 先尝试从 localStorage 恢复
    const savedAgentCode = getSelectedAgentCode()
    if (savedAgentCode) {
      const exists = configuredAgents.value.some(config => config.agentCode === savedAgentCode)
      if (exists) {
        selectedAgentCode.value = savedAgentCode
        return
      }
    }

    // 如果没有保存的或保存的不存在，选择第一个已配置的
    const firstConfigured = configuredAgents.value[0]
    if (firstConfigured) {
      selectAgent(firstConfigured.agentCode)
    }
  }

  /**
   * 初始化数据
   */
  async function initData(): Promise<void> {
    await Promise.all([
      loadUserAgentConfigs(),
      loadRuntimeAgents()
    ])
  }

  /**
   * 清除数据
   */
  function clearData(): void {
    userAgentConfigs.value = []
    runtimeAgents.value = []
    selectedAgentCode.value = ''
    removeSelectedAgentCode()
  }

  return {
    // 状态
    userAgentConfigs,
    runtimeAgents,
    selectedAgentCode,
    isLoading,
    // 计算属性
    configuredAgents,
    currentAgentConfig,
    currentAgent,
    // 方法
    loadUserAgentConfigs,
    loadRuntimeAgents,
    updateUserAgentConfig,
    selectAgent,
    selectNextAgent,
    autoSelectFirstConfiguredAgent,
    initData,
    clearData
  }
})
