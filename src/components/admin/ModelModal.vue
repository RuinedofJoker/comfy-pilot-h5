<template>
  <div v-if="visible" class="f-modal-overlay">
    <div class="f-modal" @click.stop>
      <!-- 模态框头部 -->
      <div class="f-modal-header">
        <h3 class="f-modal-title">
          {{ mode === 'create' ? '新建模型' : mode === 'edit' ? '编辑模型' : '查看模型' }}
        </h3>
        <button class="f-modal-close" @click="handleCancel">×</button>
      </div>

      <!-- 模态框内容 -->
      <div class="f-modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 模型名 -->
          <div class="f-form-item">
            <label class="f-label">
              模型名（调用时将使用该名字进行调用） <span class="f-required">*</span>
            </label>
            <input
              v-model="formData.modelName"
              type="text"
              class="f-input"
              placeholder="请输入模型名称"
              :disabled="mode === 'view'"
              :class="{ 'is-error': errors.modelName }"
            />
            <span v-if="errors.modelName" class="f-error-text">
              {{ errors.modelName }}
            </span>
          </div>

          <!-- 模型显示名称 -->
          <div class="f-form-item">
            <label class="f-label">模型显示名称</label>
            <input
              v-model="formData.modelDisplayName"
              type="text"
              class="f-input"
              placeholder="模型页面上的显示名称"
              :disabled="mode === 'view'"
            />
          </div>

          <!-- 模型标识符 -->
          <div class="f-form-item">
            <label class="f-label">模型标识符</label>
            <input
              v-model="formData.modelIdentifier"
              type="text"
              class="f-input"
              placeholder="全局唯一，应该与调用时指定的模型名称一致"
              :disabled="mode === 'view'"
            />
            <span class="f-hint-text">留空将使用模型名称做模型标识符</span>
          </div>

          <!-- 模型调用方式 -->
          <div class="f-form-item">
            <label class="f-label">
              模型调用方式 <span class="f-required">*</span>
            </label>
            <select
              v-model="formData.modelCallingType"
              class="f-select"
              :disabled="mode === 'view'"
              :class="{ 'is-error': errors.modelCallingType }"
              @change="handleCallingTypeChange"
            >
              <option value="">请选择模型调用方式</option>
              <option value="api_llm">API调用 - LLM模型</option>
              <option value="api_embedding">API调用 - Embedding模型</option>
              <option value="sentence_transformers_embedding">Sentence Transformers Embedding</option>
            </select>
            <span v-if="errors.modelCallingType" class="f-error-text">
              {{ errors.modelCallingType }}
            </span>
          </div>

          <!-- 提供商 -->
          <div class="f-form-item">
            <label class="f-label">模型提供商</label>
            <select
              v-model="formData.providerId"
              class="f-select"
              :disabled="mode === 'view'"
            >
              <option value="">不选择提供商</option>
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                {{ provider.providerName }}
              </option>
            </select>
          </div>

          <!-- API基础URL -->
          <div class="f-form-item">
            <label class="f-label">API基础URL</label>
            <input
              v-model="formData.apiBaseUrl"
              type="text"
              class="f-input"
              placeholder="请输入API基础URL"
              :disabled="mode === 'view'"
            />
          </div>

          <!-- API密钥 -->
          <div class="f-form-item">
            <label class="f-label">API密钥</label>
            <div class="f-input-wrapper">
              <input
                v-model="formData.apiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="f-input"
                placeholder="请输入API密钥"
                :disabled="mode === 'view'"
              />
              <button
                type="button"
                class="f-eye-btn"
                @click="showApiKey = !showApiKey"
              >
                <svg v-if="showApiKey" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 提供协议类型 -->
          <div class="f-form-item">
            <label class="f-label">提供协议类型</label>
            <select
              v-model="formData.providerType"
              class="f-select"
              :disabled="mode === 'view'"
            >
              <option value="">请选择协议类型</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <!-- 模型配置 -->
          <div v-if="formData.modelCallingType" class="f-form-item">
            <label class="f-label">
              模型配置（JSON格式） <span class="f-required">*</span>
            </label>
            <JsonEditor
              v-model="formData.modelConfig"
              :disabled="mode === 'view'"
              :schema="configSchema"
              height="200px"
              @blur="validateJsonConfig"
            />
            <span v-if="errors.modelConfig" class="f-error-text">
              {{ errors.modelConfig }}
            </span>
            <div v-if="configPlaceholder" class="f-hint-box">
              <div class="f-hint-title">配置格式说明：</div>
              <pre class="f-hint-json">{{ formattedConfigPlaceholder }}</pre>
            </div>
          </div>

          <!-- 描述 -->
          <div class="f-form-item">
            <label class="f-label">描述信息</label>
            <textarea
              v-model="formData.description"
              class="f-textarea"
              rows="3"
              placeholder="请输入描述信息"
              :disabled="mode === 'view'"
            ></textarea>
          </div>

          <!-- 是否启用 -->
          <div class="f-form-item">
            <label class="f-label">
              是否启用 <span class="f-required">*</span>
            </label>
            <div class="f-switch-wrapper">
              <label class="f-switch">
                <input
                  v-model="formData.isEnabled"
                  type="checkbox"
                  :disabled="mode === 'view'"
                />
                <span class="f-switch-slider"></span>
              </label>
              <span class="f-switch-label">
                {{ formData.isEnabled ? '已启用' : '已禁用' }}
              </span>
            </div>
          </div>
        </form>
      </div>

      <!-- 模态框底部 -->
      <div class="f-modal-footer">
        <button type="button" class="f-btn" @click="handleCancel">
          {{ mode === 'view' ? '关闭' : '取消' }}
        </button>
        <button
          v-if="mode !== 'view'"
          type="button"
          class="f-btn f-btn-primary"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? '提交中...' : '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { showToast } from 'vant'
import { modelProviderApi, aiModelApi } from '@/services/model'
import type { ModelProvider, AiModel, ModelCallingType, ProviderType } from '@/types/model'
import JsonEditor from '@/components/base/JsonEditor.vue'

// Props 定义
interface Props {
  visible: boolean
  mode: 'create' | 'edit' | 'view'
  modelId?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'create',
  modelId: undefined
})

// Emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

// 状态
const loading = ref(false)
const showApiKey = ref(false)
const providers = ref<ModelProvider[]>([])
const configPlaceholder = ref('')

// 表单数据
const formData = ref({
  modelName: '',
  modelIdentifier: '',
  modelDisplayName: '',
  modelCallingType: '' as ModelCallingType | '',
  providerId: '',
  apiBaseUrl: '',
  apiKey: '',
  providerType: '' as ProviderType | '',
  modelConfig: '',
  description: '',
  isEnabled: true
})

// 表单错误
const errors = ref<Record<string, string>>({})

// 配置 Schema（从 placeholder 中解析，只提取不带 $ 的 key）
const configSchema = computed(() => {
  if (!configPlaceholder.value) return undefined

  try {
    // 尝试从 placeholder 中提取 JSON
    const jsonMatch = configPlaceholder.value.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const fullSchema = JSON.parse(jsonMatch[0])

      // 只保留不带 $ 开头的 key
      const codeSchema: Record<string, any> = {}
      Object.keys(fullSchema).forEach(key => {
        if (!key.startsWith('$')) {
          codeSchema[key] = fullSchema[key]
        }
      })

      return codeSchema
    }
  } catch (e) {
    console.warn('无法解析配置 schema:', e)
  }

  return undefined
})

// 格式化的配置提示（用于显示，只显示带 $ 的 key，并去掉 $ 前缀）
const formattedConfigPlaceholder = computed(() => {
  if (!configPlaceholder.value) return ''

  try {
    // 尝试从 placeholder 中提取 JSON
    const jsonMatch = configPlaceholder.value.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const fullSchema = JSON.parse(jsonMatch[0])

      // 只保留带 $ 开头的 key，并去掉 $ 前缀
      const docSchema: Record<string, any> = {}
      Object.keys(fullSchema).forEach(key => {
        if (key.startsWith('$')) {
          const cleanKey = key.substring(1) // 去掉 $ 前缀
          docSchema[cleanKey] = fullSchema[key]
        }
      })

      return JSON.stringify(docSchema, null, 2)
    }
  } catch (e) {
    // 如果解析失败，返回原始文本
    return configPlaceholder.value
  }

  return configPlaceholder.value
})

/**
 * 验证 JSON 配置
 */
const validateJsonConfig = () => {
  if (!formData.value.modelConfig.trim()) {
    errors.value.modelConfig = '请输入模型配置'
    return
  }

  try {
    JSON.parse(formData.value.modelConfig)
    delete errors.value.modelConfig
  } catch (e: any) {
    errors.value.modelConfig = `JSON 格式错误: ${e.message}`
  }
}

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      loadProviders()
      if (props.mode === 'edit' || props.mode === 'view') {
        loadModelDetail()
      }
    }
  }
)

/**
 * 加载提供商列表
 */
const loadProviders = async () => {
  try {
    const data = await modelProviderApi.listProviders()
    providers.value = data || []
  } catch (error) {
    console.error('加载提供商列表失败:', error)
  }
}

/**
 * 加载模型详情
 */
const loadModelDetail = async () => {
  if (!props.modelId) return

  try {
    loading.value = true
    const model = await aiModelApi.getModelById(props.modelId)
    formData.value = {
      modelName: model.modelName,
      modelIdentifier: model.modelIdentifier,
      modelDisplayName: model.modelDisplayName,
      modelCallingType: model.modelCallingType,
      providerId: model.providerId || '',
      apiBaseUrl: model.apiBaseUrl || '',
      apiKey: model.apiKey || '',
      providerType: model.providerType || '',
      modelConfig: model.modelConfig || '{}',
      description: model.description || '',
      isEnabled: model.isEnabled
    }

    // 加载配置格式说明
    if (model.modelCallingType) {
      await loadConfigFormat(model.modelCallingType)
    }
  } catch (error) {
    showToast('加载模型详情失败')
    console.error('加载模型详情失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理模型调用方式变化
 */
const handleCallingTypeChange = async () => {
  if (formData.value.modelCallingType) {
    await loadConfigFormat(formData.value.modelCallingType)
  } else {
    configPlaceholder.value = ''
  }
}

/**
 * 加载模型配置格式说明
 */
const loadConfigFormat = async (callingType: ModelCallingType) => {
  try {
    // 调用获取模型配置格式说明接口
    const format = await aiModelApi.getModelConfigFormat(callingType)
    configPlaceholder.value = format || '请输入JSON格式的配置'
  } catch (error) {
    console.error('加载配置格式说明失败:', error)
    // 如果接口调用失败，使用默认提示
    const formatMap: Record<string, string> = {
      api_llm: '示例配置:\n{\n  "temperature": 0.7,\n  "max_tokens": 2000,\n  "top_p": 1.0\n}',
      api_embedding: '示例配置:\n{\n  "dimensions": 1536,\n  "batch_size": 100\n}',
      sentence_transformers_embedding: '示例配置:\n{\n  "model_name": "sentence-transformers/all-MiniLM-L6-v2",\n  "device": "cpu"\n}'
    }
    configPlaceholder.value = formatMap[callingType] || '请输入JSON格式的配置'
  }
}

/**
 * 表单验证
 */
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.modelName.trim()) {
    errors.value.modelName = '请输入模型名称'
  }

  if (!formData.value.modelCallingType) {
    errors.value.modelCallingType = '请选择模型调用方式'
  }

  if (!formData.value.modelConfig.trim()) {
    errors.value.modelConfig = '请输入模型配置'
  } else {
    // 验证JSON格式
    try {
      JSON.parse(formData.value.modelConfig)
    } catch (e) {
      errors.value.modelConfig = '模型配置必须是有效的JSON格式'
    }
  }

  return Object.keys(errors.value).length === 0
}

/**
 * 提交表单
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true

    if (props.mode === 'create') {
      await aiModelApi.createModel({
        modelName: formData.value.modelName,
        modelIdentifier: formData.value.modelIdentifier || undefined,
        modelCallingType: formData.value.modelCallingType as ModelCallingType,
        providerId: formData.value.providerId || undefined,
        apiBaseUrl: formData.value.apiBaseUrl || undefined,
        apiKey: formData.value.apiKey || undefined,
        providerType: (formData.value.providerType || undefined) as ProviderType | undefined,
        modelConfig: formData.value.modelConfig,
        description: formData.value.description || undefined,
        isEnabled: formData.value.isEnabled
      })

      showToast('创建成功')
      emit('success')
      handleCancel()
    } else if (props.mode === 'edit') {
      if (!props.modelId) return

      await aiModelApi.updateModel(props.modelId, {
        modelName: formData.value.modelName,
        modelCallingType: formData.value.modelCallingType as ModelCallingType,
        providerId: formData.value.providerId || undefined,
        apiBaseUrl: formData.value.apiBaseUrl || undefined,
        apiKey: formData.value.apiKey || undefined,
        providerType: (formData.value.providerType || undefined) as ProviderType | undefined,
        modelConfig: formData.value.modelConfig,
        description: formData.value.description || undefined,
        isEnabled: formData.value.isEnabled
      })

      showToast('更新成功')
      emit('success')
      handleCancel()
    }
  } catch (error) {
    showToast(props.mode === 'create' ? '创建失败' : '更新失败')
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 取消操作
 */
const handleCancel = () => {
  emit('update:visible', false)
  setTimeout(() => {
    formData.value = {
      modelName: '',
      modelIdentifier: '',
      modelDisplayName: '',
      modelCallingType: '',
      providerId: '',
      apiBaseUrl: '',
      apiKey: '',
      providerType: '',
      modelConfig: '',
      description: '',
      isEnabled: true
    }
    errors.value = {}
    showApiKey.value = false
    configPlaceholder.value = ''
  }, 300)
}
</script>

<style scoped lang="scss">
// 模态框遮罩层
.f-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

// 模态框容器
.f-modal {
  background: #2a2a2a;
  border-radius: 8px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

// 模态框头部
.f-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.f-modal-title {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
}

.f-modal-close {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #999999;
  font-size: 24px;
  line-height: 1;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  &:hover {
    color: #ffffff;
  }
}

// 模态框主体
.f-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

// 表单项
.f-form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.f-label {
  display: block;
  font-size: 14px;
  color: #cccccc;
  margin-bottom: 8px;
}

.f-required {
  color: #ff4d4f;
  margin-left: 2px;
}

// 输入框
.f-input {
  width: 100%;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  transition: border-color 0.15s;

  &::placeholder {
    color: #666666;
  }

  &:focus {
    outline: none;
    border-color: #4a9eff;
  }

  &:disabled {
    background: #2a2a2a;
    color: #666666;
    cursor: not-allowed;
  }

  &.is-error {
    border-color: #ff4d4f;
  }
}

// 下拉选择框
.f-select {
  width: 100%;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.15s;

  &:focus {
    outline: none;
    border-color: #4a9eff;
  }

  &:disabled {
    background: #2a2a2a;
    color: #666666;
    cursor: not-allowed;
  }

  &.is-error {
    border-color: #ff4d4f;
  }

  option {
    background: #1a1a1a;
    color: #ffffff;
  }
}

// 文本域
.f-textarea {
  width: 100%;
  padding: 8px 12px;
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: border-color 0.15s;

  &::placeholder {
    color: #666666;
  }

  &:focus {
    outline: none;
    border-color: #4a9eff;
  }

  &:disabled {
    background: #2a2a2a;
    color: #666666;
    cursor: not-allowed;
  }

  &.is-error {
    border-color: #ff4d4f;
  }
}

// 输入框包装器（用于密码显示切换）
.f-input-wrapper {
  position: relative;
  width: 100%;

  .f-input {
    padding-right: 40px;
  }
}

.f-eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #999999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;

  svg {
    width: 18px;
    height: 18px;
    stroke-width: 2;
  }

  &:hover {
    color: #4a9eff;
  }
}

// 开关组件
.f-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.f-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .f-switch-slider {
      background-color: #4a9eff;

      &:before {
        transform: translateX(20px);
      }
    }

    &:disabled + .f-switch-slider {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.f-switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #3a3a3a;
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
}

.f-switch-label {
  font-size: 14px;
  color: #cccccc;
}

// 错误提示文本
.f-error-text {
  display: block;
  font-size: 12px;
  color: #ff4d4f;
  margin-top: 4px;
}

// 提示文本
.f-hint-text {
  display: block;
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
}

// 提示框
.f-hint-box {
  margin-top: 8px;
  padding: 12px;
  background: #1a1a1a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
}

.f-hint-title {
  font-size: 12px;
  color: #999999;
  margin-bottom: 8px;
}

.f-hint-json {
  margin: 0;
  padding: 8px;
  background: #0d0d0d;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: #4a9eff;
  overflow-x: auto;
  white-space: pre;
  line-height: 1.5;
}

// 模态框底部
.f-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 按钮样式
.f-btn {
  padding: 8px 16px;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  background: #2a2a2a;
  color: #cccccc;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #3a3a3a;
    border-color: #4a4a4a;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover {
      background: #5aa8ff;
    }
  }
}
</style>
