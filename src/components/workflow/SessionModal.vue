<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '520px' }"
    round
    closeable
    @close="handleClose"
    @update:show="emit('update:visible', $event)"
  >
    <div class="m-session-modal">
      <h3 class="f-modal-title">{{ isEdit ? '编辑会话' : '新建会话' }}</h3>

      <div class="f-modal-body">
        <!-- 会话基本信息 -->
        <div class="f-form-section">
          <h4 class="f-section-title">会话基本信息</h4>

          <!-- 标题输入 -->
          <div class="f-form-item">
            <label class="f-label">
              会话标题
              <span class="f-optional">(可选)</span>
            </label>
            <van-field
              v-model="formData.title"
              placeholder="请输入会话标题"
              :border="false"
              class="f-input"
            />
          </div>

          <!-- Agent选择 -->
          <div class="f-form-item">
            <label class="f-label">
              Agent
              <span class="f-required">*</span>
            </label>
            <select
              v-model="formData.agentCode"
              class="f-select"
              @change="handleAgentChange"
            >
              <option value="" disabled>请选择Agent</option>
              <option
                v-for="agent in agents"
                :key="agent.agentCode"
                :value="agent.agentCode"
              >
                {{ agent.agentName }}
              </option>
            </select>
          </div>
        </div>

        <!-- Agent配置区域 -->
        <div v-if="selectedAgent && agentConfigDefinitions.length > 0" class="f-form-section">
          <h4 class="f-section-title">Agent 配置</h4>

          <div
            v-for="config in agentConfigDefinitions"
            v-show="config.userOverride"
            :key="config.name"
            class="f-form-item"
          >
            <label class="f-label">
              {{ config.description ? config.description : config.name }}
              <span v-if="config.userOverride && config.require" class="f-required"> *</span>
            </label>

            <!-- STRING类型 -->
            <van-field
              v-if="config.type === 'STRING'"
              v-model="agentConfigValues[config.name]"
              :placeholder="`请输入${config.name}`"
              :rules="getStringRules(config)"
              :border="false"
              class="f-input"
            />

            <!-- TEXT类型 -->
            <van-field
              v-else-if="config.type === 'TEXT'"
              v-model="agentConfigValues[config.name]"
              type="textarea"
              :placeholder="`请输入${config.name}`"
              :border="false"
              class="f-input"
              rows="3"
            />

            <!-- INT类型 -->
            <van-field
              v-else-if="config.type === 'INT'"
              v-model.number="agentConfigValues[config.name]"
              type="number"
              :placeholder="getNumberPlaceholder(config, 'INT')"
              :border="false"
              class="f-input"
            />

            <!-- FLOAT类型 -->
            <van-field
              v-else-if="config.type === 'FLOAT'"
              v-model.number="agentConfigValues[config.name]"
              type="number"
              step="0.01"
              :placeholder="getNumberPlaceholder(config, 'FLOAT')"
              :border="false"
              class="f-input"
            />

            <!-- BOOLEAN类型 -->
            <van-radio-group
              v-else-if="config.type === 'BOOLEAN'"
              v-model="agentConfigValues[config.name]"
              direction="horizontal"
            >
              <van-radio :name="true">是</van-radio>
              <van-radio :name="false">否</van-radio>
            </van-radio-group>

            <!-- MODEL类型 -->
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
      </div>

      <!-- 底部按钮 -->
      <div class="f-modal-footer">
        <button class="f-btn" @click="handleClose">取消</button>
        <button class="f-btn f-btn-primary" @click="handleConfirm" :disabled="loading">
          {{ loading ? '处理中...' : '确认' }}
        </button>
      </div>
    </div>

  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { toast } from '@/utils/toast'
import { agentRuntimeApi } from '@/services/agent'
import { aiModelApi } from '@/services/model'
import { getSessionByCode } from '@/services/session'
import type { AgentRuntimeConfig, AgentConfigDefinition } from '@/types/agent'
import type { AiModel } from '@/types/model'

// Props
interface Props {
  visible: boolean
  isEdit?: boolean
  sessionCode?: string
  comfyuiServerId: string
  comfyuiServerName: string
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
  sessionCode: undefined
})

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'confirm': [data: { title?: string; agentCode: string; agentConfig: string }]
}>()

// 状态
const loading = ref(false)

// Agent相关
const agents = ref<AgentRuntimeConfig[]>([])
const selectedAgent = ref<AgentRuntimeConfig | null>(null)
const agentConfigDefinitions = ref<AgentConfigDefinition[]>([])

// 模型相关
const modelCache = ref<Record<string, AiModel[]>>({})

// 表单数据
const formData = ref({
  title: '',
  agentCode: ''
})

const agentConfigValues = ref<Record<string, any>>({})

// 获取模型选项列表
function getModelOptions(modelCallingType?: string): Array<{ text: string; value: string }> {
  if (!modelCallingType || !modelCache.value[modelCallingType]) {
    return []
  }
  return modelCache.value[modelCallingType].map(model => ({
    text: model.modelName,
    value: model.modelIdentifier
  }))
}

// 获取字符串类型的验证规则
function getStringRules(config: AgentConfigDefinition) {
  const rules: any[] = []

  if (config.require) {
    rules.push({ required: true, message: `请输入${config.name}` })
  }

  if (config.format) {
    rules.push({
      pattern: new RegExp(config.format),
      message: '格式不正确'
    })
  }

  return rules
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

  return `请输入${config.name}`
}

// 处理Agent选择变化
async function handleAgentChange() {
  const agentCode = formData.value.agentCode
  if (!agentCode) return

  try {
    // 获取Agent详情
    const agent = await agentRuntimeApi.getAgentByCode(agentCode)
    selectedAgent.value = agent
    agentConfigDefinitions.value = agent.agentConfigDefinitions || []

    // 清空模型缓存,确保每次选择Agent后重新加载模型
    modelCache.value = {}

    // 初始化配置值
    agentConfigValues.value = {}
    agentConfigDefinitions.value.forEach(config => {
      if (config.type === 'BOOLEAN') {
        agentConfigValues.value[config.name] = false
      } else if (config.type === 'MODEL') {
        // MODEL类型初始值为null,表示未选择
        agentConfigValues.value[config.name] = null
      } else {
        agentConfigValues.value[config.name] = ''
      }
    })
  } catch (error) {
    console.error('获取Agent详情失败:', error)
    toast.error('获取Agent详情失败')
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
  if (!formData.value.agentCode) {
    toast.error('请选择Agent')
    return false
  }

  // 验证Agent配置
  for (const config of agentConfigDefinitions.value) {
    const value = agentConfigValues.value[config.name]

    // 必填验证
    if (config.userOverride && config.require && (value === '' || value === null || value === undefined)) {
      toast.error(`请填写${config.name}`)
      return false
    }

    // 数值范围验证
    if (config.type === 'INT' && value !== '' && value !== null && value !== undefined) {
      const numValue = Number(value)
      if (config.intStartScope !== undefined && numValue < config.intStartScope) {
        toast.error(`${config.name}不能小于${config.intStartScope}`)
        return false
      }
      if (config.intEndScope !== undefined && numValue > config.intEndScope) {
        toast.error(`${config.name}不能大于${config.intEndScope}`)
        return false
      }
    }

    if (config.type === 'FLOAT' && value !== '' && value !== null && value !== undefined) {
      const numValue = Number(value)
      if (config.floatStartScope !== undefined && numValue < config.floatStartScope) {
        toast.error(`${config.name}不能小于${config.floatStartScope}`)
        return false
      }
      if (config.floatEndScope !== undefined && numValue > config.floatEndScope) {
        toast.error(`${config.name}不能大于${config.floatEndScope}`)
        return false
      }
    }
  }

  return true
}

// 处理确认
function handleConfirm() {
  if (!validateForm()) return

  // 构建agentConfig对象
  const agentConfig: Record<string, any> = {}
  agentConfigDefinitions.value.forEach(config => {
    const value = agentConfigValues.value[config.name]
    if (value !== '' && value !== null && value !== undefined) {
      agentConfig[config.name] = value
    }
  })

  emit('confirm', {
    title: formData.value.title || undefined,
    agentCode: formData.value.agentCode,
    agentConfig: JSON.stringify(agentConfig)
  })
}

// 清空表单
function resetForm() {
  formData.value.title = ''
  formData.value.agentCode = ''
  selectedAgent.value = null
  agentConfigDefinitions.value = []
  agentConfigValues.value = {}
}

// 处理关闭
function handleClose() {
  emit('update:visible', false)
  resetForm()
}

// 初始化表单
async function initForm() {
  // 加载Agent列表
  try {
    agents.value = await agentRuntimeApi.getEnabledAgents()
  } catch (error) {
    console.error('加载Agent列表失败:', error)
    toast.error('加载Agent列表失败')
  }

  // 如果是编辑模式,先调用接口获取会话详情
  if (props.isEdit && props.sessionCode) {
    try {
      // 1. 获取会话详情
      const session = await getSessionByCode(props.sessionCode)

      // 2. 回填基本信息
      formData.value.title = session.title || ''
      formData.value.agentCode = session.agentCode || ''

      if (session.agentCode) {
        // 3. 获取Agent详情
        const agent = await agentRuntimeApi.getAgentByCode(session.agentCode)
        selectedAgent.value = agent
        agentConfigDefinitions.value = agent.agentConfigDefinitions || []

        // 4. 清空模型缓存,确保重新加载模型列表
        modelCache.value = {}

        // 5. 先初始化所有配置字段的默认值
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

        // 6. 预加载所有MODEL类型字段需要的模型列表
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

        // 7. 解析并回填agentConfig
        if (session.agentConfig) {
          const config = JSON.parse(session.agentConfig)
          // 将已有的配置值覆盖到默认值上
          Object.keys(config).forEach(key => {
            if (key in agentConfigValues.value) {
              agentConfigValues.value[key] = config[key]
            }
          })
        }
      }
    } catch (error) {
      console.error('加载会话详情失败:', error)
      toast.error('加载会话详情失败')
    }
  } else {
    // 新建模式,清空表单
    resetForm()
  }
}

// 监听visible变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initForm()
  } else {
    // 关闭时清空表单
    resetForm()
  }
})
</script>

<style scoped lang="scss">
// 弹窗主容器样式
.m-session-modal {
  background: #2a2a2a;
  color: #cccccc;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

// 标题样式
.f-modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  padding: 20px 24px;
  margin: 0;
  border-bottom: 1px solid #3a3a3a;
}

// 弹窗主体区域
.f-modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  flex: 1;
}

// 表单区域容器
.f-form-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 区域标题
.f-section-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3a3a;
}

// 表单项
.f-form-item {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

// 标签样式
.f-label {
  display: block;
  font-size: 13px;
  color: #cccccc;
  margin-bottom: 8px;
  font-weight: 400;
  line-height: 1.5;
}

// 必填标记
.f-required {
  color: #e74c3c;
  margin-left: 2px;
}

// 可选标记
.f-optional {
  color: #777777;
  font-size: 11px;
  margin-left: 4px;
}

// 描述文本
.f-description {
  color: #777777;
  font-size: 11px;
  margin-left: 4px;
}

// 输入框样式
.f-input {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  color: #cccccc;
  font-size: 13px;
  padding: 0;
  min-height: auto;

  :deep(.van-cell) {
    padding: 0;
    background: transparent;
    line-height: normal;
    min-height: auto;
    position: relative;
  }

  :deep(.van-cell__value) {
    width: 100%;
    padding: 0;
  }

  :deep(.van-field__value) {
    width: 100%;
    padding: 0;
  }

  :deep(.van-field__body) {
    padding: 0;
    height: auto;
  }

  :deep(.van-field__control) {
    color: #cccccc;
    font-size: 13px;
    background: transparent;
    line-height: 1.5;
    min-height: auto;
    padding: 8px 12px;
    width: 100%;
  }

  :deep(.van-field__control::placeholder) {
    color: #555555;
  }

  :deep(.van-cell__right-icon) {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999999;
  }

  &:focus-within {
    border-color: #555555;
  }

  &.f-readonly {
    background: #1e1e1e;

    :deep(.van-field__control) {
      color: #888888;
    }
  }
}

// 下拉选择框包装器
.f-select-wrapper {
  position: relative;
  width: 100%;
}

// 下拉选择框样式
.f-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  font-size: 13px;
  color: #cccccc;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23999999' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  appearance: none;

  &:focus {
    border-color: #555555;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  option {
    background: #1e1e1e;
    color: #cccccc;
  }
}

// 清除按钮样式
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
  transition: color 0.2s;
  user-select: none;
  line-height: 1;

  &:hover {
    color: #ffffff;
  }
}

// 底部按钮区域
.f-modal-footer {
  padding: 12px 16px;
  border-top: 1px solid #3a3a3a;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

// 按钮样式
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

    &:disabled {
      background: #4a9eff;
      opacity: 0.5;
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
