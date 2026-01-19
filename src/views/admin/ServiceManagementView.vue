<template>
  <div class="g-service-management-view">
    <!-- 顶部标题栏 -->
    <div class="m-header">
      <h1>ComfyUI 服务管理</h1>
      <button class="f-btn f-btn-primary" @click="showCreateModal = true">
        + 添加服务
      </button>
    </div>

    <!-- 内容区 -->
    <div class="m-content">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="f-loading">
        <van-loading type="spinner" color="#4a9eff" size="40">加载中...</van-loading>
      </div>

      <!-- 服务列表 -->
      <div v-else class="f-services">
        <div
          v-for="service in servers"
          :key="service.id"
          class="f-service-card"
        >
          <div class="f-service-header">
            <div>
              <div class="f-service-name">{{ service.serverName }}</div>
              <div class="f-service-url">{{ service.baseUrl }}</div>
            </div>
            <span
              class="f-status"
              :class="service.healthStatus === 'HEALTHY' ? 'online' : 'offline'"
            >
              <span class="f-status-dot"></span>
              {{ service.healthStatus === 'HEALTHY' ? '在线' : '离线' }}
            </span>
          </div>
          <div class="f-service-desc">{{ service.description || '暂无描述' }}</div>
          <div class="f-service-actions">
            <button
              class="f-btn"
              :disabled="testingServiceId === service.id"
              @click="handleTest(service)"
            >
              {{ testingServiceId === service.id ? '测试中...' : '测试' }}
            </button>
            <button class="f-btn" @click="handleEdit(service)">编辑</button>
            <button class="f-btn" @click="handleDelete(service)">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑服务模态框 -->
    <BaseAdminModal
      v-model="showCreateModal"
      :title="editingService ? '编辑服务' : '添加服务'"
      :close-on-mask="false"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <!-- 基础配置 -->
      <BaseFormGroup label="服务标识符">
        <BaseInput
          v-model="formData.serverKey"
          placeholder="自动生成"
          :disabled="!!editingService"
        />
      </BaseFormGroup>

      <BaseFormGroup label="服务名称" required>
        <BaseInput
          v-model="formData.serverName"
          placeholder="生产环境 ComfyUI"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="启用状态">
        <BaseRadioGroup
          v-model="formData.isEnabled"
          :options="[
            { label: '启用', value: true },
            { label: '禁用', value: false }
          ]"
          name="isEnabled"
        />
      </BaseFormGroup>

      <BaseFormGroup label="服务地址" hint="完整的 ComfyUI 服务 URL" required>
        <BaseInput
          v-model="formData.baseUrl"
          type="url"
          placeholder="http://192.168.1.100:8188"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="描述">
        <BaseTextarea
          v-model="formData.description"
          placeholder="服务描述..."
          :rows="3"
        />
      </BaseFormGroup>

      <BaseFormGroup label="认证模式" required>
        <BaseSelect
          v-model="formData.authMode"
          :options="[
            { label: '无认证', value: 'null' },
            { label: 'Basic Auth', value: 'basic_auth' }
          ]"
        />
      </BaseFormGroup>

      <BaseFormGroup
        v-if="formData.authMode === 'basic_auth'"
        label="API密钥"
        required
      >
        <BaseInput
          v-model="formData.apiKey"
          type="password"
          placeholder="请输入API密钥"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="超时时间(秒)">
        <BaseInput
          v-model.number="formData.timeoutSeconds"
          type="number"
          placeholder="120"
        />
      </BaseFormGroup>

      <BaseFormGroup label="最大重试次数">
        <BaseInput
          v-model.number="formData.maxRetries"
          type="number"
          placeholder="3"
        />
      </BaseFormGroup>

      <!-- 高级选项分隔线 -->
      <div class="f-divider">高级选项</div>

      <BaseFormGroup label="启用高级功能">
        <BaseRadioGroup
          v-model="formData.advancedFeaturesEnabled"
          :options="[
            { label: '否', value: false },
            { label: '是', value: true }
          ]"
          name="advancedFeaturesEnabled"
        />
      </BaseFormGroup>

      <!-- 高级功能配置 -->
      <template v-if="formData.advancedFeaturesEnabled">
        <BaseFormGroup label="连接类型" required>
          <BaseSelect
            v-model="formData.connectionType"
            :options="[
              { label: '本地', value: 'LOCAL' },
              { label: 'SSH', value: 'SSH' }
            ]"
          />
        </BaseFormGroup>

        <!-- SSH连接配置分隔线 -->
        <div v-if="formData.connectionType === 'SSH'" class="f-divider">SSH连接配置</div>

        <!-- SSH配置 -->
        <template v-if="formData.connectionType === 'SSH'">
          <BaseFormGroup label="SSH主机" required>
            <BaseInput
              v-model="formData.sshHost"
              placeholder="192.168.1.100"
              required
            />
          </BaseFormGroup>

          <BaseFormGroup label="SSH端口" required>
            <BaseInput
              v-model.number="formData.sshPort"
              type="number"
              placeholder="22"
              required
            />
          </BaseFormGroup>

          <BaseFormGroup label="SSH用户名" required>
            <BaseInput
              v-model="formData.sshUsername"
              placeholder="root"
              required
            />
          </BaseFormGroup>

          <BaseFormGroup label="SSH认证方式" required>
            <BaseSelect
              v-model="formData.sshAuthType"
              :options="[
                { label: '密码', value: 'PASSWORD' },
                { label: '密钥', value: 'KEY' }
              ]"
            />
          </BaseFormGroup>

          <BaseFormGroup
            v-if="formData.sshAuthType === 'PASSWORD'"
            label="SSH密码"
            required
          >
            <BaseInput
              v-model="formData.sshPassword"
              type="password"
              placeholder="请输入SSH密码"
              required
            />
          </BaseFormGroup>

          <template v-if="formData.sshAuthType === 'KEY'">
            <BaseFormGroup label="私钥路径">
              <BaseInput
                v-model="formData.sshPrivateKeyPath"
                placeholder="/path/to/private_key"
              />
            </BaseFormGroup>
          </template>
        </template>

        <!-- ComfyUI目录配置分隔线 -->
        <div class="f-divider">ComfyUI目录配置</div>

        <!-- 其他高级配置 -->
        <BaseFormGroup label="工作目录" required>
          <BaseInput
            v-model="formData.workingDirectory"
            placeholder="~"
            required
          />
        </BaseFormGroup>

        <BaseFormGroup label="ComfyUI安装路径" required>
          <BaseInput
            v-model="formData.comfyuiInstallPath"
            placeholder="/path/to/ComfyUI"
            required
          />
        </BaseFormGroup>

        <BaseFormGroup label="基础目录">
          <BaseInput
            v-model="formData.baseDirectory"
            placeholder="/path/to/base"
          />
        </BaseFormGroup>

        <BaseFormGroup label="输出目录">
          <BaseInput
            v-model="formData.outputDirectory"
            placeholder="/path/to/output"
          />
        </BaseFormGroup>

        <BaseFormGroup label="临时目录">
          <BaseInput
            v-model="formData.tempDirectory"
            placeholder="/path/to/temp"
          />
        </BaseFormGroup>

        <BaseFormGroup label="输入目录">
          <BaseInput
            v-model="formData.inputDirectory"
            placeholder="/path/to/input"
          />
        </BaseFormGroup>

        <BaseFormGroup label="用户目录">
          <BaseInput
            v-model="formData.userDirectory"
            placeholder="/path/to/user"
          />
        </BaseFormGroup>

        <BaseFormGroup label="前端根目录">
          <BaseInput
            v-model="formData.frontEndRoot"
            placeholder="/path/to/frontend"
          />
        </BaseFormGroup>

        <BaseFormGroup label="额外模型路径配置">
          <BaseInput
            v-model="formData.extraModelPathsConfig"
            placeholder="/path/to/extra-model-paths.yaml"
          />
        </BaseFormGroup>

        <BaseFormGroup label="Python命令">
          <BaseInput
            v-model="formData.pythonCommand"
            placeholder="python3"
          />
        </BaseFormGroup>

        <BaseFormGroup label="环境初始化脚本">
          <BaseTextarea
            v-model="formData.environmentInitScript"
            placeholder="#!/bin/bash&#10;source /path/to/venv/bin/activate"
            :rows="4"
          />
        </BaseFormGroup>
      </template>
    </BaseAdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useAdminStore } from '@/stores/admin'
import type { ComfyUIService } from '@/types/service'
import BaseAdminModal from '@/components/admin/BaseAdminModal.vue'
import BaseFormGroup from '@/components/admin/BaseFormGroup.vue'
import BaseInput from '@/components/admin/BaseInput.vue'
import BaseTextarea from '@/components/admin/BaseTextarea.vue'
import BaseSelect from '@/components/admin/BaseSelect.vue'
import BaseRadioGroup from '@/components/admin/BaseRadioGroup.vue'

const adminStore = useAdminStore()

// 状态
const showCreateModal = ref(false)
const editingService = ref<ComfyUIService | null>(null)
const isLoading = ref(false)
const testingServiceId = ref<string | null>(null)

// 表单数据
const formData = reactive({
  serverKey: '',
  serverName: '',
  baseUrl: '',
  description: '',
  authMode: 'null',
  apiKey: '',
  timeoutSeconds: 120,
  maxRetries: 3,
  isEnabled: true,
  advancedFeaturesEnabled: false,
  connectionType: 'LOCAL',
  sshHost: '',
  sshPort: 22,
  sshUsername: '',
  sshAuthType: 'PASSWORD',
  sshPassword: '',
  sshPrivateKeyPath: '',
  osType: '',
  workingDirectory: '~',
  environmentInitScript: '',
  pythonCommand: '',
  // directoryConfig 字段
  comfyuiInstallPath: '',
  baseDirectory: '',
  outputDirectory: '',
  tempDirectory: '',
  inputDirectory: '',
  userDirectory: '',
  frontEndRoot: '',
  extraModelPathsConfig: ''
})

// 计算属性
const servers = computed(() => adminStore.servers)

// 加载服务列表
async function loadServers(): Promise<void> {
  isLoading.value = true
  try {
    await adminStore.fetchServers()
  } catch (error) {
    showToast({ type: 'fail', message: '加载服务列表失败' })
  } finally {
    isLoading.value = false
  }
}

// 测试服务连接
async function handleTest(service: ComfyUIService): Promise<void> {
  testingServiceId.value = service.id
  try {
    const updatedService = await adminStore.testServerConnection(service.id)
    showToast({
      type: updatedService.healthStatus === 'HEALTHY' ? 'success' : 'fail',
      message: updatedService.healthStatus === 'HEALTHY' ? '连接测试成功' : '连接测试失败'
    })
  } catch (error) {
    showToast({ type: 'fail', message: '连接测试失败' })
  } finally {
    testingServiceId.value = null
  }
}

// 编辑服务
async function handleEdit(service: ComfyUIService): Promise<void> {
  try {
    // 调用详情接口获取完整数据
    const detail = await adminStore.fetchServerById(service.id)
    if (!detail) {
      showToast({ type: 'fail', message: '获取服务详情失败' })
      return
    }

    editingService.value = detail

    // 填充基础字段
    formData.serverKey = detail.serverKey
    formData.serverName = detail.serverName
    formData.baseUrl = detail.baseUrl
    formData.description = detail.description || ''
    formData.authMode = detail.authMode ?? 'null'
    formData.apiKey = detail.apiKey || ''
    formData.timeoutSeconds = detail.timeoutSeconds || 120
    formData.maxRetries = detail.maxRetries || 3
    formData.isEnabled = detail.isEnabled

    // 填充高级配置字段
    if (detail.advancedFeaturesEnabled && detail.advancedFeatures) {
      formData.advancedFeaturesEnabled = true
      const advanced = detail.advancedFeatures

      formData.connectionType = advanced.connectionType || 'LOCAL'
      formData.osType = advanced.osType || ''
      formData.workingDirectory = advanced.workingDirectory || '~'
      formData.environmentInitScript = advanced.environmentInitScript || ''
      formData.pythonCommand = advanced.pythonCommand || ''

      // SSH配置
      if (advanced.sshConfig) {
        formData.sshHost = advanced.sshConfig.host || ''
        formData.sshPort = advanced.sshConfig.port || 22
        formData.sshUsername = advanced.sshConfig.username || ''
        formData.sshAuthType = advanced.sshConfig.authType || 'PASSWORD'
        formData.sshPassword = advanced.sshConfig.password || ''
        formData.sshPrivateKeyPath = advanced.sshConfig.privateKeyPath || ''
      }

      // 目录配置
      if (advanced.directoryConfig) {
        formData.comfyuiInstallPath = advanced.directoryConfig.comfyuiInstallPath || ''
        formData.baseDirectory = advanced.directoryConfig.baseDirectory || ''
        formData.outputDirectory = advanced.directoryConfig.outputDirectory || ''
        formData.tempDirectory = advanced.directoryConfig.tempDirectory || ''
        formData.inputDirectory = advanced.directoryConfig.inputDirectory || ''
        formData.userDirectory = advanced.directoryConfig.userDirectory || ''
        formData.frontEndRoot = advanced.directoryConfig.frontEndRoot || ''
        formData.extraModelPathsConfig = advanced.directoryConfig.extraModelPathsConfig || ''
      }
    } else {
      formData.advancedFeaturesEnabled = false
    }

    showCreateModal.value = true
  } catch (error) {
    showToast({ type: 'fail', message: '获取服务详情失败' })
  }
}

// 删除服务
async function handleDelete(service: ComfyUIService): Promise<void> {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除服务"${service.serverName}"吗？`
    })

    await adminStore.deleteServer(service.id)
    showToast({ type: 'success', message: '删除成功' })
  } catch (error) {
    // 用户取消删除
  }
}

// 确认按钮处理
async function handleConfirm(): Promise<void> {
  // 基础字段验证
  if (!formData.serverName.trim() || !formData.baseUrl.trim()) {
    showToast({ type: 'fail', message: '请填写必填项' })
    return
  }

  // authMode为basic_auth时，apiKey必填
  if (formData.authMode === 'basic_auth' && !formData.apiKey.trim()) {
    showToast({ type: 'fail', message: '认证模式为Basic Auth时，API密钥必填' })
    return
  }

  // 高级配置验证
  if (formData.advancedFeaturesEnabled) {
    if (!formData.workingDirectory.trim()) {
      showToast({ type: 'fail', message: '工作目录必填' })
      return
    }
    if (!formData.comfyuiInstallPath.trim()) {
      showToast({ type: 'fail', message: 'ComfyUI安装路径必填' })
      return
    }

    // SSH配置验证
    if (formData.connectionType === 'SSH') {
      if (!formData.sshHost.trim() || !formData.sshUsername.trim()) {
        showToast({ type: 'fail', message: 'SSH配置中主机和用户名必填' })
        return
      }
      if (formData.sshAuthType === 'PASSWORD' && !formData.sshPassword.trim()) {
        showToast({ type: 'fail', message: 'SSH密码认证时密码必填' })
        return
      }
    }
  }

  try {
    // 构建请求参数
    const params: any = {
      serverName: formData.serverName,
      baseUrl: formData.baseUrl,
      description: formData.description || undefined,
      authMode: formData.authMode,
      apiKey: formData.authMode === 'basic_auth' ? formData.apiKey : undefined,
      timeoutSeconds: formData.timeoutSeconds,
      maxRetries: formData.maxRetries,
      isEnabled: formData.isEnabled
    }

    // 创建时才传serverKey
    if (!editingService.value && formData.serverKey.trim()) {
      params.serverKey = formData.serverKey
    }

    // 高级配置
    if (formData.advancedFeaturesEnabled) {
      params.advancedFeaturesEnabled = true
      params.advancedFeatures = {
        connectionType: formData.connectionType,
        osType: formData.osType || undefined,
        workingDirectory: formData.workingDirectory,
        environmentInitScript: formData.environmentInitScript || undefined,
        pythonCommand: formData.pythonCommand || undefined,
        directoryConfig: {
          comfyuiInstallPath: formData.comfyuiInstallPath || undefined,
          baseDirectory: formData.baseDirectory || undefined,
          outputDirectory: formData.outputDirectory || undefined,
          tempDirectory: formData.tempDirectory || undefined,
          inputDirectory: formData.inputDirectory || undefined,
          userDirectory: formData.userDirectory || undefined,
          frontEndRoot: formData.frontEndRoot || undefined,
          extraModelPathsConfig: formData.extraModelPathsConfig || undefined
        }
      }

      // SSH配置
      if (formData.connectionType === 'SSH') {
        params.advancedFeatures.sshConfig = {
          host: formData.sshHost,
          port: formData.sshPort,
          username: formData.sshUsername,
          authType: formData.sshAuthType,
          password: formData.sshAuthType === 'PASSWORD' ? formData.sshPassword : undefined,
          privateKeyPath: formData.sshAuthType === 'KEY' ? formData.sshPrivateKeyPath : undefined
        }
      }
    }

    if (editingService.value) {
      // 更新服务
      await adminStore.updateServer(editingService.value.id, params)
      showToast({ type: 'success', message: '更新成功' })
    } else {
      // 创建服务
      await adminStore.createServer(params)
      showToast({ type: 'success', message: '创建成功' })
    }

    // 重置表单并关闭模态框
    resetForm()
    showCreateModal.value = false
  } catch (error) {
    showToast({ type: 'fail', message: '操作失败' })
  }
}

// 取消按钮处理
function handleCancel(): void {
  resetForm()
}

// 重置表单
function resetForm(): void {
  formData.serverKey = ''
  formData.serverName = ''
  formData.baseUrl = ''
  formData.description = ''
  formData.authMode = 'null'
  formData.apiKey = ''
  formData.timeoutSeconds = 120
  formData.maxRetries = 3
  formData.isEnabled = true
  formData.advancedFeaturesEnabled = false
  formData.connectionType = 'LOCAL'
  formData.sshHost = ''
  formData.sshPort = 22
  formData.sshUsername = ''
  formData.sshAuthType = 'PASSWORD'
  formData.sshPassword = ''
  formData.sshPrivateKeyPath = ''
  formData.osType = ''
  formData.workingDirectory = '~'
  formData.environmentInitScript = ''
  formData.pythonCommand = ''
  formData.comfyuiInstallPath = ''
  formData.baseDirectory = ''
  formData.outputDirectory = ''
  formData.tempDirectory = ''
  formData.inputDirectory = ''
  formData.userDirectory = ''
  formData.frontEndRoot = ''
  formData.extraModelPathsConfig = ''
  editingService.value = null
}

// 页面加载时获取服务列表
onMounted(() => {
  loadServers()
})
</script>

<style scoped lang="scss">
.g-service-management-view {
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
  }
}

.m-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.f-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0;
}

.f-services {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}

.f-service-card {
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

.f-service-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
}

.f-service-name {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}

.f-service-url {
  font-size: 11px;
  color: #777777;
  margin-top: 2px;
  font-family: 'Consolas', monospace;
}

.f-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;

  &.online {
    background: rgba(39, 174, 96, 0.15);
    color: #27ae60;
  }

  &.offline {
    background: rgba(231, 76, 60, 0.15);
    color: #e74c3c;
  }
}

.f-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.f-service-desc {
  font-size: 12px;
  color: #999999;
  margin-bottom: 10px;
  line-height: 1.4;
}

.f-service-actions {
  display: flex;
  gap: 6px;

  .f-btn {
    flex: 1;
    padding: 4px 8px;
    font-size: 11px;
  }
}

// 分隔线样式
.f-divider {
  margin: 16px 0 12px;
  padding-top: 16px;
  border-top: 1px solid #3a3a3a;
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
}
</style>
