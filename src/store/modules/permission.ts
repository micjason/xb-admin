import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import { constantRoutes, asyncRoutes } from '@/router';
import { getUserMenuRoutes } from '@/api/permission';
import type { MenuRoute } from '@/types/permission';

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

  const hasAnyPermission = computed(() => (permissionList: readonly string[]) => {
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
        // 如果是admin角色，直接通过
        if (roles.value.includes('admin')) {
          // 如果有子路由，递归过滤子路由
          if (route.children && route.children.length > 0) {
            route.children = filterRoutes(route.children);
          }
          return true;
        }
        
        // 检查角色权限
        if (route.meta?.roles && Array.isArray(route.meta.roles) && route.meta.roles.length > 0) {
          const hasRolePermission = route.meta.roles.some((role: string) => hasRole.value(role));
          if (!hasRolePermission) {
            return false;
          }
        }
        
        // 检查具体权限
        if (route.meta?.permissions && Array.isArray(route.meta.permissions) && route.meta.permissions.length > 0) {
          const hasRoutePermission = hasAnyPermission.value(route.meta.permissions);
          if (!hasRoutePermission) {
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
  const setPermissions = (userPermissions: readonly string[], userRoles: readonly string[]): void => {
    permissions.value = [...userPermissions];
    roles.value = [...userRoles];
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
    // 获取可访问的路由
    const accessibleRoutes = getAccessibleRoutes.value;
    
    // 设置路由
    setRoutes(accessibleRoutes);
    
    // 只返回异步路由部分，因为常量路由已经在router中注册了
    const asyncAccessibleRoutes = accessibleRoutes.filter(route => 
      !constantRoutes.some(constantRoute => constantRoute.path === route.path)
    );
    
    return asyncAccessibleRoutes;
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

  /**
   * 获取用户动态菜单路由
   */
  const generateDynamicRoutes = async (): Promise<RouteRecordRaw[]> => {
    try {
      const { data } = await getUserMenuRoutes();
      const dynamicRoutes = convertMenuRoutesToRoutes(data);
      setRoutes([...constantRoutes, ...dynamicRoutes]);
      return dynamicRoutes;
    } catch (error) {
      console.error('获取动态路由失败:', error);
      return [];
    }
  };

  /**
   * 将菜单路由数据转换为Vue Router路由配置
   */
  const convertMenuRoutesToRoutes = (menuRoutes: MenuRoute[]): RouteRecordRaw[] => {
    const routes: RouteRecordRaw[] = [];
    
    menuRoutes.forEach(menuRoute => {
      const route: RouteRecordRaw = {
        path: menuRoute.path,
        name: menuRoute.name || menuRoute.path.replace(/\//g, '_'),
        component: getComponent(menuRoute.component),
        meta: {
          title: menuRoute.meta?.title || '未命名',
          icon: menuRoute.meta?.icon,
          hidden: menuRoute.meta?.hidden || false,
          roles: menuRoute.meta?.roles || [],
          permissions: []
        }
      };
      
      // 设置重定向
      if (menuRoute.redirect) {
        route.redirect = menuRoute.redirect;
      }
      
      // 处理子路由
      if (menuRoute.children && menuRoute.children.length > 0) {
        route.children = convertMenuRoutesToRoutes(menuRoute.children);
      }
      
      routes.push(route);
    });
    
    return routes;
  };

  /**
   * 根据组件路径获取组件
   */
  const getComponent = (componentPath?: string) => {
    if (!componentPath) {
      return () => import('@/layouts/Layout.vue');
    }
    
    // 组件映射
    const componentMap: Record<string, any> = {
      'Layout': () => import('@/layouts/Layout.vue'),
      'system/admin/index': () => import('@/views/system/admin/index.vue'),
      'system/role/index': () => import('@/views/system/role/index.vue'),
      'system/permission/index': () => import('@/views/system/permission/index.vue')
    };
    
    if (componentMap[componentPath]) {
      return componentMap[componentPath];
    }
    
    // 动态导入
    if (componentPath.startsWith('@/')) {
      return () => import(/* @vite-ignore */ componentPath);
    }
    
    return () => import(/* @vite-ignore */ `@/views/${componentPath}.vue`);
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
      setPermissionLoaded,
      generateDynamicRoutes
    };
}); 