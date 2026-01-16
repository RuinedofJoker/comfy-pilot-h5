/**
 * 权限状态管理 Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RoleInfo } from '@/types/auth'
import { getCurrentUserRoles, getCurrentUserPermissions } from '@/services/permission'

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const roles = ref<RoleInfo[]>([])
  const permissions = ref<string[]>([])
  const isLoading = ref(false)

  // 计算属性
  const rolesCodes = computed(() => roles.value.map(role => role.roleCode))
  const isAdmin = computed(() => rolesCodes.value.includes('ADMIN'))

  /**
   * 获取用户角色
   */
  async function fetchRoles(): Promise<void> {
    isLoading.value = true
    try {
      roles.value = await getCurrentUserRoles()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 获取用户权限
   */
  async function fetchPermissions(): Promise<void> {
    isLoading.value = true
    try {
      permissions.value = await getCurrentUserPermissions()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 同时获取角色和权限
   */
  async function fetchRolesAndPermissions(): Promise<void> {
    isLoading.value = true
    try {
      await Promise.all([
        fetchRoles(),
        fetchPermissions()
      ])
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 检查是否有指定权限
   */
  function hasPermission(permission: string): boolean {
    return permissions.value.includes(permission)
  }

  /**
   * 检查是否有指定角色
   */
  function hasRole(roleCode: string): boolean {
    return rolesCodes.value.includes(roleCode)
  }

  /**
   * 清除权限数据
   */
  function clearPermissionData(): void {
    roles.value = []
    permissions.value = []
  }

  return {
    // 状态
    roles,
    permissions,
    isLoading,
    // 计算属性
    rolesCodes,
    isAdmin,
    // 方法
    fetchRoles,
    fetchPermissions,
    fetchRolesAndPermissions,
    hasPermission,
    hasRole,
    clearPermissionData
  }
})
