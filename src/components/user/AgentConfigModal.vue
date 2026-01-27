<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '800px', height: '80vh' }"
    round
    closeable
    @close="handleClose"
    @update:show="emit('update:visible', $event)"
  >
    <div class="m-agent-config-modal">
      <h3 class="f-modal-title">Agent 配置管理</h3>

      <div class="f-modal-body">
        <!-- 左侧 Agent 列表 -->
        <div class="f-agent-list">
          <div
            v-for="agent in userAgentConfigStore.runtimeAgents"
            :key="agent.agentCode"
            class="f-agent-card"
            :class="{ active: selectedAgentCode === agent.agentCode }"
            @click="handleSelectAgent(agent.agentCode)"
          >
            <div class="f-agent-card-header">
              <h4 class="f-agent-name">{{ agent.agentName }}</h4>
              <span v-if="hasUserConfig(agent.agentCode)" class="f-config-badge">已配置</span>
            </div>
            <p v-if="agent.description" class="f-agent-description">{{ agent.description }}</p>
          </div>
        </div>

        <!-- 右侧配置表单 -->
        <div class="f-config-form">
          <div v-if="!selectedAgentCode" class="f-empty-state">
            <svg class="f-icon-large" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>请选择左侧的 Agent 进行配置</p>
          </div>

          <div v-else-if="selectedAgent" class="f-config-content">
            <div class="f-config-header">
              <h4 class="f-config-title">{{ selectedAgent.agentName }} 配置</h4>
              <p v-if="selectedAgent.description" class="f-config-description">
                {{ selectedAgent.description }}
              </p>
            </div>

            <!-- Agent 配置表单 -->
            <div v-if="agentConfigDefinitions.length > 0" class="f-form-section">
              <div
                v-for="config in agentConfigDefinitions"
                v-show="config.userOverride"
                :key="config.name"
                class="f-form-item"
              >
                <label class="f-label">
                  {{ config.description || config.name }}
                  <span v-if="config.require" class="f-required">*</span>
                </label>

                <!-- STRING 类型 -->
                <van-field
                  v-if="config.type === 'STRING'"
                  v-model="agentConfigValues[config.name]"
                  :placeholder="`请输入${config.description || config.name}`"
                  :border="false"
                  class="f-input"
                />

                <!-- TEXT 类型 -->
                <van-field
                  v-else-if="config.type === 'TEXT'"
                  v-model="agentConfigValues[config.name]"
                  type="textarea"
                  :placeholder="`请输入${config.description || config.name}`"
                  :border="false"
                  class="f-input"
                  rows="3"
                />

                <!-- INT 类型 -->
                <van-field
                  v-else-if="config.type === 'INT'"
                  v-model.number="agentConfigValues[config.name]"
                  type="number"
                  :placeholder="getNumberPlaceholder(config, 'INT')"
                  :border="false"
                  class="f-input"
                />

                <!-- FLOAT 类型 -->
                <van-field
                  v-else-if="config.type === 'FLOAT'"
                  v-model.number="agentConfigValues[config.name]"
                  type="number"
                  step="0.01"
                  :placeholder="getNumberPlaceholder(config, 'FLOAT')"
                  :border="false"
                  class="f-input"
                />

                <!-- BOOLEAN 类型 -->
                <van-radio-group
                  v-else-if="config.type === 'BOOLEAN'"
                  v-model="agentConfigValues[config.name]"
                  direction="horizontal"
                >
                  <van-radio :name="true">是</van-radio>
                  <van-radio :name="false">否</van-radio>
                </van-radio-group>

                <!-- MODEL 类型 -->
                <div v-else-if="config.type === 'MODEL'" class="f-select-wrapper">
                  <select
                    v-model="agentConfigValues[config.name]"
                    class="f-select"
                    @focus="handleModelFocus(config)"
                  >
                    <option :value="null" disabled>请选择Model</option>
                    <option
                      v-for="model in getModelOptions(config.modelCallingType)"
                      :key="model.value"
                      :value="model.value"
                    >
                      {{ model.text }}
                    </option>
                  </select>
                  <span
                    v-if="!config.require && agentConfigValues[config.name] !== null && agentConfigValues[config.name] !== ''"
                    class="f-select-clear"
                    @click="agentConfigValues[config.name] = null"
                  >
                    ×
                  </span>
                </div>
              </div>
            </div>

            <div v-else class="f-no-config">
              <p>该 Agent 无需额外配置</p>
            </div>

            <!-- 保存按钮 -->
            <div class="f-form-actions">
              <button
                class="f-btn f-btn-primary"
                :disabled="saving"
                @click="handleSave"
              >
                {{ saving ? '保存中...' : '保存配置' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { toast } from '@/utils/toast'
import { agentRuntimeApi } from '@/services/agent'
import { aiModelApi } from '@/services/model'
import { useUserAgentConfigStore } from '@/stores/userAgentConfig'
import type { AgentRuntimeConfig, AgentConfigDefinition, UserAgentConfig } from '@/types/agent'
import type { AiModel } from '@/types/model'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

// Store
const userAgentConfigStore = useUserAgentConfigStore()

// 状态
const loading = ref(false)
const saving = ref(false)

// Agent 相关
const selectedAgentCode = ref<string>('')
const selectedAgent = ref<AgentRuntimeConfig | null>(null)
const agentConfigDefinitions = ref<AgentConfigDefinition[]>([])

// 模型相关
const modelCache = ref<Record<string, AiModel[]>>({})

// 表单数据
const agentConfigValues = ref<Record<string, any>>({})

// 判断某个 Agent 是否已有用户配置（agentConfig 不为空）
function hasUserConfig(agentCode: string): boolean {
  return userAgentConfigStore.configuredAgents.some(config => config.agentCode === agentCode)
}

// 获取模型选项列表
function getModelOptions(modelCallingType?: string): Array<{ text: string; value: string }> {
  if (!modelCallingType || !modelCache.value[modelCallingType]) {
    return []
  }
  return modelCache.value[modelCallingType].map(model => ({
    text: model.modelDisplayName,
    value: model.modelIdentifier
  }))
}

// 获取数字类型的占位符
function getNumberPlaceholder(config: AgentConfigDefinition, type: 'INT' | 'FLOAT'): string {
  const start = type === 'INT' ? config.intStartScope : config.floatStartScope
  const end = type === 'INT' ? config.intEndScope : config.floatEndScope

  if (start !== undefined && end !== undefined) {
    return `请输入${start}到${end}之间的数值`
  } else if (start !== undefined) {
    return `请输入大于等于${start}的数值`
  } else if (end !== undefined) {
    return `请输入小于等于${end}的数值`
  }

  return `请输入${config.description || config.name}`
}

// 处理选择 Agent
async function handleSelectAgent(agentCode: string) {
  selectedAgentCode.value = agentCode

  try {
    // 获取 Agent 详情
    const agent = await agentRuntimeApi.getAgentByCode(agentCode)
    selectedAgent.value = agent
    agentConfigDefinitions.value = agent.agentConfigDefinitions || []

    // 清空模型缓存
    modelCache.value = {}

    // 初始化配置值
    agentConfigValues.value = {}
    agentConfigDefinitions.value.forEach(config => {
      if (config.type === 'BOOLEAN') {
        agentConfigValues.value[config.name] = false
      } else if (config.type === 'MODEL') {
        agentConfigValues.value[config.name] = null
      } else {
        agentConfigValues.value[config.name] = ''
      }
    })

    // 查找用户已有的配置
    const userConfig = userAgentConfigStore.userAgentConfigs.find(c => c.agentCode === agentCode)
    if (userConfig && userConfig.agentConfig) {
      // 预加载所有 MODEL 类型的模型列表
      const modelLoadPromises = agentConfigDefinitions.value
        .filter(config => config.type === 'MODEL' && config.modelCallingType)
        .map(async config => {
          try {
            const models = await aiModelApi.listEnabledModels(config.modelCallingType!)
            modelCache.value[config.modelCallingType!] = models
          } catch (error) {
            console.error(`加载模型列表失败 (${config.modelCallingType}):`, error)
          }
        })

      await Promise.all(modelLoadPromises)

      // 解析并回填配置
      const config = JSON.parse(userConfig.agentConfig)
      Object.keys(config).forEach(key => {
        if (key in agentConfigValues.value) {
          agentConfigValues.value[key] = config[key]
        }
      })
    }
  } catch (error) {
    console.error('获取 Agent 详情失败:', error)
    toast.error('获取 Agent 详情失败')
  }
}

// 处理模型选择框获得焦点
async function handleModelFocus(config: AgentConfigDefinition) {
  if (!config.modelCallingType) {
    toast.error('该配置未指定模型调用方式')
    return
  }

  // 检查缓存，如果没有则加载模型列表
  if (!modelCache.value[config.modelCallingType]) {
    try {
      const models = await aiModelApi.listEnabledModels(config.modelCallingType)
      modelCache.value[config.modelCallingType] = models
    } catch (error) {
      console.error('获取模型列表失败:', error)
      toast.error('获取模型列表失败')
    }
  }
}

// 验证表单
function validateForm(): boolean {
  if (!selectedAgentCode.value) {
    toast.error('请选择 Agent')
    return false
  }

  // 验证 Agent 配置
  for (const config of agentConfigDefinitions.value) {
    const value = agentConfigValues.value[config.name]

    // 必填验证
    if (config.userOverride && config.require && (value === '' || value === null || value === undefined)) {
      toast.error(`请填写${config.description || config.name}`)
      return false
    }

    // 数值范围验证
    if (config.type === 'INT' && value !== '' && value !== null && value !== undefined) {
      const numValue = Number(value)
      if (config.intStartScope !== undefined && numValue < config.intStartScope) {
        toast.error(`${config.description || config.name}不能小于${config.intStartScope}`)
        return false
      }
      if (config.intEndScope !== undefined && numValue > config.intEndScope) {
        toast.error(`${config.description || config.name}不能大于${config.intEndScope}`)
        return false
      }
    }

    if (config.type === 'FLOAT' && value !== '' && value !== null && value !== undefined) {
      const numValue = Number(value)
      if (config.floatStartScope !== undefined && numValue < config.floatStartScope) {
        toast.error(`${config.description || config.name}不能小于${config.floatStartScope}`)
        return false
      }
      if (config.floatEndScope !== undefined && numValue > config.floatEndScope) {
        toast.error(`${config.description || config.name}不能大于${config.floatEndScope}`)
        return false
      }
    }
  }

  return true
}

// 处理保存
async function handleSave() {
  if (!validateForm()) return

  saving.value = true
  try {
    // 构建 agentConfig 对象
    const agentConfig: Record<string, any> = {}
    agentConfigDefinitions.value.forEach(config => {
      const value = agentConfigValues.value[config.name]
      if (value !== '' && value !== null && value !== undefined) {
        agentConfig[config.name] = value
      }
    })

    // 调用更新接口
    await agentRuntimeApi.updateUserAgentConfig({
      agentCode: selectedAgentCode.value,
      agentConfig: JSON.stringify(agentConfig)
    })

    toast.success('保存成功')

    // 重新加载用户配置列表
    await userAgentConfigStore.loadUserAgentConfigs()
  } catch (error) {
    console.error('保存失败:', error)
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 初始化数据
async function initData() {
  loading.value = true
  try {
    await userAgentConfigStore.initData()
  } finally {
    loading.value = false
  }
}

// 处理关闭
function handleClose() {
  emit('update:visible', false)
  // 不清空选中状态，保持用户的选择
}

// 监听 visible 变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initData()
  }
})
</script>

<style scoped lang="scss">
// 弹窗主容器
.m-agent-config-modal {
  background: #2a2a2a;
  color: #cccccc;
  height: 100%;
  display: flex;
  flex-direction: column;
}

// 标题
.f-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #3a3a3a;
}

// 弹窗主体
.f-modal-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

// 左侧 Agent 列表
.f-agent-list {
  width: 240px;
  background: #242424;
  border-right: 1px solid #3a3a3a;
  overflow-y: auto;
  padding: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #242424;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3a3a;
    border-radius: 3px;

    &:hover {
      background: #4a4a4a;
    }
  }
}

// Agent 卡片
.f-agent-card {
  padding: 12px;
  margin-bottom: 8px;
  background: #2a2a2a;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #333333;
    border-color: #3a3a3a;
  }

  &.active {
    background: #3a3a3a;
    border-color: #4a9eff;
  }
}

.f-agent-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.f-agent-name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin: 0;
}

.f-config-badge {
  font-size: 10px;
  padding: 2px 6px;
  background: #27ae60;
  color: #ffffff;
  border-radius: 3px;
}

.f-agent-description {
  font-size: 11px;
  color: #999999;
  margin: 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

// 右侧配置表单
.f-config-form {
  flex: 1;
  overflow-y: auto;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  &::-webkit-scrollbar-thumb {
    background: #3a3a3a;
    border-radius: 4px;

    &:hover {
      background: #4a4a4a;
    }
  }
}

// 空状态
.f-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #777777;

  .f-icon-large {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
}

// 配置内容
.f-config-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.f-config-header {
  margin-bottom: 24px;
}

.f-config-title {
  font-size: 15px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.f-config-description {
  font-size: 12px;
  color: #999999;
  margin: 0;
  line-height: 1.5;
}

// 表单区域
.f-form-section {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
}

.f-form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.f-label {
  display: block;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 8px;
  font-weight: 400;
}

.f-required {
  color: #e74c3c;
  margin-left: 2px;
}

// 输入框样式
.f-input {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #cccccc;
  font-size: 13px;

  :deep(.van-cell) {
    padding: 0;
    background: transparent;
  }

  :deep(.van-field__control) {
    color: #cccccc;
    font-size: 13px;
    background: transparent;
    padding: 8px 12px;
  }

  :deep(.van-field__control::placeholder) {
    color: #555555;
  }

  &:focus-within {
    border-color: #555555;
  }
}

// 下拉选择框
.f-select-wrapper {
  position: relative;
}

.f-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  font-size: 13px;
  color: #cccccc;
  outline: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999999' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  appearance: none;

  &:focus {
    border-color: #555555;
  }

  option {
    background: #1e1e1e;
    color: #cccccc;
  }
}

.f-select-clear {
  position: absolute;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #999999;
  cursor: pointer;
  user-select: none;

  &:hover {
    color: #ffffff;
  }
}

// 无配置提示
.f-no-config {
  padding: 40px 20px;
  text-align: center;
  color: #777777;
  font-size: 13px;
}

// 表单操作按钮
.f-form-actions {
  padding-top: 20px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
}

.f-btn {
  padding: 8px 16px;
  background: #3a3a3a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 13px;
  color: #cccccc;
  cursor: pointer;
  transition: all 0.2s;

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

// Radio 组样式
:deep(.van-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.van-radio) {
  .van-radio__label {
    color: #cccccc;
    font-size: 13px;
  }

  .van-radio__icon--checked {
    background-color: #3a3a3a;
    border-color: #4a4a4a;
  }
}

// Popup 覆盖样式
:deep(.van-popup) {
  background: #2a2a2a;
  border: 1px solid #444444;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

:deep(.van-popup__close-icon) {
  color: #999999;
  font-size: 20px;

  &:hover {
    color: #ffffff;
  }
}
</style>

