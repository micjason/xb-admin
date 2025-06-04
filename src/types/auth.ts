// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
  remember?: boolean;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  user: UserInfo;
  permissions: string[];
  roles: string[];
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  createTime: string;
  updateTime: string;
}