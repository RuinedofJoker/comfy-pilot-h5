<template>
  <div class="g-top-nav">
    <!-- 左侧：Logo -->
    <div class="m-nav-left">
      <div class="f-logo" @click="goToHome">
        <div class="f-logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
        </div>
        <span>ComfyUI Pilot</span>
      </div>
    </div>

    <!-- 右侧：导航按钮 + 用户菜单 -->
    <div class="m-nav-right">
      <!-- 我的工作流按钮 -->
      <button class="f-nav-btn" @click="goToWorkflows">
        <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
        </svg>
        <span>我的工作流</span>
      </button>

      <!-- MCP 工具配置按钮 - 仅在工作流编辑器页面显示 -->
      <button v-if="isWorkflowEditorPage" class="f-nav-btn" @click="openMcpConfig">
        <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>MCP 工具</span>
      </button>

      <!-- Agent 配置按钮 -->
      <button class="f-nav-btn" @click="openAgentConfig">
        <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>Agent 配置</span>
      </button>

      <!-- 用户菜单 -->
      <div class="f-user-menu" :class="{ active: showDropdown }">
        <div class="f-user-info" @click="toggleDropdown">
          <div class="f-user-avatar">
            {{ userInitial }}
          </div>
          <span>{{ userName }}</span>
          <span class="f-dropdown-arrow">▼</span>
        </div>

        <!-- 下拉菜单 -->
        <div v-if="showDropdown" class="f-user-dropdown">
          <div class="f-dropdown-header">
            <div class="f-dropdown-user-name">{{ userName }}</div>
            <div class="f-dropdown-user-email">{{ userEmail }}</div>
          </div>
          <div class="f-dropdown-menu">
            <div class="f-dropdown-item" @click="goToProfile">
              <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>个人信息</span>
            </div>
            <div class="f-dropdown-item" @click="goToWorkflows">
              <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
              <span>我的工作流</span>
            </div>
            <div class="f-dropdown-divider"></div>
            <div class="f-dropdown-item danger" @click="handleLogout">
              <svg class="f-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 退出登录确认弹窗 -->
    <LogoutConfirmModal
      v-model:visible="showLogoutModal"
      @confirm="handleConfirmLogout"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from '@/stores/auth'
import LogoutConfirmModal from './LogoutConfirmModal.vue'

interface Emits {
  (e: 'open-mcp-config'): void
  (e: 'open-agent-config'): void
}

const emit = defineEmits<Emits>()

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()

const showDropdown = ref(false)
const showLogoutModal = ref(false)

// 计算属性：判断是否在工作流编辑器页面
const isWorkflowEditorPage = computed(() => {
  return route.path.startsWith('/comfy/workflows/')
})

// 计算属性：用户名
const userName = computed(() => userStore.username || '用户')

// 计算属性：用户邮箱
const userEmail = computed(() => userStore.email || 'user@example.com')

// 计算属性：用户名首字母
const userInitial = computed(() => {
  const name = userStore.username || 'U'
  return name.charAt(0).toUpperCase()
})

// 切换下拉菜单
function toggleDropdown(): void {
  showDropdown.value = !showDropdown.value
}

// 跳转到首页
function goToHome(): void {
  router.push('/services')
}

// 跳转到工作流列表
function goToWorkflows(): void {
  showDropdown.value = false
  router.push('/workflows')
}

// 打开 MCP 配置
function openMcpConfig(): void {
  emit('open-mcp-config')
}

// 打开 Agent 配置
function openAgentConfig(): void {
  emit('open-agent-config')
}

// 跳转到个人信息
function goToProfile(): void {
  showDropdown.value = false
  router.push('/profile')
}

// 退出登录 - 显示确认弹窗
function handleLogout(): void {
  showDropdown.value = false
  showLogoutModal.value = true
}

// 确认退出登录
async function handleConfirmLogout(): Promise<void> {
  try {
    await authStore.logout()
    showLogoutModal.value = false
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    showLogoutModal.value = false
  }
}
</script>

<style scoped lang="scss">
.g-top-nav {
  background: #353535;
  border-bottom: 1px solid #444444;
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.m-nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.f-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
}

.f-logo-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a9eff;

  svg {
    width: 100%;
    height: 100%;
  }
}

.m-nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

// 图标通用样式
.f-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  flex-shrink: 0;
}

// 导航按钮样式
.f-nav-btn {
  padding: 6px 12px;
  background: #2a2a2a;
  color: #cccccc;
  border: 1px solid #444444;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
    color: #ffffff;
  }
}

// 用户菜单样式
.f-user-menu {
  position: relative;
}

.f-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  background: #2a2a2a;
  border: 1px solid #444444;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #3a3a3a;
    border-color: #555555;
  }
}

.f-user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #4a9eff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 600;
  font-size: 11px;
}

.f-dropdown-arrow {
  font-size: 8px;
  color: #888888;
  transition: transform 0.2s;
}

.f-user-menu.active .f-dropdown-arrow {
  transform: rotate(180deg);
}

// 下拉菜单样式
.f-user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: #353535;
  border: 1px solid #444444;
  border-radius: 6px;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 1000;
}

.f-dropdown-header {
  padding: 14px 16px;
  border-bottom: 1px solid #444444;
}

.f-dropdown-user-name {
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 4px;
  font-size: 13px;
}

.f-dropdown-user-email {
  font-size: 11px;
  color: #999999;
}

.f-dropdown-menu {
  padding: 6px 0;
}

.f-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  color: #cccccc;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: #2a2a2a;
    color: #ffffff;
  }

  &.danger {
    color: #ff6b6b;

    &:hover {
      background: rgba(255, 107, 107, 0.1);
    }
  }
}

.f-dropdown-divider {
  height: 1px;
  background: #444444;
  margin: 6px 0;
}
</style>
