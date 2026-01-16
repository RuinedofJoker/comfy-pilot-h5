/**
 * 权限守卫
 */

import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

/**
 * 设置权限守卫
 */
export function setupPermissionGuard(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    if (requiresAdmin) {
      const userStore = useUserStore()

      // 如果用户信息未加载，先尝试获取
      if (!userStore.userInfo) {
        try {
          await userStore.fetchUserInfo()
        } catch (error) {
          showToast({ type: 'fail', message: '获取用户信息失败' })
          next('/login')
          return
        }
      }

      // 检查用户是否有管理员角色
      const hasAdminRole = userStore.userInfo?.roles?.some(
        role => role.roleCode === 'ADMIN'
      )

      if (!hasAdminRole) {
        showToast({ type: 'fail', message: '无权访问管理后台' })
        next('/')
        return
      }
    }

    next()
  })
}
