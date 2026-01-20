<template>
  <div class="g-agent-management-view">
    <!-- 顶部标题栏 -->
    <div class="m-header">
      <h1>Agent 配置管理</h1>
    </div>

    <!-- 内容区 -->
    <div class="m-content">
      <!-- 搜索栏 -->
      <div class="m-toolbar">
        <input
          v-model="searchKeyword"
          type="text"
          class="f-search"
          placeholder="搜索 Agent..."
        />
      </div>

      <!-- Agent 表格 -->
      <div class="m-table-container">
        <table class="f-table">
          <thead>
            <tr>
              <th>Agent 编码</th>
              <th>Agent 名称</th>
              <th>描述</th>
              <th>版本</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agent in filteredAgents" :key="agent.id">
              <td><span class="f-agent-code">{{ agent.agentCode }}</span></td>
              <td><span class="f-agent-name">{{ agent.agentName }}</span></td>
              <td>{{ agent.description || '-' }}</td>
              <td>{{ agent.version }}</td>
              <td>
                <span
                  class="f-status"
                  :class="agent.status === 'ENABLED' ? 'active' : 'disabled'"
                >
                  <span class="f-status-dot"></span>
                  {{ getStatusText(agent.status) }}
                </span>
              </td>
              <td>
                <div class="f-actions">
                  <button class="f-btn" @click="handleView(agent)">查看</button>
                  <button
                    v-if="agent.status === 'DISABLED'"
                    class="f-btn f-btn-success"
                    @click="handleEnable(agent)"
                  >
                    启用
                  </button>
                  <button
                    v-if="agent.status === 'ENABLED'"
                    class="f-btn f-btn-warning"
                    @click="handleDisable(agent)"
                  >
                    禁用
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Agent 详情模态框 -->
    <BaseAdminModal
      v-model="showDetailModal"
      title="Agent 详情"
      :show-footer="false"
      width="600px"
    >
      <div v-if="selectedAgent" class="m-agent-detail">
        <!-- 基本信息 -->
        <div class="m-detail-section">
          <h3 class="f-section-title">基本信息</h3>
          <div class="f-detail-grid">
            <div class="f-detail-item">
              <span class="f-label">Agent ID:</span>
              <span class="f-value">{{ selectedAgent.id }}</span>
            </div>
            <div class="f-detail-item">
              <span class="f-label">Agent 编码:</span>
              <span class="f-value f-code">{{ selectedAgent.agentCode }}</span>
            </div>
            <div class="f-detail-item">
              <span class="f-label">Agent 名称:</span>
              <span class="f-value">{{ selectedAgent.agentName }}</span>
            </div>
            <div class="f-detail-item">
              <span class="f-label">版本号:</span>
              <span class="f-value">{{ selectedAgent.version }}</span>
            </div>
            <div class="f-detail-item">
              <span class="f-label">状态:</span>
              <span
                class="f-value f-status-badge"
                :class="selectedAgent.status === 'ENABLED' ? 'enabled' : 'disabled'"
              >
                {{ getStatusText(selectedAgent.status) }}
              </span>
            </div>
            <div class="f-detail-item f-full-width">
              <span class="f-label">描述:</span>
              <span class="f-value">{{ selectedAgent.description || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- 时间信息 -->
        <div class="m-detail-section">
          <h3 class="f-section-title">时间信息</h3>
          <div class="f-detail-grid">
            <div class="f-detail-item">
              <span class="f-label">创建时间:</span>
              <span class="f-value">{{ formatDateTime(selectedAgent.createTime) }}</span>
            </div>
            <div class="f-detail-item">
              <span class="f-label">更新时间:</span>
              <span class="f-value">{{ formatDateTime(selectedAgent.updateTime) }}</span>
            </div>
          </div>
        </div>

        <!-- Agent Scope 配置 -->
        <div v-if="selectedAgent.agentScopeConfig" class="m-detail-section">
          <h3 class="f-section-title">Agent Scope 配置</h3>
          <pre class="f-json-viewer">{{ formatJson(selectedAgent.agentScopeConfig) }}</pre>
        </div>

        <!-- Agent 运行时配置 -->
        <div v-if="selectedAgent.config" class="m-detail-section">
          <h3 class="f-section-title">运行时配置</h3>
          <pre class="f-json-viewer">{{ formatJson(selectedAgent.config) }}</pre>
        </div>

        <!-- Agent 配置定义 -->
        <div v-if="selectedAgent.agentConfigDefinitions && selectedAgent.agentConfigDefinitions.length > 0" class="m-detail-section">
          <h3 class="f-section-title">配置定义</h3>
          <div class="f-config-definitions">
            <div
              v-for="(def, index) in selectedAgent.agentConfigDefinitions"
              :key="index"
              class="f-config-def-item"
            >
              <div class="f-config-def-header">
                <span class="f-config-name">{{ def.name }}</span>
                <span class="f-config-type" :class="`type-${def.type.toLowerCase()}`">
                  {{ def.type }}
                </span>
              </div>
              <div v-if="def.description" class="f-config-desc">{{ def.description }}</div>
              <div class="f-config-meta">
                <span v-if="def.require" class="f-meta-tag required">必填</span>
                <span v-if="def.userOverride" class="f-meta-tag override">用户可覆盖</span>
                <span v-if="def.format" class="f-meta-info">格式: {{ def.format }}</span>
                <span v-if="def.intStartScope !== undefined" class="f-meta-info">
                  范围: {{ def.intStartScope }} - {{ def.intEndScope }}
                </span>
                <span v-if="def.floatStartScope !== undefined" class="f-meta-info">
                  范围: {{ def.floatStartScope }} - {{ def.floatEndScope }}
                </span>
                <span v-if="def.modelCallingType" class="f-meta-info">
                  模型类型: {{ def.modelCallingType }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseAdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import type { AgentConfig, AgentStatus } from '@/types/agent'
import { agentApi } from '@/services/agent'
import BaseAdminModal from '@/components/admin/BaseAdminModal.vue'

// 状态
const searchKeyword = ref('')
const agents = ref<AgentConfig[]>([])
const loading = ref(false)
const showDetailModal = ref(false)
const selectedAgent = ref<AgentConfig | null>(null)

// 计算属性 - 过滤后的 Agent 列表
const filteredAgents = computed(() => {
  if (!searchKeyword.value) {
    return agents.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return agents.value.filter(
    a =>
      a.agentName.toLowerCase().includes(keyword) ||
      a.agentCode.toLowerCase().includes(keyword) ||
      (a.description && a.description.toLowerCase().includes(keyword))
  )
})

// 获取状态文本
function getStatusText(status: AgentStatus): string {
  return status === 'ENABLED' ? '已启用' : '已禁用'
}

// 格式化日期时间
function formatDateTime(dateTime: string): string {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 格式化 JSON
function formatJson(jsonStr: string): string {
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (error) {
    return jsonStr
  }
}

// 加载 Agent 列表
async function loadAgents(): Promise<void> {
  try {
    loading.value = true
    agents.value = await agentApi.getAllAgents()
  } catch (error) {
    console.error('加载 Agent 列表失败:', error)
    showToast({ type: 'fail', message: '加载 Agent 列表失败' })
  } finally {
    loading.value = false
  }
}

// 查看 Agent
function handleView(agent: AgentConfig): void {
  selectedAgent.value = agent
  showDetailModal.value = true
}

// 启用 Agent
async function handleEnable(agent: AgentConfig): Promise<void> {
  try {
    await showConfirmDialog({
      title: '确认启用',
      message: `确定要启用 Agent "${agent.agentName}" 吗？`,
      confirmButtonText: '启用',
      cancelButtonText: '取消',
      className: 'custom-confirm-dialog'
    })

    await agentApi.enableAgent(agent.id)
    showToast({ type: 'success', message: '启用成功' })
    await loadAgents()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('启用 Agent 失败:', error)
      showToast({ type: 'fail', message: '启用失败' })
    }
  }
}

// 禁用 Agent
async function handleDisable(agent: AgentConfig): Promise<void> {
  try {
    await showConfirmDialog({
      title: '确认禁用',
      message: `确定要禁用 Agent "${agent.agentName}" 吗？`,
      confirmButtonText: '禁用',
      cancelButtonText: '取消',
      className: 'custom-confirm-dialog'
    })

    await agentApi.disableAgent(agent.id)
    showToast({ type: 'success', message: '禁用成功' })
    await loadAgents()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('禁用 Agent 失败:', error)
      showToast({ type: 'fail', message: '禁用失败' })
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadAgents()
})
</script>

<style scoped lang="scss">
.g-agent-management-view {
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

  &-primary {
    background: #4a9eff;
    border-color: #4a9eff;
    color: #ffffff;

    &:hover {
      background: #5aa8ff;
    }
  }

  &-success {
    background: #27ae60;
    border-color: #27ae60;
    color: #ffffff;

    &:hover {
      background: #2ecc71;
    }
  }

  &-warning {
    background: #e74c3c;
    border-color: #e74c3c;
    color: #ffffff;

    &:hover {
      background: #c0392b;
    }
  }
}

.m-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.m-toolbar {
  margin-bottom: 16px;
}

.f-search {
  padding: 6px 10px;
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  font-size: 12px;
  color: #cccccc;
  width: 200px;
  outline: none;

  &:focus {
    border-color: #555555;
  }

  &::placeholder {
    color: #666666;
  }
}

.m-table-container {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  overflow-x: auto;
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

.f-agent-code {
  color: #999999;
  font-family: 'Courier New', monospace;
  font-size: 11px;
}

.f-agent-name {
  color: #ffffff;
  font-weight: 500;
}

.f-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;

  &.active {
    color: #27ae60;
  }

  &.disabled {
    color: #e74c3c;
  }
}

.f-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.f-actions {
  display: flex;
  gap: 4px;

  .f-btn {
    padding: 4px 8px;
    font-size: 11px;
  }
}

// Agent 详情模态框样式
.m-agent-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.m-detail-section {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.f-section-title {
  font-size: 13px;
  font-weight: 500;
  color: #ffffff;
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #3a3a3a;
}

.f-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.f-detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.f-full-width {
    grid-column: 1 / -1;
  }
}

.f-label {
  font-size: 11px;
  color: #999999;
}

.f-value {
  font-size: 12px;
  color: #cccccc;

  &.f-code {
    font-family: 'Courier New', monospace;
    color: #4a9eff;
  }
}

.f-status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;

  &.enabled {
    background: rgba(39, 174, 96, 0.15);
    color: #27ae60;
  }

  &.disabled {
    background: rgba(231, 76, 60, 0.15);
    color: #e74c3c;
  }
}

.f-json-viewer {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  padding: 12px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  color: #cccccc;
  overflow-x: auto;
  margin: 0;
}

.f-config-definitions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.f-config-def-item {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-radius: 3px;
  padding: 12px;
}

.f-config-def-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.f-config-name {
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  font-family: 'Courier New', monospace;
}

.f-config-type {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;

  &.type-string {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  &.type-int {
    background: rgba(39, 174, 96, 0.15);
    color: #27ae60;
  }

  &.type-float {
    background: rgba(46, 204, 113, 0.15);
    color: #2ecc71;
  }

  &.type-boolean {
    background: rgba(243, 156, 18, 0.15);
    color: #f39c12;
  }

  &.type-model {
    background: rgba(155, 89, 182, 0.15);
    color: #9b59b6;
  }
}

.f-config-desc {
  font-size: 11px;
  color: #999999;
  margin-bottom: 8px;
  line-height: 1.5;
}

.f-config-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.f-meta-tag {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;

  &.required {
    background: rgba(231, 76, 60, 0.15);
    color: #e74c3c;
  }

  &.override {
    background: rgba(52, 152, 219, 0.15);
    color: #3498db;
  }
}

.f-meta-info {
  font-size: 10px;
  color: #666666;
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
    background: #4a9eff !important;
    border: none;
    color: #ffffff !important;
  }
}
</style>
