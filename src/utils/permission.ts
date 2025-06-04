/**
 * 权限验证工具函数
 */

import { usePermissionStore } from '@/store/modules/permission'

/**
 * 检查是否具有指定权限
 * @param permission 权限码
 * @returns 是否有权限
 */
export function hasPermission(permission: string): boolean {
  const permissionStore = usePermissionStore()
  return permissionStore.hasPermission(permission)
}

/**
 * 检查是否具有任一权限
 * @param permissions 权限码数组
 * @returns 是否有任一权限
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const permissionStore = usePermissionStore()
  return permissionStore.hasAnyPermission(permissions)
}

/**
 * 检查是否具有所有权限
 * @param permissions 权限码数组
 * @returns 是否有所有权限
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const permissionStore = usePermissionStore()
  return permissions.every(permission => permissionStore.hasPermission(permission))
}

/**
 * 检查是否具有指定角色
 * @param role 角色码
 * @returns 是否有角色
 */
export function hasRole(role: string): boolean {
  const permissionStore = usePermissionStore()
  return permissionStore.hasRole(role)
}

/**
 * 检查是否具有任一角色
 * @param roles 角色码数组
 * @returns 是否有任一角色
 */
export function hasAnyRole(roles: string[]): boolean {
  const permissionStore = usePermissionStore()
  return roles.some(role => permissionStore.hasRole(role))
}

/**
 * 检查是否为超级管理员
 * @returns 是否为超级管理员
 */
export function isSuperAdmin(): boolean {
  const permissionStore = usePermissionStore()
  return permissionStore.hasRole('super_admin')
} 