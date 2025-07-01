import type { ApiResponse, PageParams, PageResponse } from './api'

/**
 * 商品分类实体类型
 */
export interface Category {
  id: string
  name: string
  parentId: string | null
  sort: number
  status: number
  description: string
  icon: string
  level: number
  path: string
  createTime: string
  updateTime: string
  createdBy: string
  updatedBy: string
  parentName?: string
  pathNames?: string[]
  children?: Category[]
}

/**
 * 分类表单类型
 */
export interface CategoryForm {
  name: string
  parentId?: string | null
  description?: string
  icon?: string
  sort?: number
  status?: number
}

/**
 * 分类列表查询参数
 */
export interface CategoryListRequest extends PageParams {
  keyword?: string
  status?: number | string
  parentId?: string
  level?: number | string
  orderBy?: 'sort' | 'createTime' | 'updateTime' | 'name' | 'level'
  order?: 'asc' | 'desc'
}

/**
 * 分类列表响应
 */
export interface CategoryListResponse extends PageResponse<Category> {}

/**
 * 分类树形结构请求参数
 */
export interface CategoryTreeRequest {
  status?: number | string
}

/**
 * 分类选项请求参数
 */
export interface CategoryOptionsRequest {
  status?: number | string
  level?: number | string
}

/**
 * 分类选项类型
 */
export interface CategoryOption {
  value: string
  label: string
  level: number
}

/**
 * 分类状态更新请求
 */
export interface CategoryStatusRequest {
  status: number
}

/**
 * 分类树节点类型（用于树形组件）
 */
export interface CategoryTreeNode {
  id: string
  label: string
  parentId: string | null
  level: number
  disabled?: boolean
  children?: CategoryTreeNode[]
}

/**
 * 分类导出请求参数
 */
export interface CategoryExportRequest {
  keyword?: string
  status?: number | string
  parentId?: string
  level?: number | string
}

/**
 * 分类统计信息
 */
export interface CategoryStats {
  totalCount: number
  enabledCount: number
  disabledCount: number
  maxLevel: number
} 