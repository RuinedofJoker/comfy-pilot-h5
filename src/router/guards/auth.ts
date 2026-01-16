/**
 * 认证守卫
 */

import type { Router } from 'vue-router'
import { getToken } from '@/utils/storage'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { showToast } from 'vant'

/**
 * 设置认证守卫
 */
export function setupAuthGuard(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const token = getToken()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    // 需要认证但未登录
    if (requiresAuth && !token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 已登录访问登录页，重定向到服务选择页
    if (to.path === '/login' && token) {
      next('/services')
      return
    }

    // 如果已登录且需要认证，加载用户信息
    if (token && requiresAuth) {
      const userStore = useUserStore()
      const permissionStore = usePermissionStore()

      // 如果用户信息未加载，则加载
      if (!userStore.userInfo) {
        try {
          // 并行加载用户信息、角色和权限
          await Promise.all([
            userStore.fetchUserInfo(),
            permissionStore.fetchRolesAndPermissions()
          ])
        } catch (error) {
          console.error('加载用户信息失败:', error)
          showToast({ type: 'fail', message: '加载用户信息失败，请重新登录' })

          // 清除 token 并跳转到登录页
          userStore.clearUserData()
          permissionStore.clearPermissionData()

          next({
            path: '/login',
            query: { redirect: to.fullPath }
          })
          return
        }
      }
    }

    next()
  })
}
