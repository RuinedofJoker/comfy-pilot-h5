/**
 * 外部 MCP 工具集包装器
 * 使用 @modelcontextprotocol/sdk 连接外部 MCP 服务器
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import type {
  McpToolSet,
  McpToolSchema,
  McpServerConfig
} from '../types'

/**
 * 外部 MCP 工具集
 */
export class ExternalMcpToolSet implements McpToolSet {
  id: string
  name: string
  description: string
  type: 'external-mcp' = 'external-mcp'
  isBuiltIn = false

  private serverConfig: McpServerConfig
  private client: Client | null = null
  private transport: SSEClientTransport | null = null
  private tools: McpToolSchema[] = []
  private originalToolNames: Map<string, string> = new Map() // 带前缀的工具名 -> 原始工具名
  private connected = false

  constructor(serverConfig: McpServerConfig) {
    this.serverConfig = serverConfig
    this.id = serverConfig.id
    this.name = serverConfig.name
    this.description = serverConfig.description || ''
  }

  /**
   * 为工具名添加统一前缀
   */
  private addToolPrefix(toolName: string): string {
    return `h5_mcp_${toolName}`
  }

  /**
   * 从带前缀的工具名中提取原始工具名
   */
  private getOriginalToolName(prefixedName: string): string | undefined {
    return this.originalToolNames.get(prefixedName)
  }

  /**
   * 连接到外部 MCP 服务器
   */
  async connect(): Promise<void> {
    if (this.connected) {
      console.log(`[ExternalMcpToolSet] ${this.name} 已经连接`)
      return
    }

    try {
      console.log(`[ExternalMcpToolSet] 正在连接到 ${this.name} (${this.serverConfig.url})...`)

      // 创建客户端
      this.client = new Client(
        {
          name: 'comfy-pilot-h5',
          version: '1.0.0'
        },
        {
          capabilities: {}
        }
      )

      // 创建传输层
      this.transport = await this.createTransport()

      // 连接
      await this.client.connect(this.transport)

      // 获取工具列表
      await this.refreshTools()

      this.connected = true
      console.log(`[ExternalMcpToolSet] ✅ ${this.name} 连接成功，发现 ${this.tools.length} 个工具`)
    } catch (error) {
      this.connected = false
      console.error(`[ExternalMcpToolSet] ❌ ${this.name} 连接失败:`, error)
      throw new Error(`连接 MCP 服务器失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  /**
   * 创建传输层
   */
  private async createTransport(): Promise<SSEClientTransport> {
    const { url, auth } = this.serverConfig

    // 构建请求头
    const customHeaders: Record<string, string> = {}

    // 添加认证信息
    if (auth) {
      if (auth.type === 'bearer' && auth.token) {
        customHeaders['Authorization'] = `Bearer ${auth.token}`
      } else if (auth.type === 'api-key' && auth.token) {
        customHeaders['X-API-Key'] = auth.token
      }
    }

    // 根据传输协议创建传输层
    if (this.serverConfig.transport === 'sse' || this.serverConfig.transport === 'http') {
      // 如果有自定义请求头，使用自定义 fetch 函数注入
      const options: any = {}

      if (Object.keys(customHeaders).length > 0) {
        // 创建自定义 fetch 函数，注入认证请求头
        options.fetch = async (url: string | URL, init: any) => {
          const mergedHeaders = {
            ...init.headers,
            ...customHeaders
          }
          return fetch(url, {
            ...init,
            headers: mergedHeaders
          })
        }
      }

      // requestInit 用于自定义 POST 请求（发送消息）
      if (Object.keys(customHeaders).length > 0) {
        options.requestInit = {
          headers: customHeaders
        }
      }

      return new SSEClientTransport(new URL(url), options)
    }

    throw new Error(`不支持的传输协议: ${this.serverConfig.transport}`)
  }

  /**
   * 刷新工具列表
   */
  private async refreshTools(): Promise<void> {
    if (!this.client) {
      throw new Error('客户端未初始化')
    }

    try {
      const response = await this.client.listTools()

      // 清空旧的映射
      this.originalToolNames.clear()

      // 转换为我们的 McpToolSchema 格式，并添加前缀
      this.tools = response.tools.map(tool => {
        const originalName = tool.name
        const prefixedName = this.addToolPrefix(originalName)

        // 存储前缀名到原始名的映射
        this.originalToolNames.set(prefixedName, originalName)

        return {
          name: prefixedName,
          description: tool.description,
          inputSchema: tool.inputSchema as any
        }
      })

      console.log(`[ExternalMcpToolSet] ${this.name} 工具列表已刷新:`, this.tools.map(t => t.name))
    } catch (error) {
      console.error(`[ExternalMcpToolSet] 刷新工具列表失败:`, error)
      throw error
    }
  }

  /**
   * 断开连接
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return
    }

    try {
      await this.client?.close()
      this.client = null
      this.transport = null
      this.tools = []
      this.connected = false
      console.log(`[ExternalMcpToolSet] ${this.name} 已断开连接`)
    } catch (error) {
      console.error(`[ExternalMcpToolSet] 断开连接失败:`, error)
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.connected
  }

  /**
   * 获取工具列表
   */
  getTools(): McpToolSchema[] {
    return this.tools
  }

  /**
   * 执行工具
   */
  async executeToolByName(toolCallId: string, name: string, args: any): Promise<any> {
    if (!this.connected || !this.client) {
      throw new Error('未连接到 MCP 服务器')
    }

    try {
      // 从带前缀的工具名中提取原始工具名
      const originalName = this.getOriginalToolName(name)
      if (!originalName) {
        throw new Error(`未找到工具: ${name}`)
      }

      console.log(`[ExternalMcpToolSet] 执行工具: ${name} (原始名: ${originalName})`, args)

      // 使用原始工具名调用 MCP SDK
      const response = await this.client.callTool({
        name: originalName,
        arguments: args
      })

      console.log(`[ExternalMcpToolSet] 工具执行结果:`, response)

      // 返回工具执行结果
      return {
        content: response.content,
        isError: response.isError
      }
    } catch (error) {
      console.error(`[ExternalMcpToolSet] 工具执行失败:`, error)
      throw error
    }
  }
}
