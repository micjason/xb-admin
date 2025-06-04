import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { constantRoutes, asyncRoutes } from '@/router';

// 菜单项类型定义
export interface MenuItem {
  id: number;
  name: string;
  path: string;
  component?: string;
  icon?: string;
  title: string;
  hidden?: boolean;
  redirect?: string;
  meta?: {
    title: string;
    icon?: string;
    hidden?: boolean;
    roles?: string[];
    permissions?: string[];
    keepAlive?: boolean;
    affix?: boolean;
    alwaysShow?: boolean;
  };
  children?: MenuItem[];
}

// 权限按钮类型
export interface PermissionButton {
  id: number;
  code: string;
  name: string;
  type: 'button' | 'api';
  resource: string;
  description?: string;
}

export const usePermissionStore = defineStore('permission', () => {
  // 状态
  const routes = ref<RouteRecordRaw[]>([]);
  const menus = ref<MenuItem[]>([]);
  const permissions = ref<string[]>([]);
  const roles = ref<string[]>([]);
  const buttons = ref<PermissionButton[]>([]);
  const isPermissionLoaded = ref(false);

  // 计算属性
  const hasPermission = computed(() => (permission: string) => {
    return permissions.value.includes(permission) || roles.value.includes('admin');
  });

  const hasRole = computed(() => (role: string) => {
    return roles.value.includes(role);
  });

  const hasAnyPermission = computed(() => (permissionList: string[]) => {
    if (roles.value.includes('admin')) return true;
    return permissionList.some(permission => permissions.value.includes(permission));
  });

  const hasButtonPermission = computed(() => (buttonCode: string) => {
    return buttons.value.some(btn => btn.code === buttonCode) || roles.value.includes('admin');
  });

  // 获取可访问路由（根据权限过滤）
  const getAccessibleRoutes = computed(() => {
    const filterRoutes = (routeList: RouteRecordRaw[]): RouteRecordRaw[] => {
      return routeList.filter(route => {
        // 检查路由权限
        if (route.meta?.roles && route.meta.roles.length > 0) {
          if (!route.meta.roles.some(role => roles.value.includes(role))) {
            return false;
          }
        }
        if (route.meta?.permissions && route.meta.permissions.length > 0) {
          if (!route.meta.permissions.some(permission => permissions.value.includes(permission))) {
            return false;
          }
        }
        
        // 递归过滤子路由
        if (route.children && route.children.length > 0) {
          route.children = filterRoutes(route.children);
        }
        
        return true;
      });
    };
    
    return filterRoutes([...constantRoutes, ...asyncRoutes]);
  });

  // Actions
  /**
   * 设置权限数据
   */
  const setPermissions = (userPermissions: string[], userRoles: string[]): void => {
    permissions.value = userPermissions;
    roles.value = userRoles;
  };

  /**
   * 设置菜单数据
   */
  const setMenus = (menuList: MenuItem[]): void => {
    menus.value = menuList;
  };

  /**
   * 设置路由数据
   */
  const setRoutes = (routeList: RouteRecordRaw[]): void => {
    routes.value = routeList;
  };

  /**
   * 设置按钮权限数据
   */
  const setButtons = (buttonList: PermissionButton[]): void => {
    buttons.value = buttonList;
  };

  /**
   * 生成动态路由（基于用户权限过滤）
   */
  const generateRoutes = (): RouteRecordRaw[] => {
    // 如果是管理员，返回所有路由
    if (roles.value.includes('admin')) {
      const allRoutes = [...constantRoutes, ...asyncRoutes];
      setRoutes(allRoutes);
      return allRoutes;
    }
    
    // 否则根据权限过滤路由
    const accessibleRoutes = getAccessibleRoutes.value;
    setRoutes(accessibleRoutes);
    return accessibleRoutes;
  };

  /**
   * 重置权限状态
   */
  const resetPermission = (): void => {
    routes.value = [];
    menus.value = [];
    permissions.value = [];
    roles.value = [];
    buttons.value = [];
    isPermissionLoaded.value = false;
  };

  /**
   * 标记权限已加载
   */
  const setPermissionLoaded = (loaded: boolean): void => {
    isPermissionLoaded.value = loaded;
  };

  return {
    // 状态
    routes,
    menus,
    permissions,
    roles,
    buttons,
    isPermissionLoaded,
    
    // 计算属性
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasButtonPermission,
    getAccessibleRoutes,
    
    // Actions
    setPermissions,
    setMenus,
    setRoutes,
    setButtons,
    generateRoutes,
    resetPermission,
    setPermissionLoaded
  };
}); 