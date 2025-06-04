import { get, post } from './request';
import type { LoginRequest, LoginResponse, UserInfo } from '@/types/auth';
import type { ApiResponse } from '@/types/api';

/**
 * 用户登录
 * @param data 登录参数
 */
export function login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  return post('/auth/login', data);
}

/**
 * 用户退出登录
 */
export function logout(): Promise<ApiResponse<null>> {
  return post('/auth/logout');
}

/**
 * 获取当前用户信息
 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return get('/auth/userinfo');
}

/**
 * 刷新token
 */
export function refreshToken(): Promise<ApiResponse<{ token: string }>> {
  return post('/auth/refresh');
}

/**
 * 修改密码
 * @param data 密码修改参数
 */
export function changePassword(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<null>> {
  return post('/auth/change-password', data);
}

/**
 * 获取用户权限列表
 */
export function getUserPermissions(): Promise<ApiResponse<string[]>> {
  return get('/auth/permissions');
}

/**
 * 获取用户角色列表
 */
export function getUserRoles(): Promise<ApiResponse<string[]>> {
  return get('/auth/roles');
}