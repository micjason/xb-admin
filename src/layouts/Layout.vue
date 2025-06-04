<template>
  <div class="layout">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside 
        :width="collapse ? '64px' : '200px'" 
        class="layout-sidebar"
      >
        <div class="logo-container">
          <div class="logo-placeholder" v-if="!collapse"></div>
          <div class="logo-mini" v-else></div>
          <div class="logo-text" v-show="!collapse">Mall Admin</div>
        </div>
        
        <!-- 菜单 -->
        <sidebar-menu :is-collapse="collapse" />
      </el-aside>

      <!-- 主体容器 -->
      <el-container class="layout-main">
        <!-- 顶部导航 -->
        <el-header class="layout-header">
          <div class="header-left">
            <el-button
              type="text"
              @click="toggleCollapse"
              class="collapse-btn"
            >
              <el-icon><Menu /></el-icon>
            </el-button>
            <!-- 面包屑 -->
            <el-breadcrumb separator="/" class="breadcrumb">
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbList"
                :key="index"
                :to="index === breadcrumbList.length - 1 ? '' : { path: item.path }"
              >
                {{ item.title }}
              </el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          
          <div class="header-right">
            <!-- 用户信息 -->
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-avatar :size="32" class="user-avatar">
                  {{ userInfo?.username?.charAt(0)?.toUpperCase() || 'U' }}
                </el-avatar>
                <span class="username">{{ userInfo?.username || '未知用户' }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                  <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>

        <!-- 内容区 -->
        <el-main class="layout-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Menu, ArrowDown } from '@element-plus/icons-vue';
import { useAuthStore } from '@/store/modules/auth';
import { usePermissionStore } from '@/store/modules/permission';
import SidebarMenu from '@/components/SidebarMenu.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const permissionStore = usePermissionStore();

// 响应式数据
const collapse = ref(false);

// 计算属性
const userInfo = computed(() => authStore.userInfo);
const menuRoutes = computed(() => permissionStore.routes);
const activeMenu = computed(() => route.path);

// 面包屑
const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title);
  return matched.map(item => ({
    title: item.meta?.title as string,
    path: item.path
  }));
});

// 方法
const toggleCollapse = () => {
  collapse.value = !collapse.value;
};

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中...');
      break;
    case 'changePassword':
      ElMessage.info('修改密码功能开发中...');
      break;
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        });
        
        await authStore.logoutAction();
        router.push('/login');
      } catch (error) {
        // 用户取消退出
      }
      break;
  }
};

// 生命周期
onMounted(() => {
  // 确保权限路由已加载
  permissionStore.generateRoutes();
});
</script>

<style scoped>
.layout {
  height: 100vh;
}

.layout-sidebar {
  background: #304156;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 16px;
  background: #2b3a4b;
  border-bottom: 1px solid #434c5e;
}

.logo-placeholder,
.logo-mini {
  width: 32px;
  height: 32px;
  background: #409eff;
  border-radius: 6px;
  margin-right: 12px;
  flex-shrink: 0;
}

.logo-mini {
  margin-right: 0;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
}

.layout-main {
  background: #f0f2f5;
}

.layout-header {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #e8e8e8;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  font-size: 18px;
  color: #5a6169;
  margin-right: 16px;
}

.breadcrumb {
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f5f5f5;
}

.user-avatar {
  margin-right: 8px;
  background-color: #409eff;
  color: #fff;
}

.username {
  margin-right: 4px;
  font-size: 14px;
  color: #303133;
}

.layout-content {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);
}

/* 侧边栏菜单样式 */
.el-menu {
  border-right: none;
}

.el-menu--collapse {
  width: 64px;
}
</style> 