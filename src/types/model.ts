/**
 * 模型相关类型定义
 */

/**
 * 模型调用方式类型
 */
export type ModelCallingType =
  | 'api_llm'                              // API调用 - LLM模型
  | 'api_embedding'                        // API调用 - Embedding模型
  | 'sentence_transformers_embedding'      // Sentence Transformers Embedding

/**
 * 模型调用方式常量
 */
export const ModelCallingType = {
  API_LLM: 'api_llm' as const,
  API_EMBEDDING: 'api_embedding' as const,
  SENTENCE_TRANSFORMERS_EMBEDDING: 'sentence_transformers_embedding' as const
} as const

/**
 * 模型接入方式类型
 */
export type AccessType =
  | 'remote_api'    // 远程API
  | 'local'         // 本地部署

/**
 * 模型接入方式常量
 */
export const AccessType = {
  REMOTE_API: 'remote_api' as const,
  LOCAL: 'local' as const
} as const

/**
 * 模型类型
 */
export type ModelType =
  | 'llm'                          // 大语言模型
  | 'embedding'                    // 嵌入模型
  | 'sentiment_classification'     // 情感分类
  | 'token_classification'         // 标记分类
  | 'image_generation'             // 图像生成
  | 'speech_recognition'           // 语音识别
  | 'text_to_speech'               // 文本转语音

/**
 * 模型类型常量
 */
export const ModelType = {
  LLM: 'llm' as const,
  EMBEDDING: 'embedding' as const,
  SENTIMENT_CLASSIFICATION: 'sentiment_classification' as const,
  TOKEN_CLASSIFICATION: 'token_classification' as const,
  IMAGE_GENERATION: 'image_generation' as const,
  SPEECH_RECOGNITION: 'speech_recognition' as const,
  TEXT_TO_SPEECH: 'text_to_speech' as const
} as const

/**
 * AI模型信息
 */
export interface AiModel {
  /** 模型ID */
  id: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 模型名称 */
  modelName: string
  /** 模型标识符 */
  modelIdentifier: string
  /** 接入方式 */
  accessType: AccessType
  /** 模型类型 */
  modelType: ModelType
  /** 模型调用方式 */
  modelCallingType: ModelCallingType
  /** API基础URL */
  apiBaseUrl?: string
  /** 提供商ID */
  providerId?: string
  /** 提供协议类型 */
  providerType?: string
  /** 模型配置(JSON格式) */
  modelConfig?: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}

/**
 * 模型提供商信息
 */
export interface ModelProvider {
  /** 提供商ID */
  id: string
  /** 创建时间 */
  createTime: string
  /** 更新时间 */
  updateTime: string
  /** 提供商名称 */
  providerName: string
  /** 提供商类型 */
  providerType: string
  /** API基础URL */
  apiBaseUrl?: string
  /** API密钥 */
  apiKey?: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}

/**
 * 创建模型请求
 */
export interface CreateModelRequest {
  /** 模型名称 */
  modelName: string
  /** 模型标识符(可选) */
  modelIdentifier?: string
  /** 模型调用方式 */
  modelCallingType: ModelCallingType
  /** API基础URL */
  apiBaseUrl?: string
  /** 提供商ID */
  providerId?: string
  /** 提供协议类型 */
  providerType?: string
  /** 模型配置(JSON格式) */
  modelConfig?: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}

/**
 * 更新模型请求
 */
export interface UpdateModelRequest {
  /** 模型名称 */
  modelName: string
  /** 模型调用方式 */
  modelCallingType: ModelCallingType
  /** API基础URL */
  apiBaseUrl?: string
  /** 提供商ID */
  providerId?: string
  /** 提供协议类型 */
  providerType?: string
  /** 模型配置(JSON格式) */
  modelConfig?: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}

/**
 * 创建提供商请求
 */
export interface CreateProviderRequest {
  /** 提供商名称 */
  providerName: string
  /** 提供商类型 */
  providerType: string
  /** API基础URL */
  apiBaseUrl?: string
  /** API密钥 */
  apiKey: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}

/**
 * 更新提供商请求
 */
export interface UpdateProviderRequest {
  /** 提供商名称 */
  providerName: string
  /** 提供商类型 */
  providerType: string
  /** API基础URL */
  apiBaseUrl?: string
  /** API密钥 */
  apiKey: string
  /** 描述信息 */
  description?: string
  /** 是否启用 */
  isEnabled: boolean
}
