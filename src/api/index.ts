import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getToken, removeToken } from '@/utils/token';
import type { ApiResponse } from '@/types/api';

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 使用代理路径
  timeout: 10000, // 请求超时时间
  withCredentials: true, // 跨域请求时发送cookies
});

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加token到请求头
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求时间戳（防止缓存）
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 如果是文件下载请求，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }
    
    // 处理业务错误
    if (data.code !== 200) {
      // token失效或未授权
      if (data.code === 401) {
        removeToken();        ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          window.location.reload();
        });
        return Promise.reject(new Error(data.message || '登录已过期'));
      }
      
      // 权限不足
      if (data.code === 403) {
        ElMessage.error('权限不足，无法执行此操作');
        return Promise.reject(new Error(data.message || '权限不足'));
      }
      
      // 其他业务错误
      ElMessage.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    return data;
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 网络错误处理
    if (!error.response) {
      ElMessage.error('网络连接异常，请检查网络');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;    
    switch (status) {
      case 400:
        ElMessage.error(data?.message || '请求参数错误');
        break;
      case 401:
        removeToken();
        ElMessage.error('登录已过期，请重新登录');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        break;
      case 403:
        ElMessage.error('权限不足');
        break;
      case 404:
        ElMessage.error('请求的资源不存在');
        break;
      case 500:
        ElMessage.error('服务器内部错误');
        break;
      default:
        ElMessage.error(data?.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);

export default service;