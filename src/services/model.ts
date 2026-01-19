/**
 * 模型管理相关 API 服务
 */
import request from './http'
import type {
  ModelProvider,
  AiModel,
  CreateProviderRequest,
  UpdateProviderRequest,
  CreateModelRequest,
  UpdateModelRequest
} from '@/types/model'

/**
 * 模型提供商 API
 */
export const modelProviderApi = {
  /**
   * 查询所有提供商
   */
  listProviders: (): Promise<ModelProvider[]> => {
    return request.get('/api/v1/model-providers')
  },

  /**
   * 根据ID查询提供商
   */
  getProviderById: (id: string): Promise<ModelProvider> => {
    return request.get(`/api/v1/model-providers/${id}`)
  },

  /**
   * 创建模型提供商
   */
  createProvider: (data: CreateProviderRequest): Promise<ModelProvider> => {
    return request.post('/api/v1/model-providers', data)
  },

  /**
   * 更新提供商
   */
  updateProvider: (id: string, data: UpdateProviderRequest): Promise<ModelProvider> => {
    return request.put(`/api/v1/model-providers/${id}`, data)
  },

  /**
   * 删除提供商
   */
  deleteProvider: (id: string): Promise<void> => {
    return request.delete(`/api/v1/model-providers/${id}`)
  }
}

/**
 * AI 模型 API
 */
export const aiModelApi = {
  /**
   * 查询所有AI模型
   */
  listModels: (): Promise<AiModel[]> => {
    return request.get('/api/v1/models')
  },

  /**
   * 根据ID查询AI模型
   */
  getModelById: (id: string): Promise<AiModel> => {
    return request.get(`/api/v1/models/${id}`)
  },

  /**
   * 创建AI模型
   */
  createModel: (data: CreateModelRequest): Promise<AiModel> => {
    return request.post('/api/v1/models', data)
  },

  /**
   * 更新AI模型
   */
  updateModel: (id: string, data: UpdateModelRequest): Promise<AiModel> => {
    return request.put(`/api/v1/models/${id}`, data)
  },

  /**
   * 删除AI模型
   */
  deleteModel: (id: string): Promise<void> => {
    return request.delete(`/api/v1/models/${id}`)
  },

  /**
   * 启用AI模型
   */
  enableModel: (id: string): Promise<void> => {
    return request.post(`/api/v1/models/${id}/enable`)
  },

  /**
   * 禁用AI模型
   */
  disableModel: (id: string): Promise<void> => {
    return request.post(`/api/v1/models/${id}/disable`)
  }
}
