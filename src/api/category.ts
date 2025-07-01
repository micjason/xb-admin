import http from './index'
import type { ApiResponse } from '@/types/api'
import type {
  Category,
  CategoryForm,
  CategoryListRequest,
  CategoryListResponse,
  CategoryTreeRequest,
  CategoryOptionsRequest,
  CategoryOption,
  CategoryStatusRequest,
  CategoryTreeNode,
  CategoryExportRequest,
  CategoryStats
} from '@/types/category'

/**
 * 创建商品分类
 */
export const createCategory = (data: CategoryForm): Promise<ApiResponse<Category>> => {
  return http.post('/categories', data)
}

/**
 * 获取分类列表（分页）
 */
export const getCategoryList = (params: CategoryListRequest): Promise<ApiResponse<CategoryListResponse>> => {
  return http.get('/categories', { params })
}

/**
 * 获取分类树形结构
 */
export const getCategoryTree = (params?: CategoryTreeRequest): Promise<ApiResponse<Category[]>> => {
  return http.get('/categories/tree', { params })
}

/**
 * 获取分类选项列表（用于选择器组件）
 */
export const getCategoryOptions = (params?: CategoryOptionsRequest): Promise<ApiResponse<CategoryOption[]>> => {
  return http.get('/categories/options', { params })
}

/**
 * 获取分类详情
 */
export const getCategoryById = (id: string): Promise<ApiResponse<Category>> => {
  return http.get(`/categories/${id}`)
}

/**
 * 更新分类
 */
export const updateCategory = (id: string, data: CategoryForm): Promise<ApiResponse<Category>> => {
  return http.put(`/categories/${id}`, data)
}

/**
 * 更新分类状态
 */
export const updateCategoryStatus = (id: string, data: CategoryStatusRequest): Promise<ApiResponse<Category>> => {
  return http.patch(`/categories/${id}/status`, data)
}

/**
 * 删除分类
 */
export const deleteCategory = (id: string): Promise<ApiResponse<void>> => {
  return http.delete(`/categories/${id}`)
}

/**
 * 导出分类数据
 */
export const exportCategories = (params: CategoryExportRequest): Promise<Blob> => {
  return http.get('/categories/export', { 
    params,
    responseType: 'blob'
  })
}

/**
 * 检查分类名称是否在同级下唯一
 */
export const checkCategoryNameUnique = (
  name: string, 
  parentId?: string | null, 
  excludeId?: string
): Promise<ApiResponse<boolean>> => {
  return http.get('/categories/check-name', {
    params: { name, parentId, excludeId }
  })
}

/**
 * 获取分类统计信息
 */
export const getCategoryStats = (): Promise<ApiResponse<CategoryStats>> => {
  return http.get('/categories/stats')
}

/**
 * 批量更新分类状态
 */
export const batchUpdateCategoryStatus = (ids: string[], status: number): Promise<ApiResponse<void>> => {
  return http.post('/categories/batch-status', { ids, status })
}

/**
 * 批量删除分类
 */
export const batchDeleteCategories = (ids: string[]): Promise<ApiResponse<void>> => {
  return http.post('/categories/batch-delete', { ids })
}

/**
 * 移动分类到指定父分类下
 */
export const moveCategory = (id: string, targetParentId: string | null): Promise<ApiResponse<Category>> => {
  return http.patch(`/categories/${id}/move`, { targetParentId })
}

/**
 * 获取分类路径名称（面包屑导航用）
 */
export const getCategoryPath = (id: string): Promise<ApiResponse<string[]>> => {
  return http.get(`/categories/${id}/path`)
}

/**
 * 获取子分类列表
 */
export const getSubCategories = (parentId: string, status?: number): Promise<ApiResponse<Category[]>> => {
  return http.get(`/categories/${parentId}/children`, {
    params: { status }
  })
}

/**
 * 复制分类（包含子分类结构）
 */
export const copyCategory = (id: string, targetParentId?: string | null): Promise<ApiResponse<Category>> => {
  return http.post(`/categories/${id}/copy`, { targetParentId })
}

/**
 * 获取分类树节点（用于树形选择器组件）
 */
export const getCategoryTreeNodes = (params?: CategoryTreeRequest): Promise<ApiResponse<CategoryTreeNode[]>> => {
  return http.get('/categories/tree-nodes', { params })
} 