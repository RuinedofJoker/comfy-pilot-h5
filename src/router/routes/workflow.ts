/**
 * 工作流路由配置
 */

import type { RouteRecordRaw } from 'vue-router'

const workflowRoutes: RouteRecordRaw[] = [
  {
    path: '/comfy/workflows/:serviceId',
    name: 'WorkflowEditor',
    component: () => import('@/views/workflow/WorkflowEditorView.vue'),
    meta: {
      title: '工作流编辑器',
      requiresAuth: true
    }
  }
]

export default workflowRoutes
