/**
 * MCP 工具配置管理 (localStorage)
 */

import type { McpConfig, McpToolSetConfig, ToolExecutionPolicy } from './types'

const STORAGE_KEY = 'mcp-config'
const DEFAULT_VERSION = '1.0.0'

/**
 * 默认配置
 */
const DEFAULT_CONFIG: McpConfig = {
  version: DEFAULT_VERSION,
  toolSets: []
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
}

// 全局单例
export const mcpConfigManager = new McpConfigManager()
