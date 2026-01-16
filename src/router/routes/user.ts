/**
 * 用户路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/services',
    name: 'ServiceSelection',
    component: () => import('@/views/user/ServiceSelectionView.vue'),
    meta: {
      title: '选择服务',
      requiresAuth: true
    }
  },
  {
    path: '/workflows',
    name: 'WorkflowList',
    component: () => import('@/views/user/WorkflowListView.vue'),
    meta: {
      title: '我的工作流',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/UserProfileView.vue'),
    meta: {
      title: '个人信息',
      requiresAuth: true
    }
  }
]

export default userRoutes
