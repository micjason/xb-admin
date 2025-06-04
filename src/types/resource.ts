/**
 * 资源类型枚举
 */
export enum ResourceType {
  IMAGE = 'image',      // 图片
  VIDEO = 'video',      // 视频
  AUDIO = 'audio',      // 音频
  DOCUMENT = 'document', // 文档
  OTHER = 'other'       // 其他
}

/**
 * 资源状态枚举
 */
export enum ResourceStatus {
  ACTIVE = 'active',       // 可用
  INACTIVE = 'inactive'    // 不可用
}

/**
 * 资源存储类型枚举
 */
export enum StorageType {
  LOCAL = 'local',         // 本地存储
  OSS = 'oss',            // 阿里云OSS
  COS = 'cos',            // 腾讯云COS
  QINIU = 'qiniu',        // 七牛云
  MINIO = 'minio'         // MinIO
}

/**
 * 资源基础接口
 */
export interface Resource {
  id: number
  name: string              // 资源名称
  originalName: string      // 原始文件名
  fileName: string          // 存储文件名
  fileExt: string          // 文件扩展名
  filePath: string         // 文件路径
  url: string              // 访问URL
  size: number             // 文件大小（字节）
  type: ResourceType       // 资源类型
  mimeType: string         // MIME类型
  storageType: StorageType // 存储类型
  status: ResourceStatus   // 状态
  width?: number           // 图片宽度
  height?: number          // 图片高度
  duration?: number        // 视频/音频时长（秒）
  description?: string     // 描述
  tags: string[]           // 标签
  categoryId?: number      // 分类ID
  userId: number           // 上传用户ID
  createdAt: string        // 创建时间
  updatedAt: string        // 更新时间
}

/**
 * 资源分类接口
 */
export interface ResourceCategory {
  id: number
  name: string             // 分类名称
  description?: string     // 分类描述
  parentId?: number        // 父分类ID
  sort: number             // 排序
  status: ResourceStatus   // 状态
  children?: ResourceCategory[] // 子分类
  createdAt: string        // 创建时间
  updatedAt: string        // 更新时间
}

/**
 * 资源表单接口
 */
export interface ResourceForm {
  id?: number
  name: string
  description?: string
  tags: string[]
  categoryId?: number
  status: ResourceStatus
}

/**
 * 资源分类表单接口
 */
export interface ResourceCategoryForm {
  id?: number
  name: string
  description?: string
  parentId?: number
  sort: number
  status: ResourceStatus
}

/**
 * 资源搜索接口
 */
export interface ResourceSearchParams {
  keyword?: string         // 关键词
  type?: ResourceType      // 资源类型
  status?: ResourceStatus  // 状态
  categoryId?: number      // 分类ID
  storageType?: StorageType // 存储类型
  tags?: string[]          // 标签
  userId?: number          // 用户ID
  startDate?: string       // 开始日期
  endDate?: string         // 结束日期
  minSize?: number         // 最小文件大小
  maxSize?: number         // 最大文件大小
  page: number             // 页码
  pageSize: number         // 页大小
  sortField?: string       // 排序字段
  sortOrder?: 'asc' | 'desc' // 排序方向
}

/**
 * 资源分类搜索接口
 */
export interface ResourceCategorySearchParams {
  keyword?: string
  status?: ResourceStatus
  parentId?: number
  page: number
  pageSize: number
}

/**
 * 资源列表响应接口
 */
export interface ResourceListResponse {
  list: Resource[]
  total: number
  page: number
  pageSize: number
}

/**
 * 资源分类列表响应接口
 */
export interface ResourceCategoryListResponse {
  list: ResourceCategory[]
  total: number
  page: number
  pageSize: number
}

/**
 * 文件上传接口
 */
export interface FileUploadParams {
  file: File
  categoryId?: number
  tags?: string[]
  description?: string
  storageType?: StorageType
}

/**
 * 文件上传响应接口
 */
export interface FileUploadResponse {
  id: number
  url: string
  fileName: string
  originalName: string
  size: number
  type: ResourceType
  mimeType: string
}

/**
 * 批量上传接口
 */
export interface BatchUploadParams {
  files: File[]
  categoryId?: number
  tags?: string[]
  storageType?: StorageType
}

/**
 * 批量上传响应接口
 */
export interface BatchUploadResponse {
  success: FileUploadResponse[]
  failed: Array<{
    file: string
    error: string
  }>
}

/**
 * 资源统计接口
 */
export interface ResourceStats {
  totalCount: number        // 总数量
  totalSize: number         // 总大小
  imageCount: number        // 图片数量
  videoCount: number        // 视频数量
  audioCount: number        // 音频数量
  documentCount: number     // 文档数量
  otherCount: number        // 其他数量
  todayUpload: number       // 今日上传
  storageUsage: Array<{     // 存储使用情况
    type: StorageType
    count: number
    size: number
  }>
}

/**
 * 资源使用记录接口
 */
export interface ResourceUsage {
  id: number
  resourceId: number
  resource: Resource
  usageType: string         // 使用类型：product/article/banner等
  usageId: number          // 使用对象ID
  usageTitle: string       // 使用对象标题
  createdAt: string        // 使用时间
}

/**
 * 资源使用记录搜索接口
 */
export interface ResourceUsageSearchParams {
  resourceId?: number
  usageType?: string
  startDate?: string
  endDate?: string
  page: number
  pageSize: number
}

/**
 * 资源预览接口
 */
export interface ResourcePreview {
  id: number
  url: string
  thumbnailUrl?: string     // 缩略图URL
  previewUrl?: string       // 预览URL
  canPreview: boolean       // 是否可预览
  previewType: 'image' | 'video' | 'audio' | 'document' | 'none' // 预览类型
}

/**
 * 存储配置接口
 */
export interface StorageConfig {
  type: StorageType
  enabled: boolean
  config: {
    [key: string]: any      // 各存储类型的具体配置
  }
}

/**
 * 资源导出参数接口
 */
export interface ResourceExportParams {
  type?: ResourceType
  status?: ResourceStatus
  categoryId?: number
  startDate?: string
  endDate?: string
  format: 'excel' | 'csv'
  includeUrl?: boolean      // 是否包含URL
  includeStats?: boolean    // 是否包含统计信息
} 