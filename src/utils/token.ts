import Cookies from 'js-cookie';

// 获取环境变量中的token key，默认为 'mall-admin-token'
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || 'mall-admin-token';

/**
 * 获取token
 */
export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

/**
 * 设置token
 * @param token - JWT token
 * @param remember - 是否记住登录状态（7天）
 */
export function setToken(token: string, remember = false): void {
  const options = remember ? { expires: 7 } : undefined;
  Cookies.set(TOKEN_KEY, token, options);
}

/**
 * 移除token
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}