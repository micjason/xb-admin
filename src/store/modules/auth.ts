import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { ElMessage } from 'element-plus';
import { login, logout, getUserInfo, getUserPermissions, getUserRoles } from '@/api/auth';
import { getToken, setToken, removeToken } from '@/utils/token';
import type { LoginRequest, UserInfo } from '@/types/auth';

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string>(getToken() || '');
  const userInfo = ref<UserInfo | null>(null);
  const permissions = ref<string[]>([]);
  const roles = ref<string[]>([]);
  const isLoggedIn = ref<boolean>(!!getToken());

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && isLoggedIn.value);
  const hasPermission = computed(() => (permission: string) => {
    return permissions.value.includes(permission);
  });
  const hasRole = computed(() => (role: string) => {
    return roles.value.includes(role);
  });
  const hasAnyPermission = computed(() => (permissionList: string[]) => {
    return permissionList.some(permission => permissions.value.includes(permission));
  });
  const hasAllPermissions = computed(() => (permissionList: string[]) => {
    return permissionList.every(permission => permissions.value.includes(permission));
  });

  // Actions
  /**
   * 用户登录
   */
  const loginAction = async (loginData: LoginRequest): Promise<boolean> => {
    try {
      const response = await login(loginData);
      if (response.success && response.data) {
        const { token: newToken, user, permissions: userPermissions, roles: userRoles } = response.data;
        
        // 存储token
        token.value = newToken;
        setToken(newToken, loginData.remember);
        
        // 存储用户信息
        userInfo.value = user;
        permissions.value = userPermissions || [];
        roles.value = userRoles || [];
        isLoggedIn.value = true;
        
        ElMessage.success('登录成功');
        return true;
      } else {
        ElMessage.error(response.message || '登录失败');
        return false;
      }
    } catch (error) {
      console.error('登录错误:', error);
      ElMessage.error('登录失败，请检查网络连接');
      return false;    }
  };

  /**
   * 用户退出登录
   */
  const logoutAction = async (): Promise<void> => {
    try {
      await logout();
    } catch (error) {
      console.error('退出登录错误:', error);
    } finally {
      // 清除本地状态
      token.value = '';
      userInfo.value = null;
      permissions.value = [];
      roles.value = [];
      isLoggedIn.value = false;
      removeToken();
      
      ElMessage.success('已退出登录');
    }
  };

  /**
   * 获取用户信息
   */
  const getUserInfoAction = async (): Promise<boolean> => {
    try {
      const response = await getUserInfo();
      if (response.success && response.data) {
        userInfo.value = response.data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('获取用户信息错误:', error);
      return false;
    }
  };

  /**
   * 获取用户权限
   */
  const getUserPermissionsAction = async (): Promise<void> => {
    try {
      const response = await getUserPermissions();
      if (response.success && response.data) {
        permissions.value = response.data;
      }
    } catch (error) {
      console.error('获取用户权限错误:', error);
    }
  };

  /**
   * 获取用户角色
   */  const getUserRolesAction = async (): Promise<void> => {
    try {
      const response = await getUserRoles();
      if (response.success && response.data) {
        roles.value = response.data;
      }
    } catch (error) {
      console.error('获取用户角色错误:', error);
    }
  };

  /**
   * 重置认证状态
   */
  const resetAuth = (): void => {
    token.value = '';
    userInfo.value = null;
    permissions.value = [];
    roles.value = [];
    isLoggedIn.value = false;
    removeToken();
  };

  /**
   * 初始化认证状态（检查本地token）
   */
  const initAuth = async (): Promise<void> => {
    const localToken = getToken();
    if (localToken) {
      token.value = localToken;
      isLoggedIn.value = true;
      
      // 尝试获取用户信息验证token有效性
      const success = await getUserInfoAction();
      if (success) {
        // 获取权限和角色
        await Promise.all([
          getUserPermissionsAction(),
          getUserRolesAction()
        ]);
      } else {
        // token无效，重置状态
        resetAuth();
      }
    }
  };

  return {
    // 状态
    token: readonly(token),
    userInfo: readonly(userInfo),
    permissions: readonly(permissions),
    roles: readonly(roles),
    isLoggedIn: readonly(isLoggedIn),
    
    // 计算属性
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    
    // Actions
    loginAction,
    logoutAction,
    getUserInfoAction,
    getUserPermissionsAction,
    getUserRolesAction,
    resetAuth,
    initAuth
  };
});