/**
 * Toast 提示工具
 */

import { createApp, type App } from 'vue'
import BaseToast from '@/components/base/BaseToast.vue'

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

let toastInstance: App | null = null

function showToast(options: ToastOptions): void {
  // 如果已有 Toast 实例，先销毁
  if (toastInstance) {
    toastInstance.unmount()
    toastInstance = null
  }

  // 创建容器
  const container = document.createElement('div')
  document.body.appendChild(container)

  // 创建 Toast 实例
  toastInstance = createApp(BaseToast, {
    ...options,
    onClose: () => {
      if (toastInstance) {
        toastInstance.unmount()
        toastInstance = null
      }
      document.body.removeChild(container)
    }
  })

  toastInstance.mount(container)
}

export const toast = {
  success: (message: string, duration = 3000) => {
    showToast({ message, type: 'success', duration })
  },
  error: (message: string, duration = 3000) => {
    showToast({ message, type: 'error', duration })
  },
  warning: (message: string, duration = 3000) => {
    showToast({ message, type: 'warning', duration })
  },
  info: (message: string, duration = 3000) => {
    showToast({ message, type: 'info', duration })
  }
}
