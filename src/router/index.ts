import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layouts/Layout.vue';
import { setupRouterGuards } from './guards';

// 基础路由（不需要权限验证）
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录',
      hidden: true
    }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/views/403.vue'),
    meta: {
      title: '403',
      hidden: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/404.vue'),
    meta: {
      title: '404',
      hidden: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '仪表盘',
          icon: 'House',
          affix: true
        }
      }
    ]
  }
];

// 动态路由（需要权限验证）
export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/admin',
    name: 'System',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      roles: ['admin', 'system']
    },
    children: [
      {
        path: 'admin',
        name: 'AdminManagement',
        component: () => import('@/views/system/admin/index.vue'),
        meta: {
          title: '管理员管理',
          icon: 'User',
          permissions: ['admin:view']
        }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          permissions: ['role:view']
        }
      },
      {
        path: 'permission',
        name: 'PermissionManagement',
        component: () => import('@/views/system/permission/index.vue'),
        meta: {
          title: '权限管理',
          icon: 'Lock',
          permissions: ['permission:view']
        }
      },
      {
        path: 'resource',
        name: 'ResourceManagement',
        component: () => import('@/views/system/resource/index.vue'),
        meta: {
          title: '资源管理',
          icon: 'Files',
          permissions: ['resource:view']
        }
      },
      {
        path: 'log',
        name: 'LogManagement',
        component: () => import('@/views/system/log/index.vue'),
        meta: {
          title: '操作日志',
          icon: 'Document',
          permissions: ['log:view']
        }
      }
    ]
  },
  {
    path: '/product',
    component: Layout,
    redirect: '/product/category',
    name: 'Product',
    meta: {
      title: '商品管理',
      icon: 'GoodsFilled',
      roles: ['admin', 'product']
    },
    children: [
      {
        path: 'category',
        name: 'CategoryManagement',
        component: () => import('@/views/product/category/index.vue'),
        meta: {
          title: '商品分类',
          icon: 'Menu',
          permissions: ['category:view']
        }
      },
      {
        path: 'goods',
        name: 'GoodsManagement',
        component: () => import('@/views/product/goods/index.vue'),
        meta: {
          title: '商品管理',
          icon: 'Goods',
          permissions: ['goods:view']
        }
      }
    ]
  },
  // 404页面必须放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior: () => ({ top: 0 })
});

// 设置路由守卫
setupRouterGuards(router);

export default router; 