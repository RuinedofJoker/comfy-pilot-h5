<template>
  <div class="g-model-management-view">
    <!-- 顶部标题栏 -->
    <div class="m-header">
      <h1>AI 模型管理</h1>
      <div class="f-header-actions">
        <button class="f-btn f-btn-primary" @click="handleCreateProvider">
          + 新建提供商
        </button>
        <button class="f-btn f-btn-primary" @click="handleCreateModel">
          + 新建模型
        </button>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="m-content">
      <!-- 标签页 -->
      <div class="m-tabs">
        <button
          class="f-tab"
          :class="{ active: activeTab === 'providers' }"
          @click="activeTab = 'providers'"
        >
          模型提供商
        </button>
        <button
          class="f-tab"
          :class="{ active: activeTab === 'models' }"
          @click="activeTab = 'models'"
        >
          AI 模型列表
        </button>
      </div>

      <!-- 提供商标签页 -->
      <div v-show="activeTab === 'providers'" class="m-tab-content">
        <div class="f-providers">
          <div
            v-for="provider in providers"
            :key="provider.id"
            class="f-provider-card"
          >
            <div class="f-provider-header">
              <div>
                <div class="f-provider-name">{{ provider.providerName }}</div>
                <div class="f-provider-code">{{ provider.providerType }}</div>
              </div>
            </div>
            <div class="f-provider-actions">
              <button class="f-btn" @click="handleViewProvider(provider.id)">查看</button>
              <button class="f-btn" @click="handleEditProvider(provider.id)">编辑</button>
              <button class="f-btn f-btn-danger" @click="handleDeleteProvider(provider.id)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 模型列表标签页 -->
      <div v-show="activeTab === 'models'" class="m-tab-content">
        <div class="m-table-container">
          <div class="m-table-header">
            <span class="f-table-title">AI 模型列表</span>
            <div class="f-filters">
              <input
                v-model="searchKeyword"
                type="text"
                class="f-search"
                placeholder="搜索模型..."
              />
            </div>
          </div>
          <table class="f-table">
            <thead>
              <tr>
                <th>模型名称</th>
                <th>模型标识符</th>
                <th>调用方式</th>
                <th>接入方式</th>
                <th>模型类型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="model in filteredModels" :key="model.id">
                <td><span class="f-model-name">{{ model.modelName }}</span></td>
                <td>{{ model.modelIdentifier }}</td>
                <td>
                  <span class="f-tag" :class="`calling-${model.modelCallingType}`">
                    {{ getModelCallingTypeLabel(model.modelCallingType) }}
                  </span>
                </td>
                <td>
                  <span class="f-tag" :class="`access-${model.accessType}`">
                    {{ getAccessTypeLabel(model.accessType) }}
                  </span>
                </td>
                <td>
                  <span class="f-tag" :class="`type-${model.modelType}`">
                    {{ getModelTypeLabel(model.modelType) }}
                  </span>
                </td>
                <td>
                  <div class="f-actions">
                    <button class="f-btn" @click="handleViewModel(model.id)">查看</button>
                    <button class="f-btn" @click="handleEditModel(model.id)">编辑</button>
                    <button class="f-btn f-btn-danger" @click="handleDeleteModel(model.id)">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- 提供商弹窗 -->
    <ProviderModal
      v-model:visible="providerModalVisible"
      :mode="providerModalMode"
      :provider-id="currentProviderId"
      @success="handleProviderSuccess"
    />

    <!-- 模型弹窗 -->
    <ModelModal
      v-model:visible="modelModalVisible"
      :mode="modelModalMode"
      :model-id="currentModelId"
      @success="handleModelSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ModelProvider, AiModel } from '@/types/model'
import { ModelCallingType, AccessType, ModelType } from '@/types/model'
import { modelProviderApi, aiModelApi } from '@/services/model'
import { showToast, showConfirmDialog } from 'vant'
import ProviderModal from '@/components/admin/ProviderModal.vue'
import ModelModal from '@/components/admin/ModelModal.vue'

// 辅助函数 - 获取模型调用方式标签
const getModelCallingTypeLabel = (type: ModelCallingType): string => {
  const labels: Record<ModelCallingType, string> = {
    [ModelCallingType.API_LLM]: 'API LLM',
    [ModelCallingType.API_EMBEDDING]: 'API Embedding',
    [ModelCallingType.SENTENCE_TRANSFORMERS_EMBEDDING]: 'Sentence Transformers'
  }
  return labels[type] || type
}

// 辅助函数 - 获取接入方式标签
const getAccessTypeLabel = (type: AccessType): string => {
  const labels: Record<AccessType, string> = {
    [AccessType.REMOTE_API]: '远程API',
    [AccessType.LOCAL]: '本地部署'
  }
  return labels[type] || type
}

// 辅助函数 - 获取模型类型标签
const getModelTypeLabel = (type: ModelType): string => {
  const labels: Record<ModelType, string> = {
    [ModelType.LLM]: '大语言模型',
    [ModelType.EMBEDDING]: '嵌入模型',
    [ModelType.SENTIMENT_CLASSIFICATION]: '情感分类',
    [ModelType.TOKEN_CLASSIFICATION]: '标记分类',
    [ModelType.IMAGE_GENERATION]: '图像生成',
    [ModelType.SPEECH_RECOGNITION]: '语音识别',
    [ModelType.TEXT_TO_SPEECH]: '文本转语音'
  }
  return labels[type] || type
}

// 状态
const activeTab = ref<'providers' | 'models'>('providers')
const searchKeyword = ref('')
const loading = ref(false)

// 提供商弹窗状态
const providerModalVisible = ref(false)
const providerModalMode = ref<'create' | 'edit' | 'view'>('create')
const currentProviderId = ref<string>()

// 模型弹窗状态
const modelModalVisible = ref(false)
const modelModalMode = ref<'create' | 'edit' | 'view'>('create')
const currentModelId = ref<string>()

// 数据列表
const providers = ref<ModelProvider[]>([])
const models = ref<AiModel[]>([])

// 加载提供商列表
const loadProviders = async () => {
  try {
    loading.value = true
    const data = await modelProviderApi.listProviders()
    providers.value = data || []
  } catch (error) {
    showToast('加载提供商列表失败')
    console.error('加载提供商列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载模型列表
const loadModels = async () => {
  try {
    loading.value = true
    const data = await aiModelApi.listModels()
    models.value = data || []
  } catch (error) {
    showToast('加载模型列表失败')
    console.error('加载模型列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 计算属性 - 过滤后的模型列表
const filteredModels = computed(() => {
  if (!searchKeyword.value) {
    return models.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return models.value.filter(
    m => m.modelName.toLowerCase().includes(keyword) ||
         m.modelIdentifier.toLowerCase().includes(keyword)
  )
})

// 提供商操作函数
const handleCreateProvider = () => {
  providerModalMode.value = 'create'
  currentProviderId.value = undefined
  providerModalVisible.value = true
}

const handleViewProvider = (providerId: string) => {
  providerModalMode.value = 'view'
  currentProviderId.value = providerId
  providerModalVisible.value = true
}

const handleEditProvider = (providerId: string) => {
  providerModalMode.value = 'edit'
  currentProviderId.value = providerId
  providerModalVisible.value = true
}

const handleDeleteProvider = async (providerId: string) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该提供商吗？删除后无法恢复。',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      className: 'custom-confirm-dialog'
    })

    loading.value = true
    await modelProviderApi.deleteProvider(providerId)
    showToast('删除成功')
    loadProviders()
  } catch (error) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel') {
      showToast('删除失败')
      console.error('删除提供商失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 提供商操作成功回调
const handleProviderSuccess = () => {
  loadProviders()
}

// 模型操作函数
const handleCreateModel = () => {
  modelModalMode.value = 'create'
  currentModelId.value = undefined
  modelModalVisible.value = true
}

const handleViewModel = (modelId: string) => {
  modelModalMode.value = 'view'
  currentModelId.value = modelId
  modelModalVisible.value = true
}

const handleEditModel = (modelId: string) => {
  modelModalMode.value = 'edit'
  currentModelId.value = modelId
  modelModalVisible.value = true
}

const handleDeleteModel = async (modelId: string) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除该模型吗？删除后无法恢复。',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      className: 'custom-confirm-dialog'
    })

    loading.value = true
    await aiModelApi.deleteModel(modelId)
    showToast('删除成功')
    loadModels()
  } catch (error) {
    // 用户取消删除时不显示错误
    if (error !== 'cancel') {
      showToast('删除失败')
      console.error('删除模型失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 模型操作成功回调
const handleModelSuccess = () => {
  loadModels()
}

// 生命周期钩子
onMounted(() => {
  loadProviders()
  loadModels()
})
</script>

<style scoped lang="scss">
.g-model-management-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.m-header {
  padding: 12px 20px;
  background: #282828;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 15px;
    font-weight: 500;
    color: #ffffff;
    margin: 0;
  }
}

.f-header-actions {
  display: flex;
  gap: 8px;
}

.f-btn {
  padding: 6px 10px;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background: #454545;
    color: #ffffff;
  }

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover {
      background: #5aa8ff;
    }
  }

  &-danger {
    background: #3a3a3a;
    border-color: #d9534f;
    color: #d9534f;

    &:hover {
      background: #d9534f;
      color: #ffffff;
    }
  }
}

.m-content {
  flex: 1;
  overflow-y: auto;
}

.m-tabs {
  display: flex;
  gap: 4px;
  padding: 16px 16px 0;
  border-bottom: 1px solid #3a3a3a;
  background: #252525;
}

.f-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  font-size: 12px;
  color: #999999;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;

  &:hover {
    color: #cccccc;
  }

  &.active {
    color: #4a9eff;
    border-bottom-color: #4a9eff;
  }
}

.m-tab-content {
  padding: 16px;
}

.f-providers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.f-provider-card {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  padding: 12px;
  transition: all 0.15s;

  &:hover {
    background: #333333;
    border-color: #444444;
  }
}

.f-provider-header {
  margin-bottom: 12px;
}

.f-provider-name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.f-provider-code {
  font-size: 11px;
  color: #777777;
  margin-top: 2px;
  font-family: 'Consolas', monospace;
}

.f-provider-actions {
  display: flex;
  gap: 6px;

  .f-btn {
    flex: 1;
    padding: 4px 8px;
    font-size: 11px;
  }
}

.m-table-container {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  overflow-x: auto;
}

.m-table-header {
  padding: 12px 16px;
  border-bottom: 1px solid #3a3a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.f-table-title {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.f-filters {
  display: flex;
  gap: 8px;
}

.f-search {
  padding: 6px 10px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  width: 180px;
  outline: none;

  &:focus {
    border-color: #555555;
  }

  &::placeholder {
    color: #666666;
  }
}

.f-table {
  width: 100%;
  border-collapse: collapse;

  th {
    padding: 10px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 500;
    color: #999999;
    background: #282828;
    border-bottom: 1px solid #3a3a3a;
  }

  td {
    padding: 10px 16px;
    font-size: 12px;
    color: #cccccc;
    border-bottom: 1px solid #3a3a3a;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #2d2d2d;
  }
}

.f-model-name {
  color: #ffffff;
  font-weight: 500;
}

.f-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;

  // 模型调用方式样式
  &.calling-api_llm {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  &.calling-api_embedding {
    background: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }

  &.calling-sentence_transformers_embedding {
    background: rgba(233, 30, 99, 0.15);
    color: #e91e63;
  }

  // 接入方式样式
  &.access-remote_api {
    background: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }

  &.access-local {
    background: rgba(255, 152, 0, 0.15);
    color: #ff9800;
  }

  // 模型类型样式
  &.type-llm {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  &.type-embedding {
    background: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }

  &.type-sentiment_classification {
    background: rgba(255, 193, 7, 0.15);
    color: #ffc107;
  }

  &.type-token_classification {
    background: rgba(0, 188, 212, 0.15);
    color: #00bcd4;
  }

  &.type-image_generation {
    background: rgba(233, 30, 99, 0.15);
    color: #e91e63;
  }

  &.type-speech_recognition {
    background: rgba(103, 58, 183, 0.15);
    color: #673ab7;
  }

  &.type-text_to_speech {
    background: rgba(63, 81, 181, 0.15);
    color: #3f51b5;
  }
}

.f-actions {
  display: flex;
  gap: 4px;

  .f-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>

<style lang="scss">
// 自定义确认对话框样式（全局样式）
.custom-confirm-dialog {
  .van-dialog__header {
    padding-top: 20px;
    font-size: 16px;
    font-weight: 500;
  }

  .van-dialog__message {
    padding: 16px 24px;
    font-size: 14px;
    line-height: 1.6;
  }

  .van-dialog__footer {
    padding: 12px 16px;
    display: flex;
    gap: 12px;
  }

  .van-dialog__cancel,
  .van-dialog__confirm {
    flex: 1;
    height: 36px;
    font-size: 14px;
    border-radius: 4px;
  }

  .van-dialog__cancel {
    background: #3a3a3a;
    border: 1px solid #555555;
    color: #cccccc;
  }

  .van-dialog__confirm {
    background: #d9534f !important;
    border: none;
    color: #ffffff !important;
  }
}
</style>
