<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="true"
    :router="true"
    background-color="#304156"
    text-color="#bfcbd9"
    active-text-color="#409EFF"
  >
    <sidebar-item
      v-for="route in permissionRoutes"
      :key="route.path"
      :item="route"
      :base-path="route.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarItem from './SidebarItem.vue'
import { usePermissionStore } from '@/store/modules/permission'

interface Props {
  isCollapse: boolean
}

defineProps<Props>()

const route = useRoute()
const permissionStore = usePermissionStore()

// 当前激活的菜单
const activeMenu = computed(() => {
  const { meta, path } = route
  if (meta?.activeMenu) {
    return meta.activeMenu as string
  }
  return path
})

// 有权限的路由
const permissionRoutes = computed(() => {
  return permissionStore.routes.filter(route => {
    const hasChildren = route.children && route.children.length > 0;
    const isNotHidden = !route.meta?.hidden;
    return isNotHidden && hasChildren;
  });
})
</script>

<style scoped lang="scss">
.el-menu {
  border-right: none;
}
</style> 