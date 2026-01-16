<template>
  <div class="g-model-management-view">
    <!-- 顶部标题栏 -->
    <div class="m-header">
      <h1>AI 模型管理</h1>
      <div class="f-header-actions">
        <button class="f-btn f-btn-primary" @click="showProviderModal = true">
          + 新建提供商
        </button>
        <button class="f-btn f-btn-primary" @click="showModelModal = true">
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
            :key="provider.code"
            class="f-provider-card"
          >
            <div class="f-provider-header">
              <div>
                <div class="f-provider-name">{{ provider.name }}</div>
                <div class="f-provider-code">{{ provider.code }}</div>
              </div>
              <span class="f-status active">
                <span class="f-status-dot"></span>
                活跃
              </span>
            </div>
            <div class="f-provider-stats">
              <div class="f-stat">
                <div class="f-stat-value">{{ provider.models }}</div>
                模型数
              </div>
              <div class="f-stat">
                <div class="f-stat-value">{{ provider.calls }}</div>
                今日调用
              </div>
            </div>
            <div class="f-provider-actions">
              <button class="f-btn">查看</button>
              <button class="f-btn">编辑</button>
              <button class="f-btn">测试</button>
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
                <th>提供商</th>
                <th>类型</th>
                <th>最大 Token</th>
                <th>输入价格</th>
                <th>输出价格</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="model in filteredModels" :key="model.id">
                <td><span class="f-model-name">{{ model.name }}</span></td>
                <td>{{ model.provider }}</td>
                <td>
                  <span class="f-tag" :class="model.type.toLowerCase()">
                    {{ model.type }}
                  </span>
                </td>
                <td>{{ model.tokens.toLocaleString() }}</td>
                <td>¥{{ model.input }}/1K</td>
                <td>¥{{ model.output }}/1K</td>
                <td>
                  <div class="f-actions">
                    <button class="f-btn">查看</button>
                    <button class="f-btn">编辑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 模拟数据类型
interface Provider {
  code: string
  name: string
  models: number
  calls: number
}

interface Model {
  id: string
  name: string
  provider: string
  type: string
  tokens: number
  input: number
  output: number
}

// 状态
const activeTab = ref<'providers' | 'models'>('providers')
const showProviderModal = ref(false)
const showModelModal = ref(false)
const searchKeyword = ref('')

// 模拟数据 - 提供商
const providers = ref<Provider[]>([
  { code: 'OPENAI', name: 'OpenAI', models: 8, calls: 1247 },
  { code: 'ANTHROPIC', name: 'Anthropic', models: 4, calls: 856 },
  { code: 'ZHIPU', name: '智谱AI', models: 5, calls: 623 },
  { code: 'QWEN', name: '通义千问', models: 4, calls: 512 },
  { code: 'DEEPSEEK', name: 'DeepSeek', models: 2, calls: 234 }
])

// 模拟数据 - 模型
const models = ref<Model[]>([
  { id: '1', name: 'GPT-4 Turbo', provider: 'OpenAI', type: 'LLM', tokens: 128000, input: 0.01, output: 0.03 },
  { id: '2', name: 'GPT-3.5 Turbo', provider: 'OpenAI', type: 'LLM', tokens: 16385, input: 0.0005, output: 0.0015 },
  { id: '3', name: 'Claude 3 Opus', provider: 'Anthropic', type: 'LLM', tokens: 200000, input: 0.015, output: 0.075 },
  { id: '4', name: 'GLM-4', provider: '智谱AI', type: 'LLM', tokens: 128000, input: 0.01, output: 0.01 },
  { id: '5', name: 'text-embedding-3-large', provider: 'OpenAI', type: 'EMBEDDING', tokens: 8191, input: 0.00013, output: 0 }
])

// 计算属性 - 过滤后的模型列表
const filteredModels = computed(() => {
  if (!searchKeyword.value) {
    return models.value
  }
  const keyword = searchKeyword.value.toLowerCase()
  return models.value.filter(
    m => m.name.toLowerCase().includes(keyword) || m.provider.toLowerCase().includes(keyword)
  )
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
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 10px;
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

.f-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;

  &.active {
    background: rgba(39, 174, 96, 0.15);
    color: #27ae60;
  }
}

.f-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.f-provider-stats {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #3a3a3a;
  margin-bottom: 10px;
}

.f-stat {
  font-size: 11px;
  color: #777777;
}

.f-stat-value {
  font-size: 13px;
  color: #cccccc;
  font-weight: 500;
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

  &.llm {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  &.embedding {
    background: rgba(156, 39, 176, 0.15);
    color: #9c27b0;
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
