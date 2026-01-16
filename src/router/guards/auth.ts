/**
 * 认证守卫
 */

import type { Router } from 'vue-router'
import { getToken } from '@/utils/storage'

/**
 * 设置认证守卫
 */
export function setupAuthGuard(router: Router): void {
  router.beforeEach((to, from, next) => {
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

    next()
  })
}
