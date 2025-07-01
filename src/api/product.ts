import http from './index'
import type { ApiResponse } from '@/types/api'
import type {
  Product,
  ProductForm,
  ProductListRequest,
  ProductListResponse,
  ProductStatusRequest,
  ProductBatchStatusRequest,
  ProductStockRequest,
  TopSellingProductsRequest,
  NewProductsRequest,
  ProductFilterOptions,
  ProductStats,
  ProductExportRequest,
  ProductImportData,
  ProductImportResult
} from '@/types/product'

/**
 * 创建商品
 */
export const createProduct = (data: ProductForm): Promise<ApiResponse<Product>> => {
  return http.post('/products', data)
}

/**
 * 获取商品列表（分页、搜索、筛选）
 */
export const getProductList = (params: ProductListRequest): Promise<ApiResponse<ProductListResponse>> => {
  return http.get('/products', { params })
}

/**
 * 获取商品详情
 */
export const getProductById = (id: string): Promise<ApiResponse<Product>> => {
  return http.get(`/products/${id}`)
}

/**
 * 更新商品
 */
export const updateProduct = (id: string, data: ProductForm): Promise<ApiResponse<Product>> => {
  return http.put(`/products/${id}`, data)
}

/**
 * 更新商品状态
 */
export const updateProductStatus = (id: string, data: ProductStatusRequest): Promise<ApiResponse<Product>> => {
  return http.patch(`/products/${id}/status`, data)
}

/**
 * 批量更新商品状态
 */
export const batchUpdateProductStatus = (data: ProductBatchStatusRequest): Promise<ApiResponse<{
  modifiedCount: number
  totalCount: number
}>> => {
  return http.post('/products/batch-status', data)
}

/**
 * 更新商品库存
 */
export const updateProductStock = (id: string, data: ProductStockRequest): Promise<ApiResponse<Product>> => {
  return http.patch(`/products/${id}/stock`, data)
}

/**
 * 删除商品
 */
export const deleteProduct = (id: string): Promise<ApiResponse<void>> => {
  return http.delete(`/products/${id}`)
}

/**
 * 获取热销商品
 */
export const getTopSellingProducts = (params?: TopSellingProductsRequest): Promise<ApiResponse<Product[]>> => {
  return http.get('/products/top-selling', { params })
}

/**
 * 获取新品推荐
 */
export const getNewProducts = (params?: NewProductsRequest): Promise<ApiResponse<Product[]>> => {
  return http.get('/products/new-products', { params })
}

/**
 * 获取商品筛选选项
 */
export const getProductFilterOptions = (): Promise<ApiResponse<ProductFilterOptions>> => {
  return http.get('/products/filter-options')
}

/**
 * 获取商品统计信息
 */
export const getProductStats = (): Promise<ApiResponse<ProductStats>> => {
  return http.get('/products/stats')
}

/**
 * 导出商品数据
 */
export const exportProducts = (params: ProductExportRequest): Promise<Blob> => {
  return http.get('/products/export', { 
    params,
    responseType: 'blob'
  })
}

/**
 * 批量删除商品
 */
export const batchDeleteProducts = (ids: string[]): Promise<ApiResponse<void>> => {
  return http.post('/products/batch-delete', { ids })
}

/**
 * 检查SKU是否唯一
 */
export const checkSkuUnique = (sku: string, excludeId?: string): Promise<ApiResponse<boolean>> => {
  return http.get('/products/check-sku', {
    params: { sku, excludeId }
  })
}

/**
 * 复制商品
 */
export const copyProduct = (id: string, data?: Partial<ProductForm>): Promise<ApiResponse<Product>> => {
  return http.post(`/products/${id}/copy`, data)
}

/**
 * 批量更新商品分类
 */
export const batchUpdateProductCategory = (ids: string[], categoryId: string): Promise<ApiResponse<{
  modifiedCount: number
  totalCount: number
  categoryName: string
}>> => {
  return http.post('/products/batch-category', { ids, categoryId })
}

/**
 * 批量调整商品价格
 */
export const batchAdjustProductPrice = (
  ids: string[], 
  adjustType: 'fixed' | 'percentage', 
  adjustValue: number
): Promise<ApiResponse<{
  modifiedCount: number
  totalCount: number
  adjustType: string
  adjustValue: number
}>> => {
  return http.post('/products/batch-price', { ids, adjustType, adjustValue })
}

/**
 * 批量设置推荐
 */
export const batchUpdateProductRecommend = (
  ids: string[],
  options: {
    isRecommended?: boolean
    isHot?: boolean
    isFeatured?: boolean
    isNew?: boolean
  }
): Promise<ApiResponse<{
  modifiedCount: number
  totalCount: number
  operations: string[]
}>> => {
  return http.post('/products/batch-recommend', { ids, ...options })
}

/**
 * 更新商品推荐状态
 */
export const updateProductRecommend = (
  id: string,
  options: {
    isRecommended?: boolean
    isHot?: boolean
    isFeatured?: boolean
    isNew?: boolean
  }
): Promise<ApiResponse<Product>> => {
  return http.patch(`/products/${id}/recommend`, options)
}

/**
 * 获取相关商品推荐
 */
export const getRelatedProducts = (id: string, limit?: number): Promise<ApiResponse<Product[]>> => {
  return http.get(`/products/${id}/related`, {
    params: { limit }
  })
}

/**
 * 上传商品图片
 */
export const uploadProductImage = (file: File): Promise<ApiResponse<{ url: string }>> => {
  const formData = new FormData()
  formData.append('image', file)
  
  return http.post('/products/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量导入商品
 */
export const importProducts = (file: File): Promise<ApiResponse<ProductImportResult>> => {
  const formData = new FormData()
  formData.append('file', file)
  
  return http.post('/products/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 下载商品导入模板
 */
export const downloadImportTemplate = (): Promise<Blob> => {
  return http.get('/products/import-template', {
    responseType: 'blob'
  })
}

/**
 * 获取低库存商品
 */
export const getLowStockProducts = (threshold: number = 10): Promise<ApiResponse<Product[]>> => {
  return http.get('/products/low-stock', {
    params: { threshold }
  })
}

/**
 * 获取缺货商品
 */
export const getOutOfStockProducts = (): Promise<ApiResponse<Product[]>> => {
  return http.get('/products/out-of-stock')
}

/**
 * 搜索商品建议（自动完成）
 */
export const searchProductSuggestions = (keyword: string, limit: number = 10): Promise<ApiResponse<Product[]>> => {
  return http.get('/products/search-suggestions', {
    params: { keyword, limit }
  })
} 