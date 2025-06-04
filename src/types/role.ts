// 角色状态枚举
export enum RoleStatus {
  ENABLED = 1,   // 启用
  DISABLED = 0   // 禁用
}

// 权限类型枚举
export enum PermissionType {
  MENU = 'menu',      // 菜单权限
  BUTTON = 'button'   // 按钮权限
}

// 角色基础信息接口
export interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: RoleStatus
  sort: number
  createTime: string
  updateTime: string
  createdBy?: string
  updatedBy?: string
}

// 权限信息接口
export interface Permission {
  id: number
  name: string
  code: string
  type: PermissionType
  parentId?: number
  path?: string
  component?: string
  icon?: string
  sort: number
  description?: string
  children?: Permission[]
}

// 角色权限关联接口
export interface RolePermission {
  roleId: number
  permissionId: number
  permission?: Permission
}

// 角色表单接口
export interface RoleForm {
  id?: number
  name: string
  code: string
  description?: string
  status: RoleStatus
  sort: number
  permissionIds: number[]
}

// 角色搜索表单接口
export interface RoleSearchForm {
  keyword?: string
  status?: RoleStatus
  createTimeRange?: [string, string]
}

// 角色列表请求接口
export interface RoleListRequest {
  page: number
  size: number
  keyword?: string
  status?: RoleStatus
  startTime?: string
  endTime?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

// 角色列表响应接口
export interface RoleListResponse {
  list: Role[]
  total: number
  page: number
  size: number
}

// 权限树节点接口
export interface PermissionTreeNode {
  id: number
  label: string
  children?: PermissionTreeNode[]
  disabled?: boolean
}

// 角色权限分配请求接口
export interface RolePermissionRequest {
  roleId: number
  permissionIds: number[]
}

// 角色状态更新请求接口
export interface RoleStatusRequest {
  id: number
  status: RoleStatus
}

// 角色批量删除请求接口
export interface RoleBatchDeleteRequest {
  ids: number[]
}

// 角色排序请求接口
export interface RoleSortRequest {
  id: number
  sort: number
}

// 角色数据导出请求接口
export interface RoleExportRequest {
  keyword?: string
  status?: RoleStatus
  startTime?: string
  endTime?: string
  format?: 'excel' | 'csv'
} 