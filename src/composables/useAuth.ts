/**
 * 认证逻辑封装 Composable
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginParams, RegisterParams } from '@/types/auth'
import { register as registerApi } from '@/services/auth'

export function useAuth() {
  const router = useRouter()
  const authStore = useAuthStore()

  const loading = ref(false)
  const error = ref<string>('')

  // 计算属性
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isAdmin = computed(() => authStore.isAdmin)
  const userInfo = computed(() => authStore.userInfo)

  /**
   * 登录
   */
  async function login(params: LoginParams): Promise<boolean> {
    loading.value = true
    error.value = ''

    try {
      await authStore.login(params)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 注册
   */
  async function register(params: RegisterParams): Promise<boolean> {
    loading.value = true
    error.value = ''

    try {
      await registerApi(params)
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  async function logout(): Promise<void> {
    loading.value = true

    try {
      await authStore.logout()
      router.push('/login')
    } catch (err) {
      console.error('登出失败:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查认证状态
   */
  function checkAuth(): boolean {
    return authStore.isAuthenticated
  }

  /**
   * 检查管理员权限
   */
  function checkAdmin(): boolean {
    return authStore.isAdmin
  }

  return {
    // 状态
    loading,
    error,
    // 计算属性
    isAuthenticated,
    isAdmin,
    userInfo,
    // 方法
    login,
    register,
    logout,
    checkAuth,
    checkAdmin
  }
}
