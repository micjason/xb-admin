<template>
  <div v-if="!item.meta?.hidden">
    <!-- 有子菜单且子菜单数量大于1 -->
    <el-sub-menu
      v-if="hasChildren && !onlyOneChild"
      :index="item.path"
      popper-append-to-body
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>

    <!-- 单个菜单项 -->
    <el-menu-item
      v-else
      :index="resolvePath(onlyOneChild?.path || item.path)"
    >
      <el-icon v-if="(onlyOneChild?.meta || item.meta)?.icon">
        <component :is="(onlyOneChild?.meta || item.meta)?.icon" />
      </el-icon>
      <template #title>
        <span>{{ (onlyOneChild?.meta || item.meta)?.title }}</span>
      </template>
    </el-menu-item>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { isExternal } from '@/utils/validate';
import type { RouteRecordRaw } from 'vue-router';

interface Props {
  item: RouteRecordRaw;
  basePath: string;
}

const props = defineProps<Props>();

// 计算属性
const hasChildren = computed(() => {
  return props.item.children && props.item.children.length > 0;
});

const showingChildren = computed(() => {
  return props.item.children?.filter(child => !child.meta?.hidden) || [];
});

const onlyOneChild = computed(() => {
  const children = showingChildren.value;
  
  // 如果只有一个子菜单，且该子菜单没有设置alwaysShow，则直接显示子菜单
  if (children.length === 1 && !props.item.meta?.alwaysShow) {
    return children[0];
  }
  
  // 如果没有子菜单，返回当前菜单
  if (children.length === 0) {
    return { ...props.item, path: '' };
  }
  
  return null;
});

// 方法
const resolvePath = (routePath: string): string => {
  if (isExternal(routePath)) {
    return routePath;
  }
  
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  
  return props.basePath + '/' + routePath;
};
</script>

<style scoped>
.el-sub-menu .el-menu-item {
  min-width: 0;
}

.el-menu-item {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 