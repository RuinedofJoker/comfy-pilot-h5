/**
 * 模型相关类型定义
 */

/**
 * 模型调用方式枚举
 */
export enum ModelCallingType {
  /** API调用 - LLM模型 */
  API_LLM = 'api_llm',
  /** API调用 - Embedding模型 */
  API_EMBEDDING = 'api_embedding',
  /** Sentence Transformers Embedding */
  SENTENCE_TRANSFORMERS_EMBEDDING = 'sentence_transformers_embedding'
}

/**
 * 模型接入方式枚举
 */
export enum AccessType {
  /** 远程API */
  REMOTE_API = 'remote_api',
  /** 本地部署 */
  LOCAL = 'local'
}

/**
 * 模型类型枚举
 */
export enum ModelType {
  /** 大语言模型 */
  LLM = 'llm',
  /** 嵌入模型 */
  EMBEDDING = 'embedding',
  /** 情感分类 */
  SENTIMENT_CLASSIFICATION = 'sentiment_classification',
  /** 标记分类 */
  TOKEN_CLASSIFICATION = 'token_classification',
  /** 图像生成 */
  IMAGE_GENERATION = 'image_generation',
  /** 语音识别 */
  SPEECH_RECOGNITION = 'speech_recognition',
  /** 文本转语音 */
  TEXT_TO_SPEECH = 'text_to_speech'
}

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
