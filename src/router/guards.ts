import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { usePermissionStore } from '@/store/modules/permission';
import { getToken } from '@/utils/token';

// 白名单路由（不需要登录验证的路由）
const whiteList = ['/login', '/404', '/403'];

/**
 * 加载用户权限并生成动态路由
 */
async function setupUserPermissions(router: Router) {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();
  
  // 确保权限数据完整
  if (authStore.permissions.length === 0 || authStore.roles.length === 0) {
    await Promise.all([
      authStore.getUserPermissionsAction(),
      authStore.getUserRolesAction()
    ]);
  }
  
  // 设置权限到权限store
  permissionStore.setPermissions(authStore.permissions, authStore.roles);
  permissionStore.setPermissionLoaded(true);
  
  // 生成并添加动态路由
  const accessRoutes = permissionStore.generateRoutes();
  accessRoutes.forEach(route => router.addRoute(route));
}

/**
 * 设置路由守卫
 */
export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const permissionStore = usePermissionStore();
    const token = getToken();

    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '商城后台管理系统'}`;
    }
    
    // ==================== 1. 无token处理 ====================
    if (!token) {
      if (whiteList.includes(to.path)) {
        next();
      } else {
        ElMessage.warning('请先登录');
        next('/login');
      }
      return;
    }
    
    // ==================== 2. 已登录访问登录页 ====================
    if (to.path === '/login') {
      next('/dashboard');
      return;
    }
    
    // ==================== 3. 用户信息和权限检查 ====================
    try {
      // 如果没有用户信息，初始化认证状态
      if (!authStore.userInfo) {
        await authStore.initAuth();
        if (!authStore.userInfo) {
          authStore.resetAuth();
          ElMessage.error('获取用户信息失败，请重新登录');
          next('/login');
          return;
        }
      }
      
      // 如果权限未加载，设置权限和动态路由
      if (!permissionStore.isPermissionLoaded) {
        await setupUserPermissions(router);
        // 重新导航到目标路由，确保新添加的路由生效
        next({ ...to, replace: true });
        return;
      }
      
      // ==================== 4. 路由权限验证 ====================
      if (!checkRoutePermission(to, authStore.permissions, authStore.roles)) {
        ElMessage.error('您没有访问该页面的权限');
        next('/403');
        return;
      }
      
      // 通过所有检查，允许访问
      next();
      
    } catch (error) {
      console.error('路由守卫错误:', error);
      authStore.resetAuth();
      ElMessage.error('认证失败，请重新登录');
      next('/login');
    }
  });

  // 全局解析守卫
  router.beforeResolve((to, from, next) => {
    next();
  });

  // 全局后置钩子
  router.afterEach(() => {
    // 可以在这里添加页面访问统计、埋点等逻辑
  });

  // 路由错误处理
  router.onError((error) => {
    console.error('路由错误:', error);
    ElMessage.error('页面加载失败');
  });
}

/**
 * 检查路由权限
 */
export function checkRoutePermission(
  route: any,
  permissions: readonly string[],
  roles: readonly string[]
): boolean {
  // 管理员角色拥有所有权限
  if (roles.includes('admin')) {
    return true;
  }

  // 检查权限
  if (route.meta?.permissions?.length > 0) {
    return route.meta.permissions.some((permission: string) => 
      permissions.includes(permission)
    );
  }

  // 检查角色
  if (route.meta?.roles?.length > 0) {
    return route.meta.roles.some((role: string) => roles.includes(role));
  }

  return true;
} 