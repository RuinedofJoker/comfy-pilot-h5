/**
 * 路由主文件
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import authRoutes from './routes/auth'
import adminRoutes from './routes/admin'
import userRoutes from './routes/user'
import workflowRoutes from './routes/workflow'
import { setupAuthGuard } from './guards/auth'
import { setupPermissionGuard } from './guards/permission'

/**
 * 基础路由
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  ...authRoutes,
  ...adminRoutes,
  ...userRoutes,
  ...workflowRoutes
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

/**
 * 设置路由守卫
 */
setupAuthGuard(router)
setupPermissionGuard(router)

export default router
