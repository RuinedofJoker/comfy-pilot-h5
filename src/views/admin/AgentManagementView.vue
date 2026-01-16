<template>
  <div class="g-agent-management-view">
    <!-- 顶部标题栏 -->
    <div class="m-header">
      <h1>Agent 配置管理</h1>
      <button class="f-btn f-btn-primary" @click="showCreateModal = true">
        + 新建 Agent
      </button>
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
              <th>Agent 名称</th>
              <th>类型</th>
              <th>关联模型</th>
              <th>温度</th>
              <th>最大 Token</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agent in filteredAgents" :key="agent.id">
              <td><span class="f-agent-name">{{ agent.name }}</span></td>
              <td>
                <span class="f-tag" :class="getTypeClass(agent.type)">
                  {{ agent.type }}
                </span>
              </td>
              <td>{{ agent.model }}</td>
              <td>{{ agent.temperature }}</td>
              <td>{{ agent.maxTokens.toLocaleString() }}</td>
              <td>
                <span
                  class="f-status"
                  :class="agent.status === '活跃' ? 'active' : 'maintenance'"
                >
                  <span class="f-status-dot"></span>
                  {{ agent.status }}
                </span>
              </td>
              <td>
                <div class="f-actions">
                  <button class="f-btn" @click="handleView(agent)">查看</button>
                  <button class="f-btn" @click="handleEdit(agent)">编辑</button>
                  <button class="f-btn" @click="handleDelete(agent)">删除</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 创建/编辑 Agent 模态框 -->
    <BaseAdminModal
      v-model="showCreateModal"
      :title="editingAgent ? '编辑 Agent' : '新建 Agent'"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <BaseFormGroup label="Agent 名称" required>
        <BaseInput
          v-model="formData.name"
          placeholder="工作流编辑助手"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="类型" required>
        <BaseInput
          v-model="formData.type"
          placeholder="工作流编辑"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="系统提示词" required>
        <BaseTextarea
          v-model="formData.systemPrompt"
          placeholder="定义 Agent 的角色和行为..."
          :rows="4"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="关联模型" required>
        <BaseInput
          v-model="formData.model"
          placeholder="GPT-4 Turbo"
          required
        />
      </BaseFormGroup>

      <BaseFormGroup label="温度参数">
        <BaseInput
          v-model.number="formData.temperature"
          type="number"
          placeholder="0.7"
        />
      </BaseFormGroup>

      <BaseFormGroup label="最大 Token">
        <BaseInput
          v-model.number="formData.maxTokens"
          type="number"
          placeholder="4096"
        />
      </BaseFormGroup>
    </BaseAdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import BaseAdminModal from '@/components/admin/BaseAdminModal.vue'
import BaseFormGroup from '@/components/admin/BaseFormGroup.vue'
import BaseInput from '@/components/admin/BaseInput.vue'
import BaseTextarea from '@/components/admin/BaseTextarea.vue'

// 模拟数据类型
interface Agent {
  id: string
  name: string
  type: string
  model: string
  temperature: number
  maxTokens: number
  status: string
  systemPrompt?: string
}

// 状态
const showCreateModal = ref(false)
const editingAgent = ref<Agent | null>(null)
const searchKeyword = ref('')

// 模拟数据
const agents = ref<Agent[]>([
  {
    id: '1',
    name: '工作流编辑助手',
    type: '工作流编辑',
    model: 'GPT-4 Turbo',
    temperature: 0.7,
    maxTokens: 4096,
    status: '活跃',
    systemPrompt: '你是一个工作流编辑助手...'
  },
  {
    id: '2',
    name: '工作流分析专家',
    type: '工作流分析',
    model: 'Claude 3 Opus',
    temperature: 0.5,
    maxTokens: 8192,
    status: '活跃',
    systemPrompt: '你是一个工作流分析专家...'
  }
])

// 表单数据
const formData = reactive({
  name: '',
  type: '',
  systemPrompt: '',
  model: '',
  temperature: 0.7,
  maxTokens: 4096
})

// 计算属性 - 过滤后的 Agent 列表
const filteredAgents = computed(() => {
  if (!searchKeyword.value) {
    return agents.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return agents.value.filter(
    a => a.name.toLowerCase().includes(keyword) || a.type.toLowerCase().includes(keyword)
  )
})

// 获取类型样式类
function getTypeClass(type: string): string {
  const typeMap: Record<string, string> = {
    '工作流编辑': 'edit',
    '工作流分析': 'analyze',
    '通用助手': 'general'
  }
  return typeMap[type] || 'general'
}

// 查看 Agent
function handleView(agent: Agent): void {
  showToast({ type: 'success', message: `查看 ${agent.name}` })
}

// 编辑 Agent
function handleEdit(agent: Agent): void {
  editingAgent.value = agent
  formData.name = agent.name
  formData.type = agent.type
  formData.systemPrompt = agent.systemPrompt || ''
  formData.model = agent.model
  formData.temperature = agent.temperature
  formData.maxTokens = agent.maxTokens
  showCreateModal.value = true
}

// 删除 Agent
async function handleDelete(agent: Agent): Promise<void> {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除 Agent "${agent.name}" 吗？`
    })
    
    agents.value = agents.value.filter(a => a.id !== agent.id)
    showToast({ type: 'success', message: '删除成功' })
  } catch (error) {
    // 用户取消删除
  }
}

// 确认按钮处理
async function handleConfirm(): Promise<void> {
  if (!formData.name.trim() || !formData.type.trim() || !formData.model.trim()) {
    showToast({ type: 'fail', message: '请填写必填项' })
    return
  }

  if (editingAgent.value) {
    // 更新 Agent
    const index = agents.value.findIndex(a => a.id === editingAgent.value!.id)
    if (index !== -1) {
      const currentAgent = agents.value[index]!
      const updatedAgent: Agent = {
        id: currentAgent.id,
        name: formData.name,
        type: formData.type,
        model: formData.model,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        status: currentAgent.status,
        systemPrompt: formData.systemPrompt
      }
      agents.value[index] = updatedAgent
    }
    showToast({ type: 'success', message: '更新成功' })
  } else {
    // 创建 Agent
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      status: '活跃',
      systemPrompt: formData.systemPrompt
    }
    agents.value.unshift(newAgent)
    showToast({ type: 'success', message: '创建成功' })
  }

  // 重置表单并关闭模态框
  resetForm()
  showCreateModal.value = false
}

// 取消按钮处理
function handleCancel(): void {
  resetForm()
}

// 重置表单
function resetForm(): void {
  formData.name = ''
  formData.type = ''
  formData.systemPrompt = ''
  formData.model = ''
  formData.temperature = 0.7
  formData.maxTokens = 4096
  editingAgent.value = null
}
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

.f-agent-name {
  color: #ffffff;
  font-weight: 500;
}

.f-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;

  &.edit {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  &.analyze {
    background: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
  }

  &.general {
    background: rgba(76, 175, 80, 0.15);
    color: #4caf50;
  }
}

.f-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;

  &.active {
    color: #27ae60;
  }

  &.maintenance {
    color: #f39c12;
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
</style>
