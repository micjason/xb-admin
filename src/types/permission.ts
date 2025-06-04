// 权限类型枚举
export enum PermissionType {
  MENU = 'menu',      // 菜单权限
  BUTTON = 'button'   // 按钮权限
}

// 权限状态枚举
export enum PermissionStatus {
  ENABLED = 1,   // 启用
  DISABLED = 0   // 禁用
}

// 权限基础信息接口
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
  status: PermissionStatus
  description?: string
  createTime: string
  updateTime: string
  createdBy?: string
  updatedBy?: string
  children?: Permission[]
}

// 权限菜单信息接口（扩展权限信息，用于菜单管理）
export interface PermissionMenu extends Permission {
  redirect?: string
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    breadcrumb?: boolean
    affix?: boolean
    noCache?: boolean
    activeMenu?: string
    roles?: string[]
  }
}

// 权限表单接口
export interface PermissionForm {
  id?: number
  name: string
  code: string
  type: PermissionType
  parentId?: number
  path?: string
  component?: string
  icon?: string
  sort: number
  status: PermissionStatus
  description?: string
  // 菜单相关属性
  redirect?: string
  hidden?: boolean
  alwaysShow?: boolean
  breadcrumb?: boolean
  affix?: boolean
  noCache?: boolean
  activeMenu?: string
  roles?: string[]
}

// 权限搜索表单接口
export interface PermissionSearchForm {
  keyword?: string
  type?: PermissionType
  status?: PermissionStatus
  parentId?: number
  createTimeRange?: [string, string]
}

// 权限列表请求接口
export interface PermissionListRequest {
  page?: number
  size?: number
  keyword?: string
  type?: PermissionType
  status?: PermissionStatus
  parentId?: number
  startTime?: string
  endTime?: string
  orderBy?: string
  order?: 'asc' | 'desc'
}

// 权限列表响应接口
export interface PermissionListResponse {
  list: Permission[]
  total: number
  page?: number
  size?: number
}

// 权限树节点接口
export interface PermissionTreeNode {
  id: number
  label: string
  type: PermissionType
  parentId?: number
  children?: PermissionTreeNode[]
  disabled?: boolean
}

// 权限状态更新请求接口
export interface PermissionStatusRequest {
  id: number
  status: PermissionStatus
}

// 权限批量删除请求接口
export interface PermissionBatchDeleteRequest {
  ids: number[]
}

// 权限排序请求接口
export interface PermissionSortRequest {
  id: number
  sort: number
}

// 权限移动请求接口
export interface PermissionMoveRequest {
  id: number
  parentId?: number
  sort: number
}

// 权限数据导出请求接口
export interface PermissionExportRequest {
  keyword?: string
  type?: PermissionType
  status?: PermissionStatus
  parentId?: number
  startTime?: string
  endTime?: string
  format?: 'excel' | 'csv'
}

// 权限代码生成请求接口
export interface PermissionCodeGenRequest {
  parentCode?: string
  prefix?: string
  type: PermissionType
}

// 菜单路由信息接口
export interface MenuRoute {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta?: {
    title: string
    icon?: string
    hidden?: boolean
    alwaysShow?: boolean
    breadcrumb?: boolean
    affix?: boolean
    noCache?: boolean
    activeMenu?: string
    roles?: string[]
  }
  children?: MenuRoute[]
}

// 权限验证接口
export interface PermissionCheckRequest {
  code: string
  excludeId?: number
}

// 图标选项接口
export interface IconOption {
  name: string
  value: string
  category?: string
} 