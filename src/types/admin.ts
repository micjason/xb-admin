/**
 * 管理员状态枚举
 */
export enum AdminStatus {
  DISABLED = 0, // 禁用
  ENABLED = 1   // 启用
}

/**
 * 角色信息
 */
export interface Role {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: number;
  createTime: string;
  updateTime: string;
}

/**
 * 管理员信息
 */
export interface Admin {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: AdminStatus;
  lastLoginTime?: string;
  createTime: string;
  updateTime: string;
  roles?: Role[];
  roleIds?: number[];
  permissions?: string[];
}

/**
 * 管理员列表查询参数
 */
export interface AdminListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: AdminStatus;
  roleId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startTime?: string;
  endTime?: string;
}

/**
 * 管理员列表响应
 */
export interface AdminListResponse {
  list: Admin[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 创建管理员请求
 */
export interface CreateAdminRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: AdminStatus;
  roleIds?: number[];
}

/**
 * 更新管理员请求
 */
export interface UpdateAdminRequest {
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status?: AdminStatus;
}

/**
 * 分配角色请求
 */
export interface AssignRolesRequest {
  roleIds: number[];
}

/**
 * 重置密码请求
 */
export interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
}

/**
 * 管理员表单数据
 */
export interface AdminFormData {
  id?: number;
  username: string;
  password?: string;
  confirmPassword?: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: AdminStatus;
  roleIds: number[];
}

/**
 * 管理员搜索表单
 */
export interface AdminSearchForm {
  keyword: string;
  status: AdminStatus | '';
  roleId: number | '';
  dateRange: string[];
} 