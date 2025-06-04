<template>
  <div class="dashboard">
    <el-card>
      <div slot="header" class="clearfix">
        <span>仪表盘</span>
      </div>
      <div>
        <h2>欢迎来到商城管理系统</h2>
        <p>当前用户：{{ userInfo?.username || '未知用户' }}</p>
        <p>当前时间：{{ currentTime }}</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/modules/auth';

const authStore = useAuthStore();
const currentTime = ref(new Date().toLocaleString());
let timer: NodeJS.Timeout;

const userInfo = authStore.userInfo;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleString();
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
</style> 