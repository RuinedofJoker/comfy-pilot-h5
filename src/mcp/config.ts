/**
 * MCP 工具配置管理 (localStorage)
 */

import type { McpConfig, McpToolSetConfig, McpServerConfig, ToolExecutionPolicy } from './types'

const STORAGE_KEY = 'mcp-config'
const DEFAULT_VERSION = '1.0.0'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: McpConfig = {
  version: DEFAULT_VERSION,
  toolSets: [],
  externalServers: []
}

/**
 * MCP 配置管理器
 */
export class McpConfigManager {
  /**
   * 加载配置
   */
  loadConfig(): McpConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return { ...DEFAULT_CONFIG }
      }

      const config = JSON.parse(stored) as McpConfig

      // 版本检查
      if (config.version !== DEFAULT_VERSION) {
        console.warn(`[MCP Config] 配置版本不匹配: ${config.version} -> ${DEFAULT_VERSION}`)
        // 可以在这里做版本迁移
      }

      return config
    } catch (error) {
      console.error('[MCP Config] 加载配置失败:', error)
      return { ...DEFAULT_CONFIG }
    }
  }

  /**
   * 保存配置
   */
  saveConfig(config: McpConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
      console.log('[MCP Config] 配置已保存')
    } catch (error) {
      console.error('[MCP Config] 保存配置失败:', error)
    }
  }

  /**
   * 获取工具集配置
   */
  getToolSetConfig(toolSetId: string): McpToolSetConfig | undefined {
    const config = this.loadConfig()
    return config.toolSets.find(ts => ts.id === toolSetId)
  }

  /**
   * 更新工具集配置
   */
  updateToolSetConfig(toolSetId: string, updates: Partial<Omit<McpToolSetConfig, 'id'>>): void {
    const config = this.loadConfig()
    const index = config.toolSets.findIndex(ts => ts.id === toolSetId)

    if (index >= 0) {
      // 更新现有配置（保留 id）
      const existingConfig = config.toolSets[index]!
      config.toolSets[index] = {
        id: existingConfig.id,
        enabled: updates.enabled ?? existingConfig.enabled,
        executionPolicy: updates.executionPolicy ?? existingConfig.executionPolicy
      }
    } else {
      // 不存在则创建
      config.toolSets.push({
        id: toolSetId,
        enabled: updates.enabled ?? true,
        executionPolicy: updates.executionPolicy ?? 'ask-every-time'
      })
    }

    this.saveConfig(config)
  }

  /**
   * 设置工具集启用状态
   */
  setToolSetEnabled(toolSetId: string, enabled: boolean): void {
    this.updateToolSetConfig(toolSetId, { enabled })
  }

  /**
   * 设置工具集执行策略
   */
  setToolSetExecutionPolicy(toolSetId: string, policy: ToolExecutionPolicy): void {
    this.updateToolSetConfig(toolSetId, { executionPolicy: policy })
  }

  /**
   * 获取所有启用的工具集 ID
   */
  getEnabledToolSetIds(): string[] {
    const config = this.loadConfig()
    return config.toolSets.filter(ts => ts.enabled).map(ts => ts.id)
  }

  /**
   * 重置配置
   */
  resetConfig(): void {
    localStorage.removeItem(STORAGE_KEY)
    console.log('[MCP Config] 配置已重置')
  }

  /**
   * 导出配置
   */
  exportConfig(): string {
    const config = this.loadConfig()
    return JSON.stringify(config, null, 2)
  }

  /**
   * 导入配置
   */
  importConfig(jsonString: string): boolean {
    try {
      const config = JSON.parse(jsonString) as McpConfig
      this.saveConfig(config)
      return true
    } catch (error) {
      console.error('[MCP Config] 导入配置失败:', error)
      return false
    }
  }

  // ==================== 外部 MCP 服务器配置管理 ====================

  /**
   * 获取所有外部服务器配置
   */
  getAllExternalServers(): McpServerConfig[] {
    const config = this.loadConfig()
    return config.externalServers || []
  }

  /**
   * 获取外部服务器配置
   */
  getExternalServer(serverId: string): McpServerConfig | undefined {
    const config = this.loadConfig()
    return config.externalServers?.find(s => s.id === serverId)
  }

  /**
   * 添加外部服务器配置
   */
  addExternalServer(serverConfig: McpServerConfig): void {
    const config = this.loadConfig()

    // 确保 externalServers 数组存在
    if (!config.externalServers) {
      config.externalServers = []
    }

    // 检查是否已存在
    const exists = config.externalServers.some(s => s.id === serverConfig.id)
    if (exists) {
      throw new Error(`服务器 ID ${serverConfig.id} 已存在`)
    }

    config.externalServers.push(serverConfig)
    this.saveConfig(config)
    console.log('[MCP Config] 外部服务器已添加:', serverConfig.name)
  }

  /**
   * 更新外部服务器配置
   */
  updateExternalServer(serverId: string, updates: Partial<Omit<McpServerConfig, 'id'>>): void {
    const config = this.loadConfig()

    if (!config.externalServers) {
      config.externalServers = []
    }

    const index = config.externalServers.findIndex(s => s.id === serverId)

    if (index >= 0) {
      const existing = config.externalServers[index]!
      config.externalServers[index] = {
        id: existing.id,
        name: updates.name ?? existing.name,
        description: updates.description ?? existing.description,
        url: updates.url ?? existing.url,
        transport: updates.transport ?? existing.transport,
        auth: updates.auth ?? existing.auth,
        enabled: updates.enabled ?? existing.enabled,
        executionPolicy: updates.executionPolicy ?? existing.executionPolicy
      }
      this.saveConfig(config)
      console.log('[MCP Config] 外部服务器已更新:', serverId)
    } else {
      throw new Error(`服务器 ID ${serverId} 不存在`)
    }
  }

  /**
   * 删除外部服务器配置
   */
  removeExternalServer(serverId: string): boolean {
    const config = this.loadConfig()

    if (!config.externalServers) {
      return false
    }

    const index = config.externalServers.findIndex(s => s.id === serverId)

    if (index >= 0) {
      config.externalServers.splice(index, 1)
      this.saveConfig(config)
      console.log('[MCP Config] 外部服务器已删除:', serverId)
      return true
    }

    return false
  }

  /**
   * 获取所有启用的外部服务器 ID
   */
  getEnabledExternalServerIds(): string[] {
    const config = this.loadConfig()
    return (config.externalServers || [])
      .filter(s => s.enabled)
      .map(s => s.id)
  }
}

// 全局单例
export const mcpConfigManager = new McpConfigManager()
