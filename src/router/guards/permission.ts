/**
 * 权限守卫
 */

import type { Router } from 'vue-router'

/**
 * 设置权限守卫
 */
export function setupPermissionGuard(router: Router): void {
  router.beforeEach((to, from, next) => {
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)

    if (requiresAdmin) {
      // TODO: 实现管理员权限检查
      // 当前暂时允许所有已登录用户访问管理页面
      // 后续需要根据后端返回的角色信息进行权限判断
      next()
      return
    }

    next()
  })
}
