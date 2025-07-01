import service from './index'
import type { ApiResponse } from '@/types/api'

export interface UploadResult {
  filename: string
  originalName: string
  size: number
  mimetype: string
  url: string
  fullUrl: string
}

export interface ImageListItem extends UploadResult {
  createTime: string
  updateTime: string
}

export interface ImageListResponse {
  list: ImageListItem[]
  total: number
  page: number
  limit: number
}

/**
 * 上传单个图片
 */
export function uploadImage(file: File): Promise<ApiResponse<UploadResult>> {
  const formData = new FormData()
  formData.append('image', file)
  
  return service.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传多个图片
 */
export function uploadImages(files: File[]): Promise<ApiResponse<UploadResult[]>> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('images', file)
  })
  
  return service.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 删除图片
 */
export function deleteImage(filename: string): Promise<ApiResponse<void>> {
  return service.delete(`/upload/image/${filename}`)
}

/**
 * 获取图片列表
 */
export function getImageList(params: {
  page?: number
  limit?: number
}): Promise<ApiResponse<ImageListResponse>> {
  return service.get('/upload/images', { params })
} 