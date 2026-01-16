/**
 * 权限 API 服务
 */

import http from './http'
import type { RoleInfo } from '@/types/auth'

/**
 * 获取当前用户角色
 */
export function getCurrentUserRoles(): Promise<RoleInfo[]> {
  return http.get('/api/v1/permissions/my-roles')
}

/**
 * 获取当前用户权限
 */
export function getCurrentUserPermissions(): Promise<string[]> {
  return http.get('/api/v1/permissions/my-permissions')
}
