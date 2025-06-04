<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

const authStore = useAuthStore();

// 应用启动时初始化认证状态
onMounted(async () => {
  await authStore.initAuth();
});
</script>

<template>
  <router-view />
</template>

<style scoped>
/* 全局样式可以在这里添加 */
</style>
