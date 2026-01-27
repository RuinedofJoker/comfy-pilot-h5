<template>
  <div class="g-user-profile-view">
    <!-- 顶部导航栏 -->
    <TopNavBar @open-agent-config="showAgentConfigModal = true" />

    <!-- Agent 配置弹窗 -->
    <AgentConfigModal v-model:visible="showAgentConfigModal" />

    <!-- 主内容区 -->
    <div class="m-main-container">
      <!-- 个人信息头部 -->
      <div class="m-profile-header">
        <div class="f-avatar-section">
          <div class="f-avatar-large">
            {{ userInitial }}
          </div>
          <button class="f-change-avatar-btn">
            <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zm0-5.4c1.21 0 2.2.99 2.2 2.2s-.99 2.2-2.2 2.2-2.2-.99-2.2-2.2.99-2.2 2.2-2.2z"/>
              <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm11 14H4V6h4.05l1.83-2h4.24l1.83 2H20v10z"/>
            </svg>
            <span>更换头像</span>
          </button>
        </div>

        <div class="f-profile-info">
          <h1 class="f-profile-name">{{ userName }}</h1>
          <div class="f-profile-email">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>{{ userEmail }}</span>
          </div>

          <div class="f-profile-stats">
            <div class="f-stat-item">
              <div class="f-stat-value">{{ stats.totalWorkflows }}</div>
              <div class="f-stat-label">工作流总数</div>
            </div>
            <div class="f-stat-item">
              <div class="f-stat-value">{{ stats.activeSessions }}</div>
              <div class="f-stat-label">活跃会话</div>
            </div>
            <div class="f-stat-item">
              <div class="f-stat-value">{{ stats.workflowVersions }}</div>
              <div class="f-stat-label">工作流版本</div>
            </div>
            <div class="f-stat-item">
              <div class="f-stat-value">{{ stats.usageDays }}</div>
              <div class="f-stat-label">使用天数</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="m-profile-section">
        <div class="f-section-header">
          <h2 class="f-section-title">
            <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>基本信息</span>
          </h2>
        </div>

        <div class="f-form-group">
          <label class="f-form-label">用户编码</label>
          <input type="text" class="f-form-input" :value="userInfo?.id" disabled>
        </div>

        <div class="f-form-row">
          <div class="f-form-group">
            <label class="f-form-label">显示名称</label>
            <input
              type="text"
              class="f-form-input"
              v-model="formData.username"
              placeholder="请输入显示名称"
            >
          </div>
          <div class="f-form-group">
            <label class="f-form-label">邮箱地址</label>
            <input
              type="email"
              class="f-form-input"
              :value="userEmail"
              disabled
            >
          </div>
        </div>

        <div class="f-form-row">
          <div class="f-form-group">
            <label class="f-form-label">注册时间</label>
            <input
              type="text"
              class="f-form-input"
              :value="formatDate(userInfo?.createTime)"
              disabled
            >
          </div>
          <div class="f-form-group">
            <label class="f-form-label">最后登录</label>
            <input
              type="text"
              class="f-form-input"
              :value="formatDate(userInfo?.lastLoginTime)"
              disabled
            >
          </div>
        </div>

        <div class="f-form-actions">
          <button class="f-btn f-btn-secondary" @click="resetForm">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            <span>重置</span>
          </button>
          <button class="f-btn f-btn-primary" @click="handleSaveProfile" :disabled="isUpdating">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
            <span>{{ isUpdating ? '保存中...' : '保存修改' }}</span>
          </button>
        </div>
      </div>

      <!-- 账号安全 -->
      <div class="m-profile-section">
        <div class="f-section-header">
          <h2 class="f-section-title">
            <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <span>账号安全</span>
          </h2>
        </div>

        <div class="f-form-group">
          <label class="f-form-label">登录方式</label>
          <div class="f-security-row">
            <div class="f-security-info">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <span>密码登录</span>
            </div>
            <button class="f-btn f-btn-secondary" @click="openPasswordModal">
              <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              <span>更新密码</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 危险操作 -->
      <div class="m-profile-section">
        <div class="f-section-header">
          <h2 class="f-section-title">
            <svg class="f-icon f-icon-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
            <span>危险操作</span>
          </h2>
        </div>

        <div class="f-form-group">
          <label class="f-form-label">删除账号</label>
          <div class="f-danger-warning">
            删除账号后，所有工作流、会话和数据将被永久删除，且无法恢复。
          </div>
          <button class="f-btn f-btn-danger" @click="handleDeleteAccount">
            <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>删除我的账号</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 修改密码模态框 -->
    <div v-if="showPasswordModal" class="m-modal-overlay" @click="closePasswordModal">
      <div class="m-password-modal" @click.stop>
        <div class="f-modal-header">
          <div class="f-modal-logo">
            <svg class="f-icon f-icon-xl" viewBox="0 0 24 24" fill="currentColor" style="color: #4a9eff;">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </div>
          <button class="f-modal-close" @click="closePasswordModal">
            <span>×</span>
          </button>
        </div>

        <div class="f-modal-body">
          <h3 class="f-modal-title">修改密码</h3>

          <div class="f-form-group">
            <label class="f-form-label">输入新密码</label>
            <div class="f-password-input-wrapper">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                class="f-form-input"
                v-model="passwordForm.newPassword"
                placeholder="输入新密码"
              >
              <button
                type="button"
                class="f-password-toggle-btn"
                @click="showNewPassword = !showNewPassword"
              >
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="f-form-group">
            <label class="f-form-label">确认密码</label>
            <div class="f-password-input-wrapper">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                class="f-form-input"
                v-model="passwordForm.confirmPassword"
                placeholder="再次输入相同的密码"
              >
              <button
                type="button"
                class="f-password-toggle-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg class="f-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
          </div>

          <button
            class="f-btn f-btn-primary f-btn-full"
            @click="handleUpdatePassword"
            :disabled="isUpdatingPassword"
          >
            {{ isUpdatingPassword ? '更新中...' : '更新密码' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { ref, computed } from 'vue'
import TopNavBar from '@/components/user/TopNavBar.vue'
import AgentConfigModal from '@/components/user/AgentConfigModal.vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()

// Agent 配置弹窗状态
const showAgentConfigModal = ref(false)

// 状态管理
const showPasswordModal = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const isUpdating = ref(false)
const isUpdatingPassword = ref(false)

// 表单数据
const formData = reactive({
  username: ''
})

// 密码表单
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

// 统计数据（模拟数据，实际应从后端获取）
const stats = reactive({
  totalWorkflows: 0,
  activeSessions: 0,
  workflowVersions: 0,
  usageDays: 0
})

// 计算属性
const userInfo = computed(() => userStore.userInfo)
const userName = computed(() => userStore.username || '用户')
const userEmail = computed(() => userStore.email || 'user@example.com')
const userInitial = computed(() => {
  const name = userStore.username || 'U'
  return name.charAt(0).toUpperCase()
})

// 监听用户信息变化
watch(
  userInfo,
  (newUserInfo) => {
    if (newUserInfo) {
      formData.username = newUserInfo.username || ''
      
      // 计算使用天数
      if (newUserInfo.createTime) {
        const createDate = new Date(newUserInfo.createTime)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - createDate.getTime())
        stats.usageDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
    }
  },
  { immediate: true }
)

// 格式化日期
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return '-'
  }
}

// 重置表单
function resetForm(): void {
  if (userInfo.value) {
    formData.username = userInfo.value.username || ''
  }
  showToast({ type: 'success', message: '表单已重置' })
}

// 保存个人信息
async function handleSaveProfile(): Promise<void> {
  if (!formData.username.trim()) {
    showToast({ type: 'fail', message: '用户名不能为空' })
    return
  }

  try {
    isUpdating.value = true
    await userStore.updateUserInfo({
      username: formData.username
    })
    showToast({ type: 'success', message: '个人信息已保存' })
  } catch (error) {
    showToast({ type: 'fail', message: '保存失败，请重试' })
  } finally {
    isUpdating.value = false
  }
}

// 打开密码修改模态框
function openPasswordModal(): void {
  showPasswordModal.value = true
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  showNewPassword.value = false
  showConfirmPassword.value = false
}

// 关闭密码修改模态框
function closePasswordModal(): void {
  showPasswordModal.value = false
}

// 更新密码
async function handleUpdatePassword(): Promise<void> {
  const { newPassword, confirmPassword } = passwordForm

  if (!newPassword || !confirmPassword) {
    showToast({ type: 'fail', message: '请填写完整的密码信息' })
    return
  }

  if (newPassword.length < 8) {
    showToast({ type: 'fail', message: '密码长度至少为8个字符' })
    return
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d).+$/.test(newPassword)) {
    showToast({ type: 'fail', message: '密码必须包含字母和数字' })
    return
  }

  if (newPassword !== confirmPassword) {
    showToast({ type: 'fail', message: '两次输入的密码不一致' })
    return
  }

  try {
    isUpdatingPassword.value = true
    // TODO: 调用修改密码 API
    // await authStore.updatePassword({ newPassword })
    
    showToast({ type: 'success', message: '密码更新成功' })
    closePasswordModal()
  } catch (error) {
    showToast({ type: 'fail', message: '密码更新失败，请重试' })
  } finally {
    isUpdatingPassword.value = false
  }
}

// 删除账号
async function handleDeleteAccount(): Promise<void> {
  try {
    await showConfirmDialog({
      title: '⚠️ 危险操作',
      message: '删除账号后，所有工作流、会话和数据将被永久删除，且无法恢复。\n\n确定要删除账号吗？',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#e74c3c'
    })

    // 二次确认
    await showConfirmDialog({
      title: '⚠️ 最后确认',
      message: '真的要删除账号吗？此操作不可逆！',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonColor: '#e74c3c'
    })

    // TODO: 调用删除账号 API
    showToast({ type: 'success', message: '账号已删除' })
    
    // 登出并跳转到登录页
    await authStore.logout()
  } catch {
    // 用户取消操作
  }
}
</script>

<style scoped lang="scss">
.g-user-profile-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.m-main-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  &::-webkit-scrollbar-thumb {
    background: #444444;
    border-radius: 4px;

    &:hover {
      background: #555555;
    }
  }
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;

  &.f-icon-lg {
    width: 20px;
    height: 20px;
  }

  &.f-icon-xl {
    width: 24px;
    height: 24px;
  }
}

// 个人信息头部
.m-profile-header {
  background: #353535;
  border: 1px solid #444444;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 20px;
  display: flex;
  gap: 32px;
  align-items: center;
}

.f-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.f-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a9eff 0%, #3d7acc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 600;
  border: 3px solid #444444;
}

.f-change-avatar-btn {
  padding: 6px 14px;
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}

.f-profile-info {
  flex: 1;
}

.f-profile-name {
  font-size: 28px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
}

.f-profile-email {
  font-size: 14px;
  color: #999999;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.f-profile-stats {
  display: flex;
  gap: 32px;
  padding: 16px 0;
  border-top: 1px solid #444444;
}

.f-stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.f-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #4a9eff;
}

.f-stat-label {
  font-size: 12px;
  color: #999999;
}

// 表单区域
.m-profile-section {
  background: #353535;
  border: 1px solid #444444;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.f-section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #444444;
}

.f-section-title {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.f-form-group {
  margin-bottom: 20px;
}

.f-form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #cccccc;
  margin-bottom: 8px;
}

.f-form-input {
  width: 100%;
  padding: 10px 14px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 4px;
  font-size: 14px;
  color: #ffffff;
  transition: all 0.2s;
  outline: none;

  &:focus {
    border-color: #4a9eff;
    background: #2f2f2f;
  }

  &:disabled {
    background: #1a1a1a;
    color: #666666;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #666666;
  }
}

.f-form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.f-form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #444444;
}

.f-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.f-btn-primary {
  background: #4a9eff;
  color: white;

  &:hover:not(:disabled) {
    background: #3d8de6;
  }
}

.f-btn-secondary {
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}

.f-btn-danger {
  background: #e74c3c;
  color: white;

  &:hover {
    background: #c0392b;
  }
}

.f-btn-full {
  width: 100%;
  justify-content: center;
  margin-top: 8px;
}

// 安全区域
.f-security-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.f-security-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cccccc;
  font-size: 14px;
}

// 危险警告
.f-danger-warning {
  font-size: 13px;
  color: #999999;
  line-height: 1.6;
  margin-bottom: 16px;
  padding: 12px;
  background: #2a2a2a;
  border-left: 3px solid #e74c3c;
  border-radius: 4px;
}

// 密码模态框
.m-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.m-password-modal {
  background: #2a2a2a;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  border: 1px solid #444444;
  overflow: hidden;
}

.f-modal-header {
  padding: 24px 24px 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.f-modal-logo {
  width: 48px;
  height: 48px;
  background: rgba(74, 158, 255, 0.15);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.f-modal-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #999999;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 20px;

  &:hover {
    background: #3a3a3a;
    color: #ffffff;
  }
}

.f-modal-body {
  padding: 20px 24px 24px 24px;
}

.f-modal-title {
  font-size: 20px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 20px;
}

.f-password-input-wrapper {
  position: relative;
}

.f-password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #666666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #999999;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .m-main-container {
    padding: 16px;
  }

  .m-profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .f-profile-stats {
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }

  .f-form-row {
    grid-template-columns: 1fr;
  }

  .f-form-actions {
    flex-direction: column;

    .f-btn {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
