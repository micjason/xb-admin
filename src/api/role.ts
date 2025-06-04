import http from './index'
import type { ApiResponse } from '@/types/api'
import type {
  Role,
  RoleForm,
  RoleListRequest,
  RoleListResponse,
  RolePermissionRequest,
  RoleStatusRequest,
  RoleBatchDeleteRequest,
  RoleSortRequest,
  RoleExportRequest,
  Permission,
  PermissionTreeNode
} from '@/types/role'

/**
 * 获取角色列表
 */
export const getRoleList = (params: RoleListRequest): Promise<ApiResponse<RoleListResponse>> => {
  return http.get('/roles', { params })
}

/**
 * 获取角色详情
 */
export const getRoleById = (id: number): Promise<ApiResponse<Role>> => {
  return http.get(`/roles/${id}`)
}

/**
 * 创建角色
 */
export const createRole = (data: RoleForm): Promise<ApiResponse<Role>> => {
  return http.post('/roles', data)
}

/**
 * 更新角色
 */
export const updateRole = (id: number, data: RoleForm): Promise<ApiResponse<Role>> => {
  return http.put(`/roles/${id}`, data)
}

/**
 * 删除角色
 */
export const deleteRole = (id: number): Promise<ApiResponse<void>> => {
  return http.delete(`/roles/${id}`)
}

/**
 * 批量删除角色
 */
export const batchDeleteRoles = (data: RoleBatchDeleteRequest): Promise<ApiResponse<void>> => {
  return http.post('/roles/batch-delete', data)
}

/**
 * 更新角色状态
 */
export const updateRoleStatus = (data: RoleStatusRequest): Promise<ApiResponse<void>> => {
  return http.patch('/roles/status', data)
}

/**
 * 更新角色排序
 */
export const updateRoleSort = (data: RoleSortRequest): Promise<ApiResponse<void>> => {
  return http.patch('/roles/sort', data)
}

/**
 * 获取角色权限列表
 */
export const getRolePermissions = (roleId: number): Promise<ApiResponse<number[]>> => {
  return http.get(`/roles/${roleId}/permissions`)
}

/**
 * 分配角色权限
 */
export const assignRolePermissions = (data: RolePermissionRequest): Promise<ApiResponse<void>> => {
  return http.post('/roles/permissions', data)
}

/**
 * 获取所有权限列表（树形结构）
 */
export const getPermissionTree = (): Promise<ApiResponse<Permission[]>> => {
  return http.get('/permissions/tree')
}

/**
 * 获取权限树节点（用于权限选择组件）
 */
export const getPermissionTreeNodes = (): Promise<ApiResponse<PermissionTreeNode[]>> => {
  return http.get('/permissions/tree-nodes')
}

/**
 * 导出角色数据
 */
export const exportRoles = (params: RoleExportRequest): Promise<Blob> => {
  return http.get('/roles/export', { 
    params,
    responseType: 'blob'
  })
}

/**
 * 检查角色编码是否唯一
 */
export const checkRoleCodeUnique = (code: string, excludeId?: number): Promise<ApiResponse<boolean>> => {
  return http.get('/roles/check-code', {
    params: { code, excludeId }
  })
}

/**
 * 获取角色选项列表（用于其他模块的角色选择）
 */
export const getRoleOptions = (): Promise<ApiResponse<Array<{ value: number; label: string }>>> => {
  return http.get('/roles/options')
} 