import service from './index';
import type { AxiosRequestConfig } from 'axios';
import type { ApiResponse } from '@/types/api';

/**
 * 通用GET请求
 */
export function get<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
  return service.get(url, { params });
}

/**
 * 通用POST请求
 */
export function post<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return service.post(url, data);
}

/**
 * 通用PUT请求
 */
export function put<T = any>(url: string, data?: any): Promise<ApiResponse<T>> {
  return service.put(url, data);
}

/**
 * 通用DELETE请求
 */
export function del<T = any>(url: string, params?: any): Promise<ApiResponse<T>> {
  return service.delete(url, { params });
}

/**
 * 文件上传请求
 */
export function upload<T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> {
  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 文件下载请求
 */
export function download(url: string, params?: any): Promise<Blob> {
  return service.get(url, {
    params,
    responseType: 'blob',
  });
}