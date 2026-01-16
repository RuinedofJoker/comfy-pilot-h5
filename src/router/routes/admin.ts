/**
 * 管理后台路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayout.vue'),
    meta: {
      title: '管理后台',
      requiresAuth: true,
      requiresAdmin: true
    },
    children: [
      {
        path: '',
        name: 'Admin',
        redirect: '/admin/services'
      },
      {
        path: 'services',
        name: 'AdminServices',
        component: () => import('@/views/admin/ServiceManagementView.vue'),
        meta: {
          title: '服务管理'
        }
      },
      {
        path: 'agents',
        name: 'AdminAgents',
        component: () => import('@/views/admin/AgentManagementView.vue'),
        meta: {
          title: 'Agent 配置'
        }
      },
      {
        path: 'models',
        name: 'AdminModels',
        component: () => import('@/views/admin/ModelManagementView.vue'),
        meta: {
          title: '模型管理'
        }
      }
    ]
  }
]

export default adminRoutes
