import http from './index'
import type { ApiResponse } from '@/types/api'
import type {
  Permission,
  PermissionForm,
  PermissionListRequest,
  PermissionListResponse,
  PermissionStatusRequest,
  PermissionBatchDeleteRequest,
  PermissionSortRequest,
  PermissionMoveRequest,
  PermissionExportRequest,
  PermissionCodeGenRequest,
  PermissionTreeNode,
  PermissionCheckRequest,
  MenuRoute,
  IconOption
} from '@/types/permission'

/**
 * 获取权限列表
 */
export const getPermissionList = (params: PermissionListRequest): Promise<ApiResponse<PermissionListResponse>> => {
  return http.get('/permissions', { params })
}

/**
 * 获取权限树（树形结构）
 */
export const getPermissionTree = (params?: { type?: string; status?: number }): Promise<ApiResponse<Permission[]>> => {
  return http.get('/permissions/tree', { params })
}

/**
 * 获取权限树节点（用于权限选择组件）
 */
export const getPermissionTreeNodes = (params?: { type?: string; status?: number }): Promise<ApiResponse<PermissionTreeNode[]>> => {
  return http.get('/permissions/tree-nodes', { params })
}

/**
 * 获取权限详情
 */
export const getPermissionById = (id: number): Promise<ApiResponse<Permission>> => {
  return http.get(`/permissions/${id}`)
}

/**
 * 创建权限
 */
export const createPermission = (data: PermissionForm): Promise<ApiResponse<Permission>> => {
  return http.post('/permissions', data)
}

/**
 * 更新权限
 */
export const updatePermission = (id: number, data: PermissionForm): Promise<ApiResponse<Permission>> => {
  return http.put(`/permissions/${id}`, data)
}

/**
 * 删除权限
 */
export const deletePermission = (id: number): Promise<ApiResponse<void>> => {
  return http.delete(`/permissions/${id}`)
}

/**
 * 批量删除权限
 */
export const batchDeletePermissions = (data: PermissionBatchDeleteRequest): Promise<ApiResponse<void>> => {
  return http.post('/permissions/batch-delete', data)
}

/**
 * 更新权限状态
 */
export const updatePermissionStatus = (data: PermissionStatusRequest): Promise<ApiResponse<void>> => {
  return http.patch('/permissions/status', data)
}

/**
 * 更新权限排序
 */
export const updatePermissionSort = (data: PermissionSortRequest): Promise<ApiResponse<void>> => {
  return http.patch('/permissions/sort', data)
}

/**
 * 移动权限（改变父级或排序）
 */
export const movePermission = (data: PermissionMoveRequest): Promise<ApiResponse<void>> => {
  return http.patch('/permissions/move', data)
}

/**
 * 检查权限编码是否唯一
 */
export const checkPermissionCodeUnique = (data: PermissionCheckRequest): Promise<ApiResponse<boolean>> => {
  return http.post('/permissions/check-code', data)
}

/**
 * 生成权限编码建议
 */
export const generatePermissionCode = (data: PermissionCodeGenRequest): Promise<ApiResponse<string>> => {
  return http.post('/permissions/generate-code', data)
}

/**
 * 导出权限数据
 */
export const exportPermissions = (params: PermissionExportRequest): Promise<Blob> => {
  return http.get('/permissions/export', { 
    params,
    responseType: 'blob'
  })
}

/**
 * 获取菜单路由数据（用于动态路由生成）
 */
export const getMenuRoutes = (): Promise<ApiResponse<MenuRoute[]>> => {
  return http.get('/permissions/menu-routes')
}

/**
 * 获取用户权限菜单路由
 */
export const getUserMenuRoutes = (userId?: number): Promise<ApiResponse<MenuRoute[]>> => {
  return http.get('/permissions/user-menu-routes', {
    params: { userId }
  })
}

/**
 * 获取权限选项列表（用于其他模块的权限选择）
 */
export const getPermissionOptions = (params?: { type?: string; parentId?: number }): Promise<ApiResponse<Array<{ value: number; label: string; type?: string }>>> => {
  return http.get('/permissions/options', { params })
}

/**
 * 获取图标选项列表
 */
export const getIconOptions = (): Promise<ApiResponse<IconOption[]>> => {
  return http.get('/permissions/icons')
}

/**
 * 获取组件选项列表
 */
export const getComponentOptions = (): Promise<ApiResponse<Array<{ value: string; label: string; path: string }>>> => {
  return http.get('/permissions/components')
}

/**
 * 验证路径格式
 */
export const validatePath = (path: string): Promise<ApiResponse<{ valid: boolean; message?: string }>> => {
  return http.post('/permissions/validate-path', { path })
}

/**
 * 同步权限数据（从代码中扫描权限）
 */
export const syncPermissions = (): Promise<ApiResponse<{ added: number; updated: number; removed: number }>> => {
  return http.post('/permissions/sync')
}

/**
 * 重建权限树缓存
 */
export const rebuildPermissionCache = (): Promise<ApiResponse<void>> => {
  return http.post('/permissions/rebuild-cache')
} 