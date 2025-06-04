import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { usePermissionStore } from '@/store/modules/permission';
import { getToken } from '@/utils/token';

// 白名单路由（不需要登录验证的路由）
const whiteList = ['/login', '/404', '/403'];

/**
 * 设置路由守卫
 * @param router Vue Router实例
 */
export function setupRouterGuards(router: Router): void {
  
  // 全局前置守卫
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const permissionStore = usePermissionStore();
    const token = getToken();

    // 设置页面标题
    if (to.meta?.title) {
      document.title = `${to.meta.title} - ${import.meta.env.VITE_APP_TITLE || '商城后台管理系统'}`;
    }

    // 如果有token
    if (token) {
      // 如果已登录但访问登录页，重定向到首页
      if (to.path === '/login') {
        next('/dashboard');
        return;
      }

      // 检查用户信息是否已获取
      if (!authStore.userInfo) {
        try {
          // 初始化认证状态
          await authStore.initAuth();
          
          // 如果用户信息获取成功
          if (authStore.userInfo) {
            // 获取用户权限和角色
            await Promise.all([
              authStore.getUserPermissionsAction(),
              authStore.getUserRolesAction()
            ]);
            
            // 设置权限信息到权限store
            permissionStore.setPermissions(authStore.permissions, authStore.roles);
            permissionStore.setPermissionLoaded(true);
            
            // 生成动态路由
            const accessRoutes = permissionStore.generateRoutes();
            
            // 动态添加路由
            accessRoutes.forEach(route => {
              router.addRoute(route);
            });
            
            next();
          } else {
            // 用户信息获取失败，重置认证状态并跳转登录页
            authStore.resetAuth();
            ElMessage.error('获取用户信息失败，请重新登录');
            next('/login');
          }
        } catch (error) {
          console.error('路由守卫错误:', error);
          authStore.resetAuth();
          ElMessage.error('认证失败，请重新登录');
          next('/login');
        }
      } else {
        // 检查路由权限
        if (to.meta?.permissions && to.meta.permissions.length > 0) {
          const hasPermission = permissionStore.hasAnyPermission(to.meta.permissions);
          if (!hasPermission) {
            ElMessage.error('您没有访问该页面的权限');
            next('/403');
            return;
          }
        }
        
        // 检查角色权限
        if (to.meta?.roles && to.meta.roles.length > 0) {
          const hasRole = to.meta.roles.some(role => permissionStore.hasRole(role));
          if (!hasRole) {
            ElMessage.error('您没有访问该页面的权限');
            next('/403');
            return;
          }
        }
        
        next();
      }
    } else {
      // 无token，检查是否在白名单中
      if (whiteList.includes(to.path)) {
        next();
      } else {
        ElMessage.warning('请先登录');
        next('/login');
      }
    }
  });

  // 全局解析守卫
  router.beforeResolve(async (to, from, next) => {
    // 在这里可以做一些路由解析前的最后检查
    next();
  });

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 路由跳转完成后的处理
    // 可以在这里添加页面访问统计、埋点等逻辑
    console.log(`路由跳转: ${from.path} -> ${to.path}`);
  });

  router.onError((error) => {
    console.error('路由错误:', error);
    ElMessage.error('页面加载失败');
  });
}

/**
 * 检查路由权限
 * @param route 路由对象
 * @param permissions 用户权限列表
 * @param roles 用户角色列表
 */
export function checkRoutePermission(
  route: any,
  permissions: string[],
  roles: string[]
): boolean {
  // 管理员角色拥有所有权限
  if (roles.includes('admin')) {
    return true;
  }

  // 检查权限
  if (route.meta?.permissions && route.meta.permissions.length > 0) {
    return route.meta.permissions.some((permission: string) => 
      permissions.includes(permission)
    );
  }

  // 检查角色
  if (route.meta?.roles && route.meta.roles.length > 0) {
    return route.meta.roles.some((role: string) => roles.includes(role));
  }

  // 没有权限限制的路由，默认允许访问
  return true;
} 