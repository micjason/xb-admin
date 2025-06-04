// API 响应基础类型定义
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页响应类型
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

// 分页请求参数
export interface PageParams {
  pageNum: number;
  pageSize: number;
}

// 请求配置类型
export interface RequestConfig {
  baseURL?: string;
  timeout?: number;
  withCredentials?: boolean;
}