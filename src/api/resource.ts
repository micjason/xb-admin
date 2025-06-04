import { get, post, put, del, upload, download } from './request'
import type {
  Resource,
  ResourceCategory,
  ResourceForm,
  ResourceCategoryForm,
  ResourceSearchParams,
  ResourceCategorySearchParams,
  ResourceListResponse,
  ResourceCategoryListResponse,
  FileUploadParams,
  FileUploadResponse,
  BatchUploadParams,
  BatchUploadResponse,
  ResourceStats,
  ResourceUsage,
  ResourceUsageSearchParams,
  ResourcePreview,
  StorageConfig,
  ResourceExportParams
} from '@/types/resource'
import {
  ResourceType,
  ResourceStatus,
  StorageType
} from '@/types/resource'

/**
 * 获取资源列表
 */
export function getResourceList(params: ResourceSearchParams) {
  return get<ResourceListResponse>('/api/resources', params)
}

/**
 * 获取资源详情
 */
export function getResourceById(id: number) {
  return get<Resource>(`/api/resources/${id}`)
}

/**
 * 创建资源
 */
export function createResource(data: ResourceForm) {
  return post<Resource>('/api/resources', data)
}

/**
 * 更新资源
 */
export function updateResource(id: number, data: ResourceForm) {
  return put<Resource>(`/api/resources/${id}`, data)
}

/**
 * 删除资源
 */
export function deleteResource(id: number) {
  return del<void>(`/api/resources/${id}`)
}

/**
 * 批量删除资源
 */
export function batchDeleteResources(ids: number[]) {
  return post<void>('/api/resources/batch-delete', { ids })
}

/**
 * 更新资源状态
 */
export function updateResourceStatus(id: number, status: ResourceStatus) {
  return put<void>(`/api/resources/${id}/status`, { status })
}

/**
 * 文件上传
 */
export function uploadFile(params: FileUploadParams) {
  const formData = new FormData()
  formData.append('file', params.file)
  
  if (params.categoryId) {
    formData.append('categoryId', params.categoryId.toString())
  }
  if (params.tags) {
    formData.append('tags', JSON.stringify(params.tags))
  }
  if (params.description) {
    formData.append('description', params.description)
  }
  if (params.storageType) {
    formData.append('storageType', params.storageType)
  }

  return upload<FileUploadResponse>('/api/resources/upload', formData)
}

/**
 * 批量文件上传
 */
export function batchUploadFiles(params: BatchUploadParams) {
  const formData = new FormData()
  
  params.files.forEach((file) => {
    formData.append('files', file)
  })
  
  if (params.categoryId) {
    formData.append('categoryId', params.categoryId.toString())
  }
  if (params.tags) {
    formData.append('tags', JSON.stringify(params.tags))
  }
  if (params.storageType) {
    formData.append('storageType', params.storageType)
  }

  return upload<BatchUploadResponse>('/api/resources/batch-upload', formData)
}

/**
 * 获取资源分类列表
 */
export function getResourceCategoryList(params: ResourceCategorySearchParams) {
  return get<ResourceCategoryListResponse>('/api/resource-categories', params)
}

/**
 * 获取资源分类树
 */
export function getResourceCategoryTree() {
  return get<ResourceCategory[]>('/api/resource-categories/tree')
}

/**
 * 获取资源分类详情
 */
export function getResourceCategoryById(id: number) {
  return get<ResourceCategory>(`/api/resource-categories/${id}`)
}

/**
 * 创建资源分类
 */
export function createResourceCategory(data: ResourceCategoryForm) {
  return post<ResourceCategory>('/api/resource-categories', data)
}

/**
 * 更新资源分类
 */
export function updateResourceCategory(id: number, data: ResourceCategoryForm) {
  return put<ResourceCategory>(`/api/resource-categories/${id}`, data)
}

/**
 * 删除资源分类
 */
export function deleteResourceCategory(id: number) {
  return del<void>(`/api/resource-categories/${id}`)
}

/**
 * 获取资源统计
 */
export function getResourceStats() {
  return get<ResourceStats>('/api/resources/stats')
}

/**
 * 获取资源使用记录
 */
export function getResourceUsageList(params: ResourceUsageSearchParams) {
  return get<{
    list: ResourceUsage[]
    total: number
    page: number
    pageSize: number
  }>('/api/resources/usage', params)
}

/**
 * 获取资源预览信息
 */
export function getResourcePreview(id: number) {
  return get<ResourcePreview>(`/api/resources/${id}/preview`)
}

/**
 * 生成资源缩略图
 */
export function generateThumbnail(id: number, options?: {
  width?: number
  height?: number
  quality?: number
}) {
  return post<{ thumbnailUrl: string }>(`/api/resources/${id}/thumbnail`, options)
}

/**
 * 移动资源到分类
 */
export function moveResourceToCategory(resourceIds: number[], categoryId: number) {
  return post<void>('/api/resources/move', { resourceIds, categoryId })
}

/**
 * 复制资源
 */
export function copyResource(id: number, data: {
  name?: string
  categoryId?: number
}) {
  return post<Resource>(`/api/resources/${id}/copy`, data)
}

/**
 * 获取存储配置
 */
export function getStorageConfigs() {
  return get<StorageConfig[]>('/api/resources/storage-configs')
}

/**
 * 更新存储配置
 */
export function updateStorageConfig(type: StorageType, config: StorageConfig) {
  return put<void>(`/api/resources/storage-configs/${type}`, config)
}

/**
 * 测试存储配置
 */
export function testStorageConfig(type: StorageType, config: any) {
  return post<{ success: boolean; message: string }>(`/api/resources/storage-configs/${type}/test`, config)
}

/**
 * 清理未使用的资源
 */
export function cleanupUnusedResources(options: {
  daysAgo?: number
  dryRun?: boolean
}) {
  return post<{
    count: number
    size: number
    resources: Resource[]
  }>('/api/resources/cleanup', options)
}

/**
 * 导出资源数据
 */
export function exportResources(params: ResourceExportParams) {
  return download('/api/resources/export', params)
}

/**
 * 资源同步（同步存储状态）
 */
export function syncResourceStorage(storageType?: StorageType) {
  return post<{
    synced: number
    failed: number
    details: Array<{
      id: number
      status: 'synced' | 'failed'
      message?: string
    }>
  }>('/api/resources/sync', { storageType })
}

/**
 * 获取资源类型选项
 */
export function getResourceTypeOptions() {
  return Promise.resolve({
    data: [
      { label: '图片', value: ResourceType.IMAGE },
      { label: '视频', value: ResourceType.VIDEO },
      { label: '音频', value: ResourceType.AUDIO },
      { label: '文档', value: ResourceType.DOCUMENT },
      { label: '其他', value: ResourceType.OTHER }
    ]
  })
}

/**
 * 获取存储类型选项
 */
export function getStorageTypeOptions() {
  return Promise.resolve({
    data: [
      { label: '本地存储', value: StorageType.LOCAL },
      { label: '阿里云OSS', value: StorageType.OSS },
      { label: '腾讯云COS', value: StorageType.COS },
      { label: '七牛云', value: StorageType.QINIU },
      { label: 'MinIO', value: StorageType.MINIO }
    ]
  })
}

/**
 * 获取文件MIME类型
 */
export function getFileMimeType(file: File): string {
  return file.type || 'application/octet-stream'
}

/**
 * 判断文件是否为图片
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * 判断文件是否为视频
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * 判断文件是否为音频
 */
export function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/')
}

/**
 * 获取文件资源类型
 */
export function getFileResourceType(file: File): ResourceType {
  if (isImageFile(file)) return ResourceType.IMAGE
  if (isVideoFile(file)) return ResourceType.VIDEO
  if (isAudioFile(file)) return ResourceType.AUDIO
  
  // 检查文档类型
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ]
  
  if (documentTypes.includes(file.type)) {
    return ResourceType.DOCUMENT
  }
  
  return ResourceType.OTHER
} 