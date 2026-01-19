<template>
  <div v-if="visible" class="g-provider-modal-overlay" @click.self="handleCancel">
    <div class="m-provider-modal">
      <!-- 标题栏 -->
      <div class="m-modal-header">
        <h3>{{ modalTitle }}</h3>
        <button class="f-close-btn" @click="handleCancel">×</button>
      </div>

      <!-- 表单内容 -->
      <div class="m-modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- 提供商名称 -->
          <div class="f-form-item">
            <label class="f-label">
              提供商名称 <span class="f-required">*</span>
            </label>
            <input
              v-model="formData.providerName"
              type="text"
              class="f-input"
              placeholder="请输入提供商名称"
              :disabled="mode === 'view'"
              :class="{ 'is-error': errors.providerName }"
            />
            <span v-if="errors.providerName" class="f-error-text">
              {{ errors.providerName }}
            </span>
          </div>

          <!-- 提供商协议类型 -->
          <div class="f-form-item">
            <label class="f-label">
              提供商协议类型 <span class="f-required">*</span>
            </label>
            <select
              v-model="formData.providerType"
              class="f-select"
              :disabled="mode === 'view'"
              :class="{ 'is-error': errors.providerType }"
            >
              <option value="" disabled>请选择协议类型</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
            <span v-if="errors.providerType" class="f-error-text">
              {{ errors.providerType }}
            </span>
          </div>

          <!-- API基础URL -->
          <div class="f-form-item">
            <label class="f-label">
              API基础URL <span class="f-required">*</span>
            </label>
            <input
              v-model="formData.apiBaseUrl"
              type="text"
              class="f-input"
              placeholder="例如: https://api.openai.com/v1"
              :disabled="mode === 'view'"
              :class="{ 'is-error': errors.apiBaseUrl }"
            />
            <span v-if="errors.apiBaseUrl" class="f-error-text">
              {{ errors.apiBaseUrl }}
            </span>
          </div>

          <!-- API密钥 -->
          <div class="f-form-item">
            <label class="f-label">
              API密钥 <span class="f-required">*</span>
            </label>
            <div class="f-input-wrapper">
              <input
                v-model="formData.apiKey"
                :type="showApiKey ? 'text' : 'password'"
                class="f-input"
                placeholder="请输入API密钥"
                :disabled="mode === 'view'"
                :class="{ 'is-error': errors.apiKey }"
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
            <span v-if="errors.apiKey" class="f-error-text">
              {{ errors.apiKey }}
            </span>
          </div>

          <!-- 是否启用 -->
          <div class="f-form-item">
            <label class="f-label">
              是否启用 <span class="f-required">*</span>
            </label>
            <div class="f-switch-wrapper">
              <input
                v-model="formData.isEnabled"
                type="checkbox"
                class="f-switch"
                :disabled="mode === 'view'"
              />
              <span class="f-switch-label">
                {{ formData.isEnabled ? '已启用' : '已禁用' }}
              </span>
            </div>
          </div>

          <!-- 描述信息 -->
          <div class="f-form-item">
            <label class="f-label">描述信息</label>
            <textarea
              v-model="formData.description"
              class="f-textarea"
              placeholder="请输入描述信息(可选)"
              :disabled="mode === 'view'"
              rows="3"
            ></textarea>
          </div>
        </form>
      </div>

      <!-- 底部按钮 -->
      <div class="m-modal-footer">
        <button class="f-btn" @click="handleCancel">
          {{ mode === 'view' ? '关闭' : '取消' }}
        </button>
        <button
          v-if="mode !== 'view'"
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
import { ref, computed, watch } from 'vue'
import type { ModelProvider } from '@/types/model'
import { modelProviderApi } from '@/services/model'
import { showToast } from 'vant'

// Props 定义
interface Props {
  visible: boolean
  mode: 'create' | 'edit' | 'view'
  providerId?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'create',
  providerId: undefined
})

// Emits 定义
const emit = defineEmits<{
  'update:visible': [value: boolean]
  success: []
}>()

// 表单数据
interface FormData {
  providerName: string
  providerType: string
  apiBaseUrl: string
  apiKey: string
  isEnabled: boolean
  description?: string
}

const formData = ref<FormData>({
  providerName: '',
  providerType: '',
  apiBaseUrl: '',
  apiKey: '',
  isEnabled: true,
  description: ''
})

// 表单错误
const errors = ref<Partial<Record<keyof FormData, string>>>({})

// 加载状态
const loading = ref(false)

// API密钥可见性状态
const showApiKey = ref(false)

// 计算属性 - 弹窗标题
const modalTitle = computed(() => {
  const titles = {
    create: '新建提供商',
    edit: '编辑提供商',
    view: '查看提供商'
  }
  return titles[props.mode]
})

// 表单验证
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  if (!formData.value.providerName?.trim()) {
    errors.value.providerName = '请输入提供商名称'
    isValid = false
  }

  if (!formData.value.providerType?.trim()) {
    errors.value.providerType = '请输入提供商类型'
    isValid = false
  }

  if (!formData.value.apiBaseUrl?.trim()) {
    errors.value.apiBaseUrl = '请输入API基础URL'
    isValid = false
  } else if (!/^https?:\/\/.+/.test(formData.value.apiBaseUrl)) {
    errors.value.apiBaseUrl = '请输入有效的URL地址'
    isValid = false
  }

  if (!formData.value.apiKey?.trim()) {
    errors.value.apiKey = '请输入API密钥'
    isValid = false
  }

  return isValid
}

// 加载提供商详情
const loadProviderDetail = async () => {
  if (!props.providerId) return

  try {
    loading.value = true
    const provider = await modelProviderApi.getProviderById(props.providerId)
    formData.value = {
      providerName: provider.providerName,
      providerType: provider.providerType,
      apiBaseUrl: provider.apiBaseUrl || '',
      apiKey: provider.apiKey || '',
      isEnabled: provider.isEnabled,
      description: provider.description || ''
    }
  } catch (error) {
    showToast('加载提供商详情失败')
    console.error('加载提供商详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true

    if (props.mode === 'create') {
      // 创建提供商
      await modelProviderApi.createProvider({
        providerName: formData.value.providerName,
        providerType: formData.value.providerType,
        apiBaseUrl: formData.value.apiBaseUrl,
        apiKey: formData.value.apiKey,
        isEnabled: formData.value.isEnabled,
        description: formData.value.description
      })

      showToast('创建成功')
      emit('success')
      handleCancel()
    } else if (props.mode === 'edit' && props.providerId) {
      // 编辑提供商
      await modelProviderApi.updateProvider(props.providerId, {
        providerName: formData.value.providerName,
        providerType: formData.value.providerType,
        apiBaseUrl: formData.value.apiBaseUrl,
        apiKey: formData.value.apiKey,
        isEnabled: formData.value.isEnabled,
        description: formData.value.description
      })

      showToast('更新成功')
      emit('success')
      handleCancel()
    }
  } catch (error) {
    showToast('操作失败')
    console.error('提交失败:', error)
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  emit('update:visible', false)
  // 重置表单
  setTimeout(() => {
    formData.value = {
      providerName: '',
      providerType: '',
      apiBaseUrl: '',
      apiKey: '',
      isEnabled: true,
      description: ''
    }
    errors.value = {}
    showApiKey.value = false // 重置密码可见性状态
  }, 300)
}

// 监听弹窗显示状态
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && (props.mode === 'edit' || props.mode === 'view')) {
      loadProviderDetail()
    }
  }
)
</script>

<style scoped lang="scss">
.g-provider-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.m-provider-modal {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.m-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h3 {
    font-size: 15px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
}

.f-close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999999;
  cursor: pointer;
  padding: 0;
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

.m-modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.f-form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.f-label {
  display: block;
  font-size: 12px;
  color: #cccccc;
  margin-bottom: 6px;
}

.f-required {
  color: #ff4444;
  margin-left: 2px;
}

.f-input,
.f-select,
.f-textarea {
  width: 100%;
  padding: 8px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  outline: none;
  transition: border-color 0.15s;

  &:focus {
    border-color: #4a9eff;
  }

  &:disabled {
    background: #252525;
    color: #666666;
    cursor: not-allowed;
  }

  &.is-error {
    border-color: #ff4444;
  }

  &::placeholder {
    color: #666666;
  }
}

.f-select {
  cursor: pointer;

  option {
    background: #1e1e1e;
    color: #cccccc;
    padding: 8px;

    &:disabled {
      color: #666666;
    }
  }
}

.f-textarea {
  resize: vertical;
  min-height: 60px;
}

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

.f-error-text {
  display: block;
  font-size: 11px;
  color: #ff4444;
  margin-top: 4px;
}

.f-switch-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.f-switch {
  position: relative;
  width: 40px;
  height: 20px;
  appearance: none;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  outline: none;

  &:checked {
    background: #4a9eff;
    border-color: #4a9eff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    background: #ffffff;
    border-radius: 50%;
    transition: transform 0.3s;
  }

  &:checked::before {
    transform: translateX(20px);
  }
}

.f-switch-label {
  font-size: 12px;
  color: #cccccc;
}

.m-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.f-btn {
  padding: 8px 16px;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #454545;
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover:not(:disabled) {
      background: #5aa8ff;
    }
  }
}
</style>
