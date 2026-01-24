/**
 * MCP 工具注册器
 */

import type { McpToolSet, McpToolSchema, ToolExecutionResult } from './types'

/**
 * MCP 工具注册器
 */
export class McpToolRegistry {
  private toolSets = new Map<string, McpToolSet>()

  /**
   * 注册工具集
   */
  registerToolSet(toolSet: McpToolSet): void {
    if (this.toolSets.has(toolSet.id)) {
      console.warn(`[MCP Registry] 工具集 ${toolSet.id} 已存在,将被覆盖`)
    }
    this.toolSets.set(toolSet.id, toolSet)
    console.log(`[MCP Registry] 已注册工具集: ${toolSet.name} (${toolSet.id})`)
  }

  /**
   * 注销工具集
   */
  unregisterToolSet(toolSetId: string): boolean {
    const deleted = this.toolSets.delete(toolSetId)
    if (deleted) {
      console.log(`[MCP Registry] 已注销工具集: ${toolSetId}`)
    }
    return deleted
  }

  /**
   * 获取工具集
   */
  getToolSet(toolSetId: string): McpToolSet | undefined {
    return this.toolSets.get(toolSetId)
  }

  /**
   * 获取所有工具集
   */
  getAllToolSets(): McpToolSet[] {
    return Array.from(this.toolSets.values())
  }

  /**
   * 获取指定工具集的工具 schema
   */
  getToolSchemas(toolSetIds: string[]): McpToolSchema[] {
    const schemas: McpToolSchema[] = []

    for (const id of toolSetIds) {
      const toolSet = this.toolSets.get(id)
      if (toolSet) {
        schemas.push(...toolSet.getTools())
      } else {
        console.warn(`[MCP Registry] 工具集 ${id} 不存在`)
      }
    }

    return schemas
  }

  /**
   * 根据工具名称查找所属的工具集
   */
  findToolSetByToolName(toolName: string): McpToolSet | undefined {
    for (const toolSet of this.toolSets.values()) {
      const tools = toolSet.getTools()
      if (tools.some(tool => tool.name === toolName)) {
        return toolSet
      }
    }
    return undefined
  }

  /**
   * 执行工具
   */
  async executeToolByName(toolName: string, args: any): Promise<ToolExecutionResult> {
    const toolSet = this.findToolSetByToolName(toolName)

    if (!toolSet) {
      return {
        success: false,
        error: `工具 ${toolName} 不存在`
      }
    }

    if (!toolSet.executeToolByName) {
      return {
        success: false,
        error: `工具集 ${toolSet.name} 不支持执行工具`
      }
    }

    try {
      const result = await toolSet.executeToolByName(toolName, args)
      return {
        success: true,
        result
      }
    } catch (error) {
      console.error(`[MCP Registry] 执行工具 ${toolName} 失败:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '工具执行失败'
      }
    }
  }
}

// 全局单例
export const mcpToolRegistry = new McpToolRegistry()
