/**
 * ComfyUI 工具集
 */

import type { McpToolSet, McpToolSchema } from '../types'
import type { useComfyUIIntegration } from '@/composables/workflow/useComfyUIIntegration'
import type { useServiceStore } from '@/stores/service'

/**
 * ComfyUI 工具集
 */
export class ComfyUIToolSet implements McpToolSet {
  id = 'comfyui-tools'
  name = 'ComfyUI 工具集'
  description = '与 ComfyUI 工作流交互的工具'
  type: 'built-in' = 'built-in'
  isBuiltIn = true

  private comfyUI: ReturnType<typeof useComfyUIIntegration>
  private serviceStore: ReturnType<typeof useServiceStore>

  constructor(
    comfyUI: ReturnType<typeof useComfyUIIntegration>,
    serviceStore: ReturnType<typeof useServiceStore>
  ) {
    this.comfyUI = comfyUI
    this.serviceStore = serviceStore
  }

  getTools(): McpToolSchema[] {
    return [
      {
        name: 'execute_workflow',
        description: '执行客户端当前 ComfyUI 工作流并返回结果',
        inputSchema: {
          type: 'object',
          properties: {
            batchCount: {
              type: 'number',
              description: '批次数量',
              default: 1
            }
          }
        }
      },
      {
        name: 'get_workflow',
        description: '获取客户端当前工作流的 JSON 内容',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'set_workflow',
        description: '以json字符串格式设置客户端 ComfyUI 中当前工作流内容',
        inputSchema: {
          type: 'object',
          properties: {
            workflowJson: {
              type: 'string',
              description: '工作流 JSON 字符串'
            }
          },
          required: ['workflowJson']
        }
      },
      {
        name: 'load_workflow',
        description: '设置客户端 ComfyUI 中当前工作流内容',
        inputSchema: {
          type: 'object',
          properties: {
            workflow: {
              type: 'object',
              description: '工作流 JSON 对象'
            }
          },
          required: ['workflow']
        }
      }
    ]
  }

  async executeToolByName(toolCallId: string, name: string, args: any): Promise<any> {
    const baseUrl = this.serviceStore.selectedService?.baseUrl || 'http://localhost:8188'

    switch (name) {
      case 'execute_workflow':
        return await this.executeWorkflow(baseUrl, args.batchCount || 1)

      case 'get_workflow':
        return await this.getWorkflow()

      case 'set_workflow':
        return await this.setWorkflow(args.workflow)

      case 'load_workflow':
        return await this.loadWorkflow(args.content)

      default:
        throw new Error(`未知工具: ${name}`)
    }
  }

  private async executeWorkflow(baseUrl: string, batchCount: number): Promise<any> {
    const result = await this.comfyUI.executeWorkflow(baseUrl, batchCount)
    return {
      success: result.success,
      promptId: result.promptId,
      outputs: result.outputs,
      error: result.outputError
    }
  }

  private async getWorkflow(): Promise<any> {
    const content = await this.comfyUI.fetchWorkflowFromIframe()
    return {
      content,
      success: true
    }
  }

  private async setWorkflow(content: string): Promise<any> {
    await this.comfyUI.loadWorkflowInComfyUI(content)
    return {
      success: true,
      message: '工作流已设置'
    }
  }

  private async loadWorkflow(workflow: any): Promise<any> {
    await this.comfyUI.loadWorkflowInComfyUI(JSON.stringify(workflow))
    return {
      success: true,
      message: '工作流已设置'
    }
  }
}
