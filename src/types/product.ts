import type { ApiResponse, PageParams, PageResponse } from './api'

/**
 * 商品规格类型（可扩展的JSON结构）
 */
export interface ProductSpecification {
  [key: string]: any
}

/**
 * 商品尺寸类型
 */
export interface ProductDimensions {
  length?: number
  width?: number
  height?: number
}

/**
 * 商品实体类型
 */
export interface Product {
  id: string
  name: string
  categoryId: string
  categoryName: string
  sku: string
  price: number
  originalPrice?: number
  cost?: number
  stock: number
  sales: number
  description: string
  images: string[]
  status: number
  sort: number
  tags: string[]
  specifications: ProductSpecification
  seoTitle: string
  seoKeywords: string
  seoDescription: string
  weight?: number
  dimensions: ProductDimensions
  brand: string
  model: string
  createTime: string
  updateTime: string
  createdBy: string
  updatedBy: string
  categoryPath?: string[]
  profitMargin: number
  isNew: boolean
  isRecommended: boolean
  isHot: boolean
  isFeatured: boolean
  primaryImage: string | null
}

/**
 * 商品表单类型
 */
export interface ProductForm {
  name: string
  categoryId: string
  sku?: string
  price: number
  originalPrice?: number
  cost?: number
  stock?: number
  description?: string
  images?: string[]
  tags?: string[]
  specifications?: ProductSpecification
  seoTitle?: string
  seoKeywords?: string
  seoDescription?: string
  weight?: number
  dimensions?: ProductDimensions
  brand?: string
  model?: string
  sort?: number
  status?: number
}

/**
 * 商品列表查询参数
 */
export interface ProductListRequest extends PageParams {
  keyword?: string
  categoryId?: string
  status?: number | string
  minPrice?: number | string
  maxPrice?: number | string
  brand?: string
  inStock?: number | string
  orderBy?: 'createTime' | 'updateTime' | 'name' | 'price' | 'sales' | 'stock' | 'sort'
  order?: 'asc' | 'desc'
}

/**
 * 商品列表响应
 */
export interface ProductListResponse extends PageResponse<Product> {}

/**
 * 商品状态更新请求
 */
export interface ProductStatusRequest {
  status: number
}

/**
 * 批量商品状态更新请求
 */
export interface ProductBatchStatusRequest {
  ids: string[]
  status: number
}

/**
 * 商品库存更新请求
 */
export interface ProductStockRequest {
  quantity: number
  operation?: 'set' | 'add' | 'reduce'
}

/**
 * 热销商品查询参数
 */
export interface TopSellingProductsRequest {
  limit?: number
  categoryId?: string
}

/**
 * 新品推荐查询参数
 */
export interface NewProductsRequest {
  limit?: number
  categoryId?: string
}

/**
 * 商品价格区间类型
 */
export interface PriceRange {
  min: number
  max: number
}

/**
 * 商品筛选选项
 */
export interface ProductFilterOptions {
  brands: string[]
  priceRanges: PriceRange[]
  categories: { id: string; name: string }[]
}

/**
 * 商品统计信息
 */
export interface ProductStats {
  totalCount: number
  onShelfCount: number
  offShelfCount: number
  lowStockCount: number
  outOfStockCount: number
  totalValue: number
}

/**
 * 商品导出请求参数
 */
export interface ProductExportRequest {
  keyword?: string
  categoryId?: string
  status?: number | string
  minPrice?: number | string
  maxPrice?: number | string
  brand?: string
  inStock?: number | string
}

/**
 * 商品导入数据类型
 */
export interface ProductImportData {
  name: string
  categoryName: string
  sku?: string
  price: number
  originalPrice?: number
  cost?: number
  stock?: number
  description?: string
  brand?: string
  model?: string
  tags?: string
}

/**
 * 商品导入结果
 */
export interface ProductImportResult {
  total: number
  success: number
  failed: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  warnings: Array<{
    row: number
    field: string
    message: string
  }>
} 