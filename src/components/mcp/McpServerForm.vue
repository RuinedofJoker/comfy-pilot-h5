<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    :style="{ height: '80%' }"
    round
    closeable
    @close="handleClose"
  >
    <div class="f-mcp-server-form">
      <!-- 标题 -->
      <div class="f-form-header">
        <h3 class="f-form-title">
          {{ isEdit ? '编辑 MCP 服务器' : '添加 MCP 服务器' }}
        </h3>
      </div>

      <!-- 表单内容 -->
      <div class="f-form-content">
        <van-form @submit="handleSubmit">
          <!-- 服务器名称 -->
          <van-field
            v-model="formData.name"
            name="name"
            label="服务器名称"
            placeholder="请输入服务器名称"
            :rules="[{ required: true, message: '请输入服务器名称' }]"
          />

          <!-- 服务器描述 -->
          <van-field
            v-model="formData.description"
            name="description"
            label="描述"
            type="textarea"
            placeholder="请输入服务器描述（可选）"
            rows="2"
            autosize
          />

          <!-- 服务器 URL -->
          <van-field
            v-model="formData.url"
            name="url"
            label="服务器 URL"
            placeholder="http://localhost:3000/mcp"
            :rules="[
              { required: true, message: '请输入服务器 URL' },
              { pattern: /^https?:\/\/.+/, message: 'URL 格式不正确' }
            ]"
          />

          <!-- 传输协议 -->
          <van-field
            v-model="formData.transport"
            name="transport"
            label="传输协议"
            readonly
            clickable
            @click="showTransportPicker = true"
          >
            <template #input>
              <span>{{ getTransportLabel(formData.transport) }}</span>
            </template>
          </van-field>

          <!-- 认证类型 -->
          <van-field
            v-model="formData.authType"
            name="authType"
            label="认证类型"
            readonly
            clickable
            @click="showAuthTypePicker = true"
          >
            <template #input>
              <span>{{ getAuthTypeLabel(formData.authType) }}</span>
            </template>
          </van-field>

          <!-- Token 输入（仅当认证类型不为 none 时显示） -->
          <van-field
            v-if="formData.authType !== 'none'"
            v-model="formData.token"
            name="token"
            :label="formData.authType === 'bearer' ? 'Bearer Token' : 'API Key'"
            type="password"
            placeholder="请输入认证凭证"
            :rules="[{ required: true, message: '请输入认证凭证' }]"
          />

          <!-- 执行策略 -->
          <van-field
            v-model="formData.executionPolicy"
            name="executionPolicy"
            label="执行策略"
            readonly
            clickable
            @click="showPolicyPicker = true"
          >
            <template #input>
              <span>{{ getExecutionPolicyLabel(formData.executionPolicy) }}</span>
            </template>
          </van-field>

          <!-- 提交按钮 -->
          <div class="f-form-actions">
            <van-button block type="primary" native-type="submit">
              {{ isEdit ? '保存' : '添加' }}
            </van-button>
          </div>
        </van-form>
      </div>
    </div>

    <!-- 传输协议选择器 -->
    <van-popup v-model:show="showTransportPicker" position="bottom" round>
      <van-picker
        :columns="transportOptions"
        @confirm="handleTransportConfirm"
        @cancel="showTransportPicker = false"
      />
    </van-popup>

    <!-- 认证类型选择器 -->
    <van-popup v-model:show="showAuthTypePicker" position="bottom" round>
      <van-picker
        :columns="authTypeOptions"
        @confirm="handleAuthTypeConfirm"
        @cancel="showAuthTypePicker = false"
      />
    </van-popup>

    <!-- 执行策略选择器 -->
    <van-popup v-model:show="showPolicyPicker" position="bottom" round>
      <van-picker
        :columns="policyOptions"
        @confirm="handlePolicyConfirm"
        @cancel="showPolicyPicker = false"
      />
    </van-popup>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { McpServerConfig, McpTransportType, McpAuthType, ToolExecutionPolicy } from '@/mcp'

interface Props {
  visible: boolean
  server: McpServerConfig | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', server: McpServerConfig): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 表单数据
const formData = ref({
  name: '',
  description: '',
  url: '',
  transport: 'sse' as McpTransportType,
  authType: 'none' as McpAuthType,
  token: '',
  executionPolicy: 'ask-every-time' as ToolExecutionPolicy
})

// 选择器显示状态
const showTransportPicker = ref(false)
const showAuthTypePicker = ref(false)
const showPolicyPicker = ref(false)

// 是否为编辑模式
const isEdit = computed(() => props.server !== null)

// 传输协议选项
const transportOptions = [
  { text: 'SSE (推荐)', value: 'sse' },
  { text: 'HTTP', value: 'http' }
]

// 认证类型选项
const authTypeOptions = [
  { text: '无认证', value: 'none' },
  { text: 'Bearer Token', value: 'bearer' },
  { text: 'API Key', value: 'api-key' }
]

// 执行策略选项
const policyOptions = [
  { text: '每次询问', value: 'ask-every-time' },
  { text: '自动执行', value: 'auto-execute' }
]

// 监听服务器数据变化
watch(() => props.server, (newServer) => {
  if (newServer) {
    // 编辑模式：填充表单
    formData.value = {
      name: newServer.name,
      description: newServer.description || '',
      url: newServer.url,
      transport: newServer.transport,
      authType: newServer.auth?.type || 'none',
      token: newServer.auth?.token || '',
      executionPolicy: newServer.executionPolicy
    }
  } else {
    // 新增模式：重置表单
    resetForm()
  }
}, { immediate: true })

// 重置表单
function resetForm(): void {
  formData.value = {
    name: '',
    description: '',
    url: '',
    transport: 'sse',
    authType: 'none',
    token: '',
    executionPolicy: 'ask-every-time'
  }
}

// 关闭弹窗
function handleClose(): void {
  emit('update:visible', false)
  resetForm()
}

// 提交表单
function handleSubmit(): void {
  const serverConfig: McpServerConfig = {
    id: props.server?.id || `mcp-server-${Date.now()}`,
    name: formData.value.name,
    description: formData.value.description || undefined,
    url: formData.value.url,
    transport: formData.value.transport,
    auth: formData.value.authType !== 'none' ? {
      type: formData.value.authType,
      token: formData.value.token
    } : undefined,
    enabled: props.server?.enabled ?? true,
    executionPolicy: formData.value.executionPolicy
  }

  emit('save', serverConfig)
}

// 传输协议选择确认
function handleTransportConfirm(value: any): void {
  formData.value.transport = value.selectedValues[0]
  showTransportPicker.value = false
}

// 认证类型选择确认
function handleAuthTypeConfirm(value: any): void {
  formData.value.authType = value.selectedValues[0]
  showAuthTypePicker.value = false
}

// 执行策略选择确认
function handlePolicyConfirm(value: any): void {
  formData.value.executionPolicy = value.selectedValues[0]
  showPolicyPicker.value = false
}

// 获取传输协议标签
function getTransportLabel(type: McpTransportType): string {
  const option = transportOptions.find(opt => opt.value === type)
  return option?.text || type
}

// 获取认证类型标签
function getAuthTypeLabel(type: McpAuthType): string {
  const option = authTypeOptions.find(opt => opt.value === type)
  return option?.text || type
}

// 获取执行策略标签
function getExecutionPolicyLabel(policy: ToolExecutionPolicy): string {
  const option = policyOptions.find(opt => opt.value === policy)
  return option?.text || policy
}
</script>

<style scoped lang="scss">
.f-mcp-server-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.f-form-header {
  padding: 20px;
  border-bottom: 1px solid var(--van-border-color);
}

.f-form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--van-text-color);
}

.f-form-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.f-form-actions {
  padding: 16px;
}
</style>
