<template>
  <div v-if="!item.meta?.hidden">
    <!-- 只有一个子路由且不显示父级 -->
    <template v-if="hasOneShowingChild(item.children, item) && (!onlyOneChild.children || (onlyOneChild as any).noShowingChildren) && !item.meta?.alwaysShow">
      <el-menu-item
        :index="resolvePath(onlyOneChild.path)"
        :class="{ 'submenu-title-noDropdown': !isNest }"
      >
        <el-icon v-if="onlyOneChild.meta?.icon">
          <component :is="onlyOneChild.meta.icon" />
        </el-icon>
        <template #title>
          <span>{{ onlyOneChild.meta?.title }}</span>
        </template>
      </el-menu-item>
    </template>

    <!-- 多个子路由或总是显示 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" popper-append-to-body>
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
        :is-nest="true"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { isExternal } from '@/utils/validate'
import type { RouteRecordRaw } from 'vue-router'

interface Props {
  item: RouteRecordRaw
  isNest?: boolean
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  isNest: false,
  basePath: ''
})

const onlyOneChild = ref<RouteRecordRaw>({} as RouteRecordRaw)

/**
 * 判断是否只有一个可显示的子路由
 */
const hasOneShowingChild = (children: RouteRecordRaw[] = [], parent: RouteRecordRaw): boolean => {
  const showingChildren = children.filter(item => {
    if (item.meta?.hidden) {
      return false
    } else {
      // 临时设置为可见子路由
      onlyOneChild.value = item
      return true
    }
  })

  // 当只有一个子路由时，子路由默认显示
  if (showingChildren.length === 1) {
    return true
  }

  // 没有子路由时显示父路由
  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: '', noShowingChildren: true } as any
    return true
  }

  return false
}

/**
 * 解析路径
 */
const resolvePath = (routePath: string): string => {
  if (isExternal(routePath)) {
    return routePath
  }
  if (isExternal(props.basePath)) {
    return props.basePath
  }
  return path.resolve(props.basePath, routePath)
}

// 简单的路径解析工具
const path = {
  resolve: (basePath: string, targetPath: string): string => {
    if (!targetPath) return basePath
    if (targetPath.startsWith('/')) return targetPath
    
    const baseSegments = basePath.split('/').filter(Boolean)
    const targetSegments = targetPath.split('/').filter(Boolean)
    
    const resolvedSegments = [...baseSegments, ...targetSegments]
    return '/' + resolvedSegments.join('/')
  }
}
</script>

<style scoped lang="scss">
.el-menu-item {
  &.is-active {
    background-color: #263445 !important;
  }
}

.submenu-title-noDropdown {
  .el-icon {
    margin-right: 12px;
    margin-left: 0;
  }
}
</style> 