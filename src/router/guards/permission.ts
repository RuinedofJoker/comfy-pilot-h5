/**
 * 权限守卫
 */

import type { Router } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { showToast } from 'vant'

/**
 * 设置权限守卫
 */
export function setupPermissionGuard(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    if (requiresAdmin) {
      const permissionStore = usePermissionStore()

      // 检查是否是管理员
      if (!permissionStore.isAdmin) {
        showToast({ type: 'fail', message: '无权访问管理后台' })
        next('/')
        return
      }
    }

    next()
  })
}
