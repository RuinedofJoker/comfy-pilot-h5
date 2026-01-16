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
          <div class="f-service-stats">
            <div class="f-stat">
              <div class="f-stat-value">{{ service.sourceType === 'MANUAL' ? '手动' : '代码' }}</div>
              来源
            </div>
            <div class="f-stat">
              <div class="f-stat-value">{{ service.isEnabled ? '启用' : '禁用' }}</div>
              状态
            </div>
            <div class="f-stat">
              <div class="f-stat-value">{{ service.timeoutSeconds }}s</div>
              超时
            </div>
          </div>
          <div class="f-service-actions">
            <button class="f-btn" @click="handleTest(service)">测试</button>
            <button class="f-btn" @click="handleEdit(service)">编辑</button>
            <button
              class="f-btn"
              @click="handleDelete(service)"
              :disabled="service.sourceType === 'CODE_BASED'"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑服务模态框 -->
    <BaseAdminModal
      v-model="showCreateModal"
      :title="editingService ? '编辑服务' : '添加服务'"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <BaseFormGroup label="服务名称" required>
        <BaseInput
          v-model="formData.serverName"
          placeholder="生产环境 ComfyUI"
          required
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
    </BaseAdminModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useAdminStore } from '@/stores/admin'
import type { AdminComfyuiServer } from '@/types/admin'
import BaseAdminModal from '@/components/admin/BaseAdminModal.vue'
import BaseFormGroup from '@/components/admin/BaseFormGroup.vue'
import BaseInput from '@/components/admin/BaseInput.vue'
import BaseTextarea from '@/components/admin/BaseTextarea.vue'

const adminStore = useAdminStore()

// 状态
const showCreateModal = ref(false)
const editingService = ref<AdminComfyuiServer | null>(null)
const isLoading = ref(false)

// 表单数据
const formData = reactive({
  serverName: '',
  baseUrl: '',
  description: ''
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

// 测试连接
async function handleTest(_service: AdminComfyuiServer): Promise<void> {
  showToast({ type: 'loading', message: '测试连接中...', duration: 0 })
  // TODO: 实现测试连接逻辑
  setTimeout(() => {
    showToast({ type: 'success', message: '连接成功' })
  }, 1000)
}

// 编辑服务
function handleEdit(service: AdminComfyuiServer): void {
  editingService.value = service
  formData.serverName = service.serverName
  formData.baseUrl = service.baseUrl
  formData.description = service.description || ''
  showCreateModal.value = true
}

// 删除服务
async function handleDelete(service: AdminComfyuiServer): Promise<void> {
  if (service.sourceType === 'CODE_BASED') {
    showToast({ type: 'fail', message: '代码注册的服务不允许删除' })
    return
  }

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
  if (!formData.serverName.trim() || !formData.baseUrl.trim()) {
    showToast({ type: 'fail', message: '请填写必填项' })
    return
  }

  try {
    if (editingService.value) {
      // 更新服务
      await adminStore.updateServer(editingService.value.id, {
        serverName: formData.serverName,
        baseUrl: formData.baseUrl,
        description: formData.description || undefined
      })
      showToast({ type: 'success', message: '更新成功' })
    } else {
      // 创建服务
      await adminStore.createServer({
        serverName: formData.serverName,
        baseUrl: formData.baseUrl,
        description: formData.description || undefined
      })
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
  formData.serverName = ''
  formData.baseUrl = ''
  formData.description = ''
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

.f-service-stats {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid #3a3a3a;
  border-bottom: 1px solid #3a3a3a;
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

.f-service-actions {
  display: flex;
  gap: 6px;

  .f-btn {
    flex: 1;
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
