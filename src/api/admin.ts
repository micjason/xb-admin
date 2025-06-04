import { get, post, put, del as deleteRequest, download } from './request';
import type { 
  Admin, 
  AdminListQuery, 
  AdminListResponse, 
  CreateAdminRequest, 
  UpdateAdminRequest,
  AssignRolesRequest 
} from '@/types/admin';
import type { ApiResponse } from '@/types/api';

/**
 * 获取管理员列表
 * @param params 查询参数
 * @returns 管理员列表响应
 */
export function getAdminList(params: AdminListQuery): Promise<ApiResponse<AdminListResponse>> {
  return get('/api/admins', params);
}

/**
 * 获取管理员详情
 * @param id 管理员ID
 * @returns 管理员详情
 */
export function getAdminDetail(id: number): Promise<ApiResponse<Admin>> {
  return get(`/api/admins/${id}`);
}

/**
 * 创建管理员
 * @param data 创建管理员数据
 * @returns 创建结果
 */
export function createAdmin(data: CreateAdminRequest): Promise<ApiResponse<Admin>> {
  return post('/api/admins', data);
}

/**
 * 更新管理员信息
 * @param id 管理员ID
 * @param data 更新数据
 * @returns 更新结果
 */
export function updateAdmin(id: number, data: UpdateAdminRequest): Promise<ApiResponse<Admin>> {
  return put(`/api/admins/${id}`, data);
}

/**
 * 删除管理员
 * @param id 管理员ID
 * @returns 删除结果
 */
export function deleteAdmin(id: number): Promise<ApiResponse<void>> {
  return deleteRequest(`/api/admins/${id}`);
}

/**
 * 修改管理员状态
 * @param id 管理员ID
 * @param status 状态 (1: 启用, 0: 禁用)
 * @returns 修改结果
 */
export function updateAdminStatus(id: number, status: number): Promise<ApiResponse<void>> {
  return put(`/api/admins/${id}/status`, { status });
}

/**
 * 为管理员分配角色
 * @param id 管理员ID
 * @param data 角色分配数据
 * @returns 分配结果
 */
export function assignAdminRoles(id: number, data: AssignRolesRequest): Promise<ApiResponse<void>> {
  return put(`/api/admins/${id}/roles`, data);
}

/**
 * 重置管理员密码
 * @param id 管理员ID
 * @param newPassword 新密码
 * @returns 重置结果
 */
export function resetAdminPassword(id: number, newPassword: string): Promise<ApiResponse<void>> {
  return put(`/api/admins/${id}/reset-password`, { password: newPassword });
}

/**
 * 获取所有角色列表（用于角色分配）
 * @returns 角色列表
 */
export function getAllRoles(): Promise<ApiResponse<Array<{ id: number; name: string; description?: string }>>> {
  return get('/api/roles/all');
}

/**
 * 批量删除管理员
 * @param ids 管理员ID数组
 * @returns 删除结果
 */
export function batchDeleteAdmins(ids: number[]): Promise<ApiResponse<void>> {
  return deleteRequest('/api/admins/batch', { ids });
}

/**
 * 导出管理员数据
 * @param params 导出参数
 * @returns 导出文件
 */
export function exportAdmins(params: AdminListQuery): Promise<Blob> {
  return download('/api/admins/export', params);
} 