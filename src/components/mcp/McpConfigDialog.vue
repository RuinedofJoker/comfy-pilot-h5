<template>
  <van-popup
    :show="visible"
    position="center"
    :style="{ width: '90%', maxWidth: '800px', maxHeight: '80vh' }"
    round
    closeable
    @close="handleClose"
    @update:show="emit('update:visible', $event)"
  >
    <div class="m-mcp-config-modal">
      <h3 class="f-modal-title">MCP 工具配置</h3>

      <div class="f-modal-body">
        <!-- 全局执行策略 -->
        <div class="f-form-section">
          <h4 class="f-section-title">工具执行策略</h4>
          <p class="f-section-desc">
            设置外部 MCP 工具的默认执行策略
          </p>

          <div class="f-policy-selector">
            <label class="f-radio-item" @click="executionPolicy = 'ask-every-time'">
              <input
                type="radio"
                name="policy"
                value="ask-every-time"
                :checked="executionPolicy === 'ask-every-time'"
              />
              <div class="f-radio-content">
                <div class="f-radio-title">每次询问</div>
                <div class="f-radio-desc">执行工具前需要用户确认，更安全</div>
              </div>
            </label>

            <label class="f-radio-item" @click="executionPolicy = 'auto-execute'">
              <input
                type="radio"
                name="policy"
                value="auto-execute"
                :checked="executionPolicy === 'auto-execute'"
              />
              <div class="f-radio-content">
                <div class="f-radio-title">自动执行</div>
                <div class="f-radio-desc">工具将自动执行，无需确认</div>
              </div>
            </label>
          </div>
        </div>

        <!-- MCP 服务配置 -->
        <div class="f-form-section">
          <h4 class="f-section-title">MCP 服务配置</h4>
          <p class="f-section-desc">
            配置外部 MCP 服务器连接信息，支持 SSE 和 HTTP 协议
          </p>

          <!-- JSON 编辑器 -->
          <div class="f-editor-wrapper">
            <MonacoJsonEditor
              ref="editorRef"
              v-model="configJson"
              @validate="handleValidate"
            />
          </div>

          <!-- 验证错误提示 -->
          <div v-if="validationErrors.length > 0" class="f-error-tips">
            <div v-for="(error, index) in validationErrors" :key="index" class="f-error-item">
              <van-icon name="warning-o" />
              <span>{{ error }}</span>
            </div>
          </div>
        </div>

        <!-- 配置说明 -->
        <div class="f-form-section">
          <h4 class="f-section-title">配置说明</h4>
          <div class="f-config-example">
            <pre class="f-example-code">{{exampleConfig}}</pre>
          </div>
          <ul class="f-config-tips">
            <li><strong>url</strong>: MCP 服务器地址（必填，必须是有效的 URL）</li>
            <li><strong>disabled</strong>: 是否禁用该服务（可选，默认 false）</li>
            <li><strong>timeout</strong>: 超时时间（可选，单位秒）</li>
            <li><strong>type</strong>: 传输协议类型（可选，支持 sse/http）</li>
            <li><strong>headers</strong>: 自定义请求头（可选，用于认证等）</li>
          </ul>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="f-modal-footer">
        <van-button class="f-btn-cancel" @click="handleClose">
          取消
        </van-button>
        <van-button
          type="primary"
          class="f-btn-save"
          :loading="saving"
          :disabled="!isValid"
          @click="handleSave"
        >
          保存配置
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { showToast } from 'vant'
import MonacoJsonEditor from '@/components/workflow/MonacoJsonEditor.vue'
import { mcpConfigManager, mcpToolRegistry, ExternalMcpToolSet } from '@/mcp'
import type { McpServerConfig, ToolExecutionPolicy } from '@/mcp'

interface Props {
  visible: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Refs
const editorRef = ref<InstanceType<typeof MonacoJsonEditor> | null>(null)
const configJson = ref('')
const isValid = ref(true)
const validationErrors = ref<string[]>([])
const saving = ref(false)
const executionPolicy = ref<ToolExecutionPolicy>('ask-every-time')

// 示例配置
const exampleConfig = `{
  "mcpServers": {}
  }
}`

// 初始化配置
function initConfig(): void {
  const servers = mcpConfigManager.getAllExternalServers()

  // 获取全局执行策略
  executionPolicy.value = mcpConfigManager.getGlobalExecutionPolicy()

  if (servers.length === 0) {
    // 如果没有配置，使用示例配置
    configJson.value = exampleConfig
  } else {
    // 转换现有配置为用户格式
    const mcpServers: Record<string, any> = {}

    servers.forEach(server => {
      mcpServers[server.id] = {
        url: server.url,
        disabled: !server.enabled,
        timeout: 60,
        type: server.transport,
        ...(server.auth && {
          headers: {
            Authorization: server.auth.type === 'bearer'
              ? `Bearer ${server.auth.token}`
              : server.auth.token
          }
        })
      }
    })

    configJson.value = JSON.stringify({ mcpServers }, null, 2)
  }
}

// 验证 JSON 格式
function handleValidate(valid: boolean, errors: string[]): void {
  isValid.value = valid
  if (!valid) {
    validationErrors.value = errors
  } else {
    validationErrors.value = []
  }
}

// 验证 URL 格式
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// 验证配置内容
function validateConfig(config: any): string[] {
  const errors: string[] = []

  if (!config.mcpServers || typeof config.mcpServers !== 'object') {
    errors.push('配置必须包含 mcpServers 对象')
    return errors
  }

  const servers = config.mcpServers
  const serverIds = Object.keys(servers)

  if (serverIds.length === 0) {
    errors.push('至少需要配置一个 MCP 服务器')
    return errors
  }

  serverIds.forEach(id => {
    const server = servers[id]

    // 验证 URL
    if (!server.url) {
      errors.push(`服务器 "${id}": 缺少 url 字段`)
    } else if (!isValidUrl(server.url)) {
      errors.push(`服务器 "${id}": url 格式无效，必须是有效的 URL 地址`)
    }

    // 验证 type
    if (server.type && !['sse', 'http'].includes(server.type)) {
      errors.push(`服务器 "${id}": type 必须是 "sse" 或 "http"`)
    }

    // 验证 timeout
    if (server.timeout !== undefined && (typeof server.timeout !== 'number' || server.timeout <= 0)) {
      errors.push(`服务器 "${id}": timeout 必须是正数`)
    }
  })

  return errors
}

// 保存配置
async function handleSave(): Promise<void> {
  if (!isValid.value) {
    showToast('请修复 JSON 格式错误')
    return
  }

  saving.value = true

  try {
    // 解析 JSON
    const config = JSON.parse(configJson.value)

    // 验证配置内容
    const errors = validateConfig(config)
    if (errors.length > 0) {
      validationErrors.value = errors
      isValid.value = false
      showToast('配置验证失败，请检查错误提示')
      return
    }

    // 保存全局执行策略
    mcpConfigManager.setGlobalExecutionPolicy(executionPolicy.value)

    // 清空现有的外部服务器配置
    const existingServers = mcpConfigManager.getAllExternalServers()
    existingServers.forEach(server => {
      mcpConfigManager.removeExternalServer(server.id)
      // 从注册表中注销工具集
      mcpToolRegistry.unregisterToolSet(server.id)
    })

    // 保存新配置
    const servers = config.mcpServers
    const serverIds = Object.keys(servers)

    for (const id of serverIds) {
      const server = servers[id]

      // 解析认证信息
      let auth: any = undefined
      if (server.headers?.Authorization) {
        const authHeader = server.headers.Authorization
        if (authHeader.startsWith('Bearer ')) {
          auth = {
            type: 'bearer',
            token: authHeader.substring(7)
          }
        } else {
          auth = {
            type: 'api-key',
            token: authHeader
          }
        }
      }

      // 创建服务器配置
      const serverConfig: McpServerConfig = {
        id,
        name: id,
        description: `外部 MCP 服务器: ${id}`,
        url: server.url,
        transport: server.type || 'sse',
        auth,
        enabled: !server.disabled,
        executionPolicy: executionPolicy.value // 使用全局执行策略
      }

      // 保存到配置管理器
      mcpConfigManager.addExternalServer(serverConfig)
    }

    showToast('配置保存成功')
    emit('saved')
    handleClose()
  } catch (error) {
    console.error('保存配置失败:', error)
    showToast(error instanceof Error ? error.message : '保存失败')
  } finally {
    saving.value = false
  }
}

// 关闭弹窗
function handleClose(): void {
  emit('update:visible', false)
}

// 监听弹窗显示
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initConfig()
    validationErrors.value = []
    isValid.value = true
  }
})
</script>

<style scoped lang="scss">
.m-mcp-config-modal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2a2a2a;
  color: #e0e0e0;
}

.f-modal-title {
  margin: 0;
  padding: 20px 24px;
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  border-bottom: 1px solid #3a3a3a;
}

.f-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.f-form-section {
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
}

.f-section-title {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.f-section-desc {
  margin: 0 0 16px;
  font-size: 13px;
  color: #999999;
  line-height: 1.5;
}

.f-policy-selector {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.f-radio-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #1e1e1e;
  border: 2px solid #3a3a3a;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4a9eff;
    background: #252525;
  }

  input[type="radio"] {
    margin-top: 2px;
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #4a9eff;
  }

  input[type="radio"]:checked ~ .f-radio-content {
    .f-radio-title {
      color: #4a9eff;
    }
  }
}

.f-radio-content {
  flex: 1;
}

.f-radio-title {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
  transition: color 0.2s;
}

.f-radio-desc {
  font-size: 12px;
  color: #999999;
  line-height: 1.5;
}

.f-editor-wrapper {
  height: 300px;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  overflow: hidden;
  background: #1e1e1e;
}

.f-error-tips {
  margin-top: 12px;
  padding: 12px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
}

.f-error-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #ff6b6b;

  &:last-child {
    margin-bottom: 0;
  }

  .van-icon {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 16px;
  }
}

.f-config-example {
  margin-bottom: 12px;
  padding: 12px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 4px;
  overflow-x: auto;
}

.f-example-code {
  margin: 0;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: #d4d4d4;
  white-space: pre;
}

.f-config-tips {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #cccccc;
  line-height: 1.8;

  li {
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #4a9eff;
      font-weight: 600;
    }
  }
}

.f-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #3a3a3a;
  background: #2a2a2a;
}

.f-btn-cancel,
.f-btn-save {
  flex: 1;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
}

.f-btn-cancel {
  background: #3a3a3a;
  color: #cccccc;
  border: 1px solid #4a4a4a;

  &:hover {
    background: #4a4a4a;
  }
}

.f-btn-save {
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
